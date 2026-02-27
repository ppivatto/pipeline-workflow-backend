import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AxaService } from './axa.service';
import { AxaFolioService } from './axa-folio.service';
import { AxaAgenteService } from './axa-agente.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * AxaController
 * -------------
 * BFF proxy layer for AXA internal APIs. All routes require a valid BFF JWT.
 *
 * Endpoints:
 *   GET /axa/token              — Debug: verify AXA OAuth2 connectivity
 *   GET /axa/folio              — Generate next PIPE account folio
 *   GET /axa/ramo-flags?ramo=X  — Get ramo visibility flags
 *   GET /axa/agente/:clave      — Look up agent in Maestro Distribuidores
 */
@Controller('axa')
@UseGuards(JwtAuthGuard)
export class AxaController {
  constructor(
    private readonly axaService: AxaService,
    private readonly axaFolioService: AxaFolioService,
    private readonly axaAgenteService: AxaAgenteService,
  ) { }

  /** Debug / health-check — verify AXA connectivity. Remove or restrict in production. */
  @Get('token')
  async getToken() {
    const token = await this.axaService.getToken();
    return { access_token: token };
  }

  /**
   * Generates the next pipeline account folio using BeAware.
   * Requires: BEAWARE_BASE_URL configured in .env
   */
  @Get('folio')
  async getFolio(@Request() req: any) {
    // Pass the BFF JWT as the BeAware authtoken
    const authtoken = req.headers.authorization?.replace('Bearer ', '') ?? '';
    const folio = await this.axaFolioService.getNextFolio(authtoken);
    return { folio };
  }

  /**
   * Returns ramo visibility flags for UI logic.
   * Pure computation — no external call needed.
   * @query ramo  Ramo code (e.g. "12", "11", "22", "14")
   */
  @Get('ramo-flags')
  getRamoFlags(@Query('ramo') ramo: string) {
    return this.axaFolioService.getRamoFlags(ramo ?? '');
  }

  /**
   * Fetches agent details from AXA Maestro Distribuidores.
   * Throws 404 with "Agente no existe" if not found.
   * Requires: AXA_MD_USERNAME, AXA_MD_PASSWORD, AXA_API_DETALLE_AGENT_URL in .env
   */
  @Get('agente/:clave')
  async getAgente(@Param('clave') clave: string) {
    return this.axaAgenteService.getAgente(clave);
  }
}
