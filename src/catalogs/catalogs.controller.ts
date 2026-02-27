import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * CatalogsController
 * ------------------
 * Serves combo/catalog data for the frontend form.
 *
 * Endpoints:
 *   GET /catalogs         — All catalogs
 *   GET /catalogs/:name   — Single catalog by key
 *
 * Available catalog names:
 *   ramo, tipoExperiencia, subramo, cuidaIntegral,
 *   giroNegocio, plan, tipoPlanMed, etapa
 */
@Controller('catalogs')
@UseGuards(JwtAuthGuard)
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) { }

  @Get()
  getAll() {
    return this.catalogsService.getAll();
  }

  @Get(':name')
  getByName(@Param('name') name: string) {
    const catalog = this.catalogsService.getByName(name);
    if (!catalog) {
      throw new NotFoundException(`Catalog '${name}' not found`);
    }
    return catalog;
  }
}
