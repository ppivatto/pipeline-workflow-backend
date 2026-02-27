import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';

/**
 * AxaService
 * ---------
 * Centralizes all communication with AXA's internal APIs.
 *
 * Token lifecycle:
 *   - Tokens are cached in memory until 90% of their TTL elapses.
 *   - On expiry the next call automatically refreshes.
 *
 * To add a new AXA integration:
 *   1. Inject AxaService into your NestJS service.
 *   2. Call `this.axaService.request(path, method, data)`.
 */
@Injectable()
export class AxaService {
  private readonly logger = new Logger(AxaService.name);

  // --- Token cache ---
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  // --- Reusable HTTPS agent that tolerates self-signed certs in non-prod ---
  private readonly httpsAgent: https.Agent;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: isProd,   // strict only in production
    });
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Returns a valid AXA access token (cached).
   */
  async getToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }
    return this.fetchToken();
  }

  /**
   * Generic proxy to any AXA API path.
   * Automatically injects the Bearer token.
   */
  async request<T = any>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
  ): Promise<T> {
    const token = await this.getToken();
    const baseUrl = this.config.get<string>('AXA_BASE_URL');
    const url = `${baseUrl}${path}`;

    try {
      const response = await firstValueFrom(
        this.http.request<T>({
          url,
          method,
          data,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          httpsAgent: this.httpsAgent,
        }),
      );
      return response.data;
    } catch (err: any) {
      this.logger.error(`AXA request failed: ${method} ${url}`, err?.message);
      throw new InternalServerErrorException(`AXA request failed: ${err?.message}`);
    }
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private async fetchToken(): Promise<string> {
    const baseUrl = this.config.get<string>('AXA_BASE_URL');
    const clientId = this.config.get<string>('AXA_CLIENT_ID');
    const clientSecret = this.config.get<string>('AXA_CLIENT_SECRET');
    const grantType = this.config.get<string>('AXA_GRANT_TYPE', 'client_credentials');
    const tokenUrl = `${baseUrl}/api/oauth2`;

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        'AXA credentials not configured. Set AXA_CLIENT_ID and AXA_CLIENT_SECRET in .env',
      );
    }

    try {
      // OAuth2 client_credentials flow — adjust body shape when AXA provides docs
      const response = await firstValueFrom(
        this.http.post<{ access_token: string; expires_in?: number }>(
          tokenUrl,
          new URLSearchParams({
            grant_type: grantType,
            client_id: clientId,
            client_secret: clientSecret,
          }).toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            httpsAgent: this.httpsAgent,
          },
        ),
      );

      const { access_token, expires_in = 3600 } = response.data;
      this.cachedToken = access_token;
      // Expire cache at 90% of TTL to avoid using a just-expired token
      this.tokenExpiresAt = Date.now() + expires_in * 900;

      this.logger.log('AXA token obtained successfully');
      return access_token;
    } catch (err: any) {
      this.logger.error('Failed to obtain AXA token', err?.message);
      throw new InternalServerErrorException(`AXA auth failed: ${err?.message}`);
    }
  }
}
