import { Injectable } from '@nestjs/common';

/**
 * CatalogsService
 * ---------------
 * Serves static combo/catalog data for the "Alta de Cuentas" form.
 *
 * Currently hardcoded as defined in the AXA requirements.
 * TODO: Replace with live AXA API calls when endpoints are available.
 */
@Injectable()
export class CatalogsService {
  private readonly catalogs: Record<string, string[]> = {
    ramo: ['Autos', 'Daños', 'Salud', 'Vida'],

    tipoExperiencia: ['PROPIA', 'GLOBAL'],

    subramo: [
      'Múltiple Empresarial (MEM)',
      'L. Com Transportes',
      'L. Com Responsabilidad Civil',
      'L. Com Ramos Tecnicos',
      'L. Est. Transportes',
      'L. Est. Responsabilidad Civil',
      'L. Est Ramos Tecnicos',
      'Obras de Arte',
      'Aviación',
      'Financieras & Cyber',
      'Property',
      'Parametro',
      'Otro',
    ],

    cuidaIntegral: ['SI', 'NO'],

    giroNegocio: [
      'Flotillas utilitarias',
      'Flotillas de empleados',
      'Flotillas transportistas de carga propia (carga A y B)',
      'Plan Piso y Traslado',
      'Flotillas Transportistas Carga Propia (carga C y D)',
      'Flotillas Transportistas Carga Terceros (carga A y B)',
      'Flotillas transportistas de carga terceros (carga C y D)',
      'Otro',
    ],

    plan: ['Cuidado Integral Salud', 'Cuidado Integral Plus'],

    tipoPlanMed: [
      'Planmed Hibrido',
      'Planmed Estandar',
      'Planmed Esencial',
      'Planmed Optimo',
    ],

    etapa: ['Creado', 'Prospección'],
  };

  getAll(): Record<string, string[]> {
    return this.catalogs;
  }

  getByName(name: string): string[] | null {
    return this.catalogs[name] ?? null;
  }
}
