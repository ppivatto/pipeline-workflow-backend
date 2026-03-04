import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CatalogEntry {
  key: string;
  value_es: string;
  value_en: string;
  value_pt: string;
}

/**
 * CatalogsService
 * ---------------
 * Serves combo/catalog data as key-value pairs per language.
 * Data is persisted in the Catalog table (name → JSON entries).
 * On first boot, if the DB is empty, it seeds the default catalogs.
 */
@Injectable()
export class CatalogsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) { }

  /** Seed defaults on first boot if DB has no catalogs */
  async onModuleInit() {
    const count = await this.prisma.catalog.count();
    if (count === 0) {
      await this.seedDefaults();
    }
  }

  /** Apply fallback: if any language is empty, copy from the first non-empty */
  private applyFallback(entries: CatalogEntry[]): CatalogEntry[] {
    return entries.map(e => {
      const fallback = e.value_es || e.value_en || e.value_pt || '';
      return {
        key: e.key,
        value_es: e.value_es || fallback,
        value_en: e.value_en || fallback,
        value_pt: e.value_pt || fallback,
      };
    });
  }

  async getAll(): Promise<Record<string, CatalogEntry[]>> {
    const rows = await this.prisma.catalog.findMany();
    const result: Record<string, CatalogEntry[]> = {};
    for (const row of rows) {
      result[row.name] = JSON.parse(row.entries);
    }
    return result;
  }

  async getByName(name: string): Promise<CatalogEntry[] | null> {
    const row = await this.prisma.catalog.findUnique({ where: { name } });
    return row ? JSON.parse(row.entries) : null;
  }

  async update(name: string, entries: CatalogEntry[]): Promise<CatalogEntry[]> {
    const cleaned = this.applyFallback(entries);
    await this.prisma.catalog.upsert({
      where: { name },
      create: { name, entries: JSON.stringify(cleaned) },
      update: { entries: JSON.stringify(cleaned) },
    });
    return cleaned;
  }

  async delete(name: string): Promise<boolean> {
    try {
      await this.prisma.catalog.delete({ where: { name } });
      return true;
    } catch {
      return false;
    }
  }

  // ─── Seed helpers ───────────────────────────────────────

  /** Build multilingual entries from [key, es, en, pt] tuples */
  private ml(rows: [string, string, string, string][]): CatalogEntry[] {
    return rows.map(([key, es, en, pt]) => ({ key, value_es: es, value_en: en, value_pt: pt }));
  }

  /** Auto-keyed names (same value for all languages — names don't translate) */
  private buildAutoKeyedMl(values: string[]): CatalogEntry[] {
    return values.map((v, i) => ({ key: String(i + 1), value_es: v, value_en: v, value_pt: v }));
  }

  /** Seed the default catalog data into the DB */
  private async seedDefaults(): Promise<void> {
    const defaults: Record<string, CatalogEntry[]> = {
      ramo: this.ml([
        ['1', 'Autos', 'Auto', 'Automóvel'],
        ['2', 'Daños', 'Property & Casualty', 'Danos'],
        ['3', 'Salud', 'Health', 'Saúde'],
        ['4', 'Vida', 'Life', 'Vida'],
      ]),
      tipoExperiencia: this.ml([
        ['1', 'Propia', 'Own', 'Própria'],
        ['2', 'Global', 'Global', 'Global'],
      ]),
      subramo: this.ml([
        ['1', 'Múltiple Empresarial (MEM)', 'Multi-Business (MEM)', 'Múltiplo Empresarial (MEM)'],
        ['2', 'L. Com Transportes', 'L. Com Transport', 'L. Com Transportes'],
        ['3', 'L. Com Responsabilidad Civil', 'L. Com Liability', 'L. Com Responsabilidade Civil'],
        ['4', 'L. Com Ramos Técnicos', 'L. Com Technical Lines', 'L. Com Ramos Técnicos'],
        ['5', 'L. Est. Transportes', 'L. Est. Transport', 'L. Est. Transportes'],
        ['6', 'L. Est. Responsabilidad Civil', 'L. Est. Liability', 'L. Est. Responsabilidade Civil'],
        ['7', 'L. Est Ramos Técnicos', 'L. Est. Technical Lines', 'L. Est. Ramos Técnicos'],
        ['8', 'Obras de Arte', 'Fine Arts', 'Obras de Arte'],
        ['9', 'Aviación', 'Aviation', 'Aviação'],
        ['10', 'Financieras & Cyber', 'Financial & Cyber', 'Financeiras & Cyber'],
        ['11', 'Property', 'Property', 'Property'],
        ['12', 'Parámetro', 'Parametric', 'Paramétrico'],
        ['13', 'Otro', 'Other', 'Outro'],
      ]),
      cuidaIntegral: this.ml([
        ['1', 'Si', 'Yes', 'Sim'],
        ['2', 'No', 'No', 'Não'],
      ]),
      giroNegocio: this.ml([
        ['1', 'Flotillas utilitarias', 'Utility Fleets', 'Frotas utilitárias'],
        ['2', 'Flotillas de empleados', 'Employee Fleets', 'Frotas de funcionários'],
        ['3', 'Flotillas transportistas de carga propia (carga A y B)', 'Own Cargo Transport (A & B)', 'Frotas transp. carga própria (A e B)'],
        ['4', 'Plan Piso y Traslado', 'Floor Plan & Transfer', 'Plano Piso e Traslado'],
        ['5', 'Flotillas Transportistas Carga Propia (carga C y D)', 'Own Cargo Transport (C & D)', 'Frotas transp. carga própria (C e D)'],
        ['6', 'Flotillas Transportistas Carga Terceros (carga A y B)', 'Third Party Cargo (A & B)', 'Frotas transp. carga terceiros (A e B)'],
        ['7', 'Flotillas transportistas de carga terceros (carga C y D)', 'Third Party Cargo (C & D)', 'Frotas transp. carga terceiros (C e D)'],
        ['8', 'Otro', 'Other', 'Outro'],
      ]),
      plan: this.ml([
        ['1', 'Cuidado Integral Salud', 'Integral Care Health', 'Cuidado Integral Saúde'],
        ['2', 'Cuidado Integral Plus', 'Integral Care Plus', 'Cuidado Integral Plus'],
      ]),
      tipoPlanMed: this.ml([
        ['1', 'Planmed Hibrido', 'Planmed Hybrid', 'Planmed Híbrido'],
        ['2', 'Planmed Estandar', 'Planmed Standard', 'Planmed Padrão'],
        ['3', 'Planmed Esencial', 'Planmed Essential', 'Planmed Essencial'],
        ['4', 'Planmed Optimo', 'Planmed Optimal', 'Planmed Ótimo'],
      ]),
      etapa: this.ml([
        ['1', 'Creado', 'Created', 'Criado'],
        ['2', 'Prospección', 'Prospecting', 'Prospecção'],
        ['3', 'Propuesta Entregada', 'Proposal Delivered', 'Proposta Entregue'],
        ['4', 'Emisión', 'Emission', 'Emissão'],
        ['5', 'Cierre', 'Closing', 'Fechamento'],
      ]),
      seQuedo: this.ml([
        ['1', 'Si', 'Yes', 'Sim'],
        ['2', 'No', 'No', 'Não'],
        ['3', 'En etapa de negociación', 'In negotiation', 'Em negociação'],
      ]),
      estatus: this.ml([
        ['1', 'Ganado', 'Won', 'Ganha'],
        ['2', 'En proceso de emisión', 'In emission process', 'Em processo de emissão'],
        ['3', 'Cancelación', 'Cancellation', 'Cancelamento'],
        ['4', 'No Ganada', 'Lost', 'Não Ganha'],
        ['5', 'Rechazo de AXA', 'AXA Rejection', 'Rejeição AXA'],
      ]),
      motivoNoGanado: this.ml([
        ['1', 'Costo', 'Cost', 'Custo'],
        ['2', 'Condiciones', 'Terms', 'Condições'],
        ['3', 'Tiempo de cotización', 'Quote Turnaround', 'Tempo de cotação'],
        ['4', 'Esquema de compensación', 'Compensation Scheme', 'Esquema de compensação'],
        ['5', 'Fidelización', 'Loyalty', 'Fidelização'],
        ['6', 'Oferta de Valor', 'Value Proposition', 'Oferta de Valor'],
        ['7', 'Cuenta Cruzada', 'Cross-Account', 'Conta Cruzada'],
      ]),
      responsableSuscripcion: this.buildAutoKeyedMl([
        'Octavio Coria Bernal', 'Adriana Suarez Lopez', 'Thelma Guarneros Angeles', 'Alan Lomeli Farelas',
        'Ricardo Farrera Herrera', 'Francisco Mancera Gomez', 'Jorge Eduardo Najera', 'Jesus Alejandro De la Rosa',
        'Iris Perez Sosa', 'Jennifer Hernandez Ugalde', 'Roberto Gonzalez', 'Ruth Aviña Noriega',
        'Marcos Diaz de Leon', 'Francisco Gutierrez', 'Cesilia Irabien', 'Maria Gpe. Martinez',
        'Hugo Salas Lopez', 'Pedro Cabrera', 'Ricardo Martinez Mendieta', 'Israel Miranda',
        'Patricia Morenobaca', 'Cristian Ramos', 'Estela Cardenas', 'Maria del Rocio Ramirez',
        'Armando Ernesto Silerio', 'Margarita Morales', 'Rolando Benitez', 'Cristina Corona Lopez',
        'Veronica Ruiz', 'Perla Ivette Vergara', 'Jair Villarreal Robles', 'Marco Rios',
        'Diana Fimbres', 'Carla Lopez', 'Socorro Mendoza', 'Jesus Rubio',
        'Mauricio Murillo', 'Leonso Caravantes', 'Jorge Olvera Lorena', 'Juana Lizbeth Salinas',
        'Elizabeth Hernandez Bonilla', 'Luis Ibañez Galan', 'Ofelia Romero Perez', 'Alma Rosa Alcantara Elizalde',
        'Nayeli Moreno Montoya', 'Roberto Angel Villareal Martinez', 'Flor Lizbeth Castillo Martinez',
        'Mariana del Carmen Montes de Oca Zuñiga', 'Juana Monserrat Torres Morales', 'Eduardo de la Luz Martinez',
        'Sebastian Zorilla Alcantar', 'Iñaki Azkasibar Garcia', 'Miguel Angel Martinez Vargas',
        'Miguel Angel Lira Quirarte', 'Horacio Linares Rodriguez', 'Luis Alberto Pacheco Sosa',
        'Ian Alejandro Goytia Ruiz', 'Ana Carent Acosta Rodriguez', 'Alejandro Madrazo Mancebo',
        'Rey Isaac Cortes Garcia', 'Gerardo Garza Guajardo', 'Ana Karen Segovia Gonzalez',
        'Karla Gabriela Cano Rosas', 'Juan Francisco Alonzo Medrano', 'Irwing Cabrera Rodriguez',
        'Oswaldo Amezcua Garcia', 'Teresita de Jesus Lopez Gutierrez', 'Reyna Ugalde Montes',
        'Monica Esmeralda Ibarra Hernandez', 'Ruben Francisco Irigoyen Burgos', 'Carmen Lucia Amarillas Armienta',
        'Leopoldo de Jesus Armenta Vazquez', 'Carlos Alejandro Contreras', 'Karen Mascareno Dominguez',
        'Pamela Pinzon Espinosa', 'Lucia Alejandra Ibarra Ramirez', 'Jaime Miguel Sanchez Correa',
        'Abdi Areli Lopez Espino', 'Juan Victor Guzman Gutierrez', 'Itzel Estela Roman Santillan',
        'Horacio Chavarria Chavarria', 'Oscar Jafet Juarez Manzano', 'Danya Liliane Loredo Romero',
        'Roxana Janelli Cuellar Villalpando', 'Ana Patricia Paredes Crisanto', 'Nancy Lisbetl Manrique Briceño',
        'Scheherezada Garcia Galindo', 'Omar Daniel Maya Muñoz', 'Yonathan Yair Diaz Sierra',
        'Carlos Padilla Hernandez', 'Bernardo Garza Sanchez', 'Trinidad Villanueva Villela',
        'Miguel angel Castillo Sarabia', 'Yesenia Guadalupe Rodriguez Casanova', 'Sebastian Gonzalez Curiel',
        'Alejandro Rafael Garcia Santos', 'Monica Sanchez Gauna', 'Isabel Alicia Verdugo Mendez',
        'Enrique Lopez Parra', 'Nereyda Carolina Miller Guerra', 'Carlos Roman Gil Cinco',
        'Jorge Ulises Villalba Moreno', 'Yenisei Lomeli Rodales', 'Andres Noyola Santiago',
        'Maria Del Rosario Ramos Cardenas', 'Edgar Octavio Moncayo Ortiz', 'Vanessa Riancho Gonzalez',
        'Javier Munguia Sanchez', 'Gerardo Arturo Avila Vega', 'Jesus Armando Sansores Medina',
        'Jorge Hernandez Castellanos', 'Jesus Auren Islas Maya', 'Cesar Augusto Mendoza Vazquez',
        'Daniel Adolfo Sevilla Castillo', 'Victor Hugo Hernandez', 'Mariana Olvera Garduño',
        'Ricardo Salvador Flores', 'Maria Guadalupe Morales Gallegos', 'Diana Idalia Sanchez Sierra',
        'Oscar Anuar Cuevas Morales', 'Elisana Perea Romero', 'Alfredo de Anda',
        'Carolina Argüelles', 'Hugo Perez', 'Ozirys Valeriano', 'Roberto Manzano',
        'Yesenia Michaus', 'Vargas Tellez Jonathan Kevin', 'Vergara Calderon Perla Ivet',
        'Villanueva Villela Trinidad', 'Villarreal Robles Gerardo Jair', 'Zorrilla Alcantar Sebastian',
      ]),
      aseguradoraGanadora: this.ml([
        ['1', 'AXA Seguros', 'AXA Insurance', 'AXA Seguros'],
        ['2', 'Afirme', 'Afirme', 'Afirme'],
        ['3', 'Aig', 'Aig', 'Aig'],
        ['4', 'Allianz', 'Allianz', 'Allianz'],
        ['5', 'Ana Seguros', 'Ana Seguros', 'Ana Seguros'],
        ['6', 'Argos', 'Argos', 'Argos'],
        ['7', 'Aserta', 'Aserta', 'Aserta'],
        ['8', 'Atlas', 'Atlas', 'Atlas'],
        ['9', 'Banorte', 'Banorte', 'Banorte'],
        ['10', 'Bbva', 'Bbva', 'Bbva'],
        ['11', 'Bx+', 'Bx+', 'Bx+'],
        ['12', 'Chubb', 'Chubb', 'Chubb'],
        ['13', 'General De Seguros', 'General De Seguros', 'General De Seguros'],
        ['14', 'GNP', 'GNP', 'GNP'],
        ['15', 'Hdi', 'Hdi', 'Hdi'],
        ['16', 'Inbursa', 'Inbursa', 'Inbursa'],
        ['17', 'Mapfre', 'Mapfre', 'Mapfre'],
        ['18', 'Metlife', 'Metlife', 'Metlife'],
        ['19', 'Monterrey Ney York Life', 'Monterrey New York Life', 'Monterrey New York Life'],
        ['20', 'Otra', 'Other', 'Outra'],
        ['21', 'Prevem', 'Prevem', 'Prevem'],
        ['22', 'Primero Seguros', 'Primero Seguros', 'Primero Seguros'],
        ['23', 'Qualitas', 'Qualitas', 'Qualitas'],
        ['24', 'Sisnova', 'Sisnova', 'Sisnova'],
        ['25', 'Sura', 'Sura', 'Sura'],
        ['26', 'Zurich', 'Zurich', 'Zurich'],
      ]),
    };

    // Insert all catalogs in a single transaction
    await this.prisma.$transaction(
      Object.entries(defaults).map(([name, entries]) =>
        this.prisma.catalog.create({
          data: { name, entries: JSON.stringify(entries) },
        }),
      ),
    );
    console.log('📦 Default catalogs seeded into database.');
  }
}
