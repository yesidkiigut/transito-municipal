import { ExpedirLicenciaNuevaUseCase } from '../../src/application/use-cases/licencia/ExpedirLicenciaNuevaUseCase';
import { ILicenciaRepository } from '../../src/domain/ports/outgoing/ILicenciaRepository';
import { ICiudadanoRepository } from '../../src/domain/ports/outgoing/ICiudadanoRepository';
import { Licencia } from '../../src/domain/entities/Licencia';
import { Ciudadano } from '../../src/domain/entities/Ciudadano';
import { Direccion } from '../../src/domain/value-objects/Direccion';

class MockLicenciaRepo implements ILicenciaRepository {
  public licencias: Licencia[] = [];
  async save(l: Licencia) { this.licencias.push(l); return l; }
  async findByNumero(num: string) { return this.licencias.find(l => l.numeroLicencia === num) || null; }
  async findByCiudadanoId(cId: string) { return this.licencias.filter(l => l.ciudadanoId === cId); }
  async findVigentePorCiudadanoYCategoria(cId: string, cat: any) {
    return this.licencias.find(l => l.ciudadanoId === cId && l.categoria === cat && l.estado === 'VIGENTE') || null;
  }
  async update(l: Licencia) { return l; }
}

class MockCiudadanoRepo implements ICiudadanoRepository {
  public ciudadanos: Ciudadano[] = [];
  async save(c: Ciudadano) { this.ciudadanos.push(c); return c; }
  async findById(id: string) { return this.ciudadanos.find(c => c.id === id) || null; }
  async findByDocumento(doc: string) { return null; }
  async update(c: Ciudadano) { return c; }
  async findAll() { return { data: [], total: 0, pagina: 1, limite: 10, totalPaginas: 1 }; }
}

describe('Reglas de Negocio en Licencias de Conducción', () => {
  let licenciaRepo: MockLicenciaRepo;
  let ciudadanoRepo: MockCiudadanoRepo;

  beforeEach(() => {
    licenciaRepo = new MockLicenciaRepo();
    ciudadanoRepo = new MockCiudadanoRepo();
  });

  it('debe rechazar la expedicion si el ciudadano no cumple la edad minima para la categoria C1 (18 años)', async () => {
    // Ciudadano de 15 años
    const menor = new Ciudadano({
      id: 'ciud-15',
      tipoDocumento: 'CC',
      numeroDocumento: '10998877',
      nombres: 'Joven',
      apellidos: 'Conductor',
      fechaNacimiento: new Date('2011-05-10'),
      correo: 'joven@test.com',
      telefono: '300000',
      direccion: new Direccion({ via: 'Cll 5', numero1: '', numero2: '', barrio: '', ciudad: 'Medellin', departamento: 'Ant' }),
    });
    await ciudadanoRepo.save(menor);

    const useCase = new ExpedirLicenciaNuevaUseCase(licenciaRepo, ciudadanoRepo);

    await expect(useCase.execute({ ciudadanoId: 'ciud-15', categoria: 'C1' }))
      .rejects.toThrow('Se requieren mínimo 18 años');
  });

  it('debe otorgar 12 puntos por defecto al expedir licencia', async () => {
    const adulto = new Ciudadano({
      id: 'ciud-25',
      tipoDocumento: 'CC',
      numeroDocumento: '10998877',
      nombres: 'Adulto',
      apellidos: 'Conductor',
      fechaNacimiento: new Date('2000-01-01'),
      correo: 'adulto@test.com',
      telefono: '300000',
      direccion: new Direccion({ via: 'Cll 5', numero1: '', numero2: '', barrio: '', ciudad: 'Medellin', departamento: 'Ant' }),
    });
    await ciudadanoRepo.save(adulto);

    const useCase = new ExpedirLicenciaNuevaUseCase(licenciaRepo, ciudadanoRepo);
    const lic = await useCase.execute({ ciudadanoId: 'ciud-25', categoria: 'B1' });

    expect(lic.puntosAcumulados).toBe(12);
    expect(lic.estado).toBe('VIGENTE');
  });
});
