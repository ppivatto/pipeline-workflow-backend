import { Controller, Get, Put, Delete, Param, Body, NotFoundException, UseGuards } from '@nestjs/common';
import { CatalogsService, CatalogEntry } from './catalogs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * CatalogsController
 * ------------------
 * Serves and manages combo/catalog data for the frontend forms.
 *
 * Endpoints:
 *   GET    /catalogs         — All catalogs
 *   GET    /catalogs/:name   — Single catalog by key
 *   PUT    /catalogs/:name   — Update catalog values
 *   DELETE /catalogs/:name   — Delete a catalog
 */
@Controller('catalogs')
@UseGuards(JwtAuthGuard)
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) { }

  @Get()
  async getAll() {
    return this.catalogsService.getAll();
  }

  @Get(':name')
  async getByName(@Param('name') name: string) {
    const catalog = await this.catalogsService.getByName(name);
    if (!catalog) {
      throw new NotFoundException(`Catalog '${name}' not found`);
    }
    return catalog;
  }

  @Put(':name')
  async update(@Param('name') name: string, @Body() body: { entries: CatalogEntry[] }) {
    return this.catalogsService.update(name, body.entries);
  }

  @Delete(':name')
  async remove(@Param('name') name: string) {
    const deleted = await this.catalogsService.delete(name);
    if (!deleted) {
      throw new NotFoundException(`Catalog '${name}' not found`);
    }
    return { deleted: true };
  }
}
