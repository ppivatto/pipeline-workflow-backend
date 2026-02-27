import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';

export interface AgenteInfo {
  nombreCompleto: string;
  promotor: string | null;
  territorio: string | null;
  oficina: string | null;
  canal: string | null;
  centro: string | null;
}

/**
 * AxaAgenteService
 * ----------------
 * Implements: 014pipelineconexionmd
 *
 * Authenticates against AXA OAuth2 using MD (Maestro Distribuidores)
 * credentials and fetches agent details from AXA_API_DETALLE_AGENT.
 *
 * Agent key is zero-padded to 11 chars: AGT + 8-digit number → e.g. AGT00001234
 *
 * Required env vars:
 *   AXA_BASE_URL              — OAuth2 base URL
 *   AXA_MD_USERNAME           — MD OAuth2 user (grant_type=password)
 *   AXA_MD_PASSWORD           — MD OAuth2 password
 *   AXA_MD_SCOPE              — MD OAuth2 scope
 *   AXA_API_DETALLE_AGENT_URL — Base URL for the agent detail service
 */
@Injectable()
export class AxaAgenteService {
  private readonly logger = new Logger(AxaAgenteService.name);
  private readonly httpsAgent: https.Agent;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    this.httpsAgent = new https.Agent({ rejectUnauthorized: isProd });
  }

  /**
   * Looks up an agent by their numeric clave (e.g. "1234").
   * Returns full agent structure or throws NotFoundException if not found.
   */
  async getAgente(claveRaw: string): Promise<AgenteInfo> {
    const agenteUrl = this.config.get<string>('AXA_API_DETALLE_AGENT_URL');
    const oauthUrl = this.config.get<string>('AXA_BASE_URL');
    const mdUser = this.config.get<string>('AXA_MD_USERNAME');
    const mdPass = this.config.get<string>('AXA_MD_PASSWORD');
    const mdScope = this.config.get<string>('AXA_MD_SCOPE');

    if (!agenteUrl) {
      throw new InternalServerErrorException(
        'AXA_API_DETALLE_AGENT_URL is not configured. Set it in .env.',
      );
    }
    if (!oauthUrl || !mdUser || !mdPass) {
      throw new InternalServerErrorException(
        'AXA MD credentials not configured. Set AXA_MD_USERNAME, AXA_MD_PASSWORD, AXA_MD_SCOPE in .env.',
      );
    }

    // ── Step 1: Pad clave to 11-char format ──────────────────────────
    const padding = '00000000';
    const cve = 'AGT' + padding.slice(0, 8 - claveRaw.length);
    const claveAgente = cve + claveRaw;

    if (claveAgente.length !== 11) {
      throw new NotFoundException('Agente no existe');
    }

    // ── Step 2: Get MD OAuth2 token (grant_type=password) ────────────
    let mdToken: string;
    try {
      const tokenRes = await firstValueFrom(
        this.http.post<{ access_token: string }>(
          `${oauthUrl}/api/oauth2`,
          new URLSearchParams({
            grant_type: 'password',
            username: mdUser,
            password: mdPass,
            ...(mdScope ? { scope: mdScope } : {}),
          }).toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            httpsAgent: this.httpsAgent,
          },
        ),
      );
      mdToken = tokenRes.data.access_token;
    } catch (err: any) {
      this.logger.error('MD OAuth2 token request failed', err?.message);
      throw new InternalServerErrorException(`MD auth failed: ${err?.message}`);
    }

    // ── Step 3: Fetch agent details ──────────────────────────────────
    const bodyAgent = {
      axaHeaderReq: {
        ramo: 'finanzas',
        usuario: 'MXS00000000A',
        UUID: '9404d7c0-3e67-4518-8749-0a936ec87dce',
        fechaHora: new Date().toISOString(),
        sistemaId: 'salud',
      },
      data: {
        claveAgente,
        incluirEstructura: true,
        incluirCamposAdicionales: true,
        incluirDirecciones: true,
      },
    };

    let agentData: any;
    try {
      const agentRes = await firstValueFrom(
        this.http.post<{ data: any }>(`${agenteUrl}/obtenerDetallesAgente`, bodyAgent, {
          headers: {
            Authorization: `Bearer ${mdToken}`,
            'Content-Type': 'application/json',
          },
          httpsAgent: this.httpsAgent,
        }),
      );
      agentData = agentRes.data?.data;
    } catch (err: any) {
      this.logger.error('Agent detail request failed', err?.message);
      throw new NotFoundException('Agente no existe');
    }

    if (!agentData) throw new NotFoundException('Agente no existe');

    // ── Step 4: Parse and return ─────────────────────────────────────
    const tipoPersona: string = agentData.tipoPersona ?? '';
    const nombreCompleto =
      tipoPersona === 'PERSONA MORAL'
        ? agentData.razonSocial
        : `${agentData.nombre ?? ''} ${agentData.apellidoPaterno ?? ''} ${agentData.apellidoMaterno ?? ''}`.trim();

    const estructura: { nivel: string; razonSocial: string }[] =
      agentData.estructuraOrganizacional ?? [];

    const find = (nivel: string) =>
      estructura.find((e) => e.nivel === nivel)?.razonSocial ?? null;

    return {
      nombreCompleto,
      canal: agentData.canalDistribucion ?? null,
      centroProduccion: find('centroProduccion'),
      oficina: find('oficina'),
      promotor: find('promotor'),
      territorio: find('territorio'),
    } as any;
  }
}
