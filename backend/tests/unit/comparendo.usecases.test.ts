import { ImponerComparendoUseCase } from '../../src/application/use-cases/comparendo/ImponerComparendoUseCase';
import { IComparendoRepository } from '../../src/domain/ports/outgoing/IComparendoRepository';
import { ILicenciaRepository } from '../../src/domain/ports/outgoing/ILicenciaRepository';
import { Comparendo } from '../../src/domain/entities/Comparendo';
import { Licencia } from '../../src/domain/entities/Licencia';

class MockComparendoRepo implements IComparendoRepository {
  public comparendos: Comparendo[] = [];
  async save(c: Comparendo) { this.comparendos.push(c); return c; }
  async findByNumero(num: string) { return this.comparendos.find(c => c.numeroComparendo === num) || null; }
  async findAll() { return { data: [], total: 0, pagina: 1, limite: 10, totalPaginas: 1 }; }
  async update(c: Comparendo) { return c; }
  async guardarResolucion() { return {}; }
}

class MockLicenciaRepo implements ILicenciaRepository {
  public licencias: Licencia[] = [];
  async save(l: Licencia) { this.licencias.push(l); return l; }
  async findByNumero(num: string) { return null; }
  async findByCiudadanoId(cId: string) { return this.licencias.filter(l => l.ciudadanoId === cId); }
  async findVigentePorCiudadanoYCategoria() { return null; }
  async update(l: Licencia) { return l; }
}

describe('Imposición de Comparendos y Deducción Automática de Puntos', () => {
  let comparendoRepo: MockComparendoRepo;
  let licenciaRepo: MockLicenciaRepo;

  beforeEach(() => {
    comparendoRepo = new MockComparendoRepo();
    licenciaRepo = new MockLicenciaRepo();
  });

  it('debe descontar puntos de la licencia e incluso suspender si llega a 0 puntos por comparendo grado 4 (-10 puntos)', async () => {
    // Licencia con 8 puntos restantes
    const licencia = new Licencia({
      id: 'lic-1',
      numeroLicencia: 'LIC-123',
      ciudadanoId: 'ciudadano-1',
      categoria: 'B1',
      fechaExpedicion: new Date(),
      fechaVencimiento: new Date('2030-01-01'),
      puntosAcumulados: 8,
    });
    await licenciaRepo.save(licencia);

    const useCase = new ImponerComparendoUseCase(comparendoRepo, licenciaRepo);
    await useCase.execute({
      placaVehiculo: 'ABC-123',
      ciudadanoId: 'ciudadano-1',
      tipoInfraccionId: 'INF-D02',
      lugarInfraccion: 'Av El Poblado #45',
      agenteTransitoId: 'AGT-007',
      gradoInfraccion: 4, // Descuento de 10 puntos
      valorMulta: 1200000,
    });

    expect(licencia.puntosAcumulados).toBe(0);
    expect(licencia.estado).toBe('SUSPENDIDA');
  });
});
