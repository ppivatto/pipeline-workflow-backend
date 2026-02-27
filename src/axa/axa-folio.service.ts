import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';

/**
 * AxaFolioService
 * ---------------
 * Implements: 014consultafoliocuentaspipeline
 *
 * Queries API_BEAWARE for the number of existing PIPE accounts,
 * then generates the next folio in format PIPE0000000001.
 *
 * Requires: BEAWARE_BASE_URL in .env
 */
@Injectable()
export class AxaFolioService {
  private readonly logger = new Logger(AxaFolioService.name);
  private readonly httpsAgent: https.Agent;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    this.httpsAgent = new https.Agent({ rejectUnauthorized: isProd });
  }

  /**
   * Generates the next pipeline folio.
   * Format: PIPE + zero-padded sequential number (10 digits)
   * Example: PIPE0000000001, PIPE0000000002, ...
   */
  async getNextFolio(authtoken: string): Promise<string> {
    const beawareUrl = this.config.get<string>('BEAWARE_BASE_URL');

    if (!beawareUrl) {
      throw new InternalServerErrorException(
        'BEAWARE_BASE_URL is not configured. Set it in .env to enable folio generation.',
      );
    }

    try {
      const response = await firstValueFrom(
        this.http.get<{ pagination: { size: number } }>(
          `${beawareUrl}/v11/cuenta/get/?filtrobuscar=PIPE0&pagina=1&cantidad=1000`,
          {
            headers: { Authorization: `Bearer ${authtoken}` },
            httpsAgent: this.httpsAgent,
          },
        ),
      );

      const size = response.data.pagination?.size ?? 0;
      const complemento = '0000000000';
      const longitudfolio = String(size);
      const padding = complemento.slice(0, 10 - longitudfolio.length);
      const folio = `PIPE${padding}${size + 1}`;

      this.logger.log(`Generated folio: ${folio}`);
      return folio;
    } catch (err: any) {
      this.logger.error('Failed to generate folio', err?.message);
      throw new InternalServerErrorException(`Folio generation failed: ${err?.message}`);
    }
  }

  /**
   * Calculates ramo flags from a ramo value string.
   * Implements: 014reglasramopipe (pure logic, no external calls)
   *
   * Ramo mapping:
   *   "12" → Autos       → valramo=1, valramo1=0, valramo2=0
   *   "11" → Vida        → valramo=0, valramo1=1, valramo2=0
   *   "22"|"14" → Daños  → valramo=0, valramo1=0, valramo2=1
   *   other → all 0
   */
  getRamoFlags(valor_ramo: string): { valramo: number; valramo1: number; valramo2: number } {
    const val = (valor_ramo ?? '').toString();

    if (val === '12') return { valramo: 1, valramo1: 0, valramo2: 0 };
    if (val === '11') return { valramo: 0, valramo1: 1, valramo2: 0 };
    if (val === '22' || val === '14') return { valramo: 0, valramo1: 0, valramo2: 1 };
    return { valramo: 0, valramo1: 0, valramo2: 0 };
  }
}
