import { RegistrarCiudadanoUseCase } from '../../src/application/use-cases/ciudadano/RegistrarCiudadanoUseCase';
import { ConsultarCiudadanoPorDocumentoUseCase } from '../../src/application/use-cases/ciudadano/ConsultarCiudadanoPorDocumentoUseCase';
import { ICiudadanoRepository } from '../../src/domain/ports/outgoing/ICiudadanoRepository';
import { Ciudadano } from '../../src/domain/entities/Ciudadano';

// In-Memory Repository Mock for clean unit testing
class MockCiudadanoRepository implements ICiudadanoRepository {
  private ciudadanos: Ciudadano[] = [];

  async save(ciudadano: Ciudadano): Promise<Ciudadano> {
    this.ciudadanos.push(ciudadano);
    return ciudadano;
  }

  async findById(id: string): Promise<Ciudadano | null> {
    return this.ciudadanos.find(c => c.id === id) || null;
  }

  async findByDocumento(numeroDocumento: string): Promise<Ciudadano | null> {
    return this.ciudadanos.find(c => c.numeroDocumento === numeroDocumento) || null;
  }

  async update(ciudadano: Ciudadano): Promise<Ciudadano> {
    const index = this.ciudadanos.findIndex(c => c.id === ciudadano.id);
    if (index !== -1) this.ciudadanos[index] = ciudadano;
    return ciudadano;
  }

  async findAll(filtros: any): Promise<any> {
    return { data: this.ciudadanos, total: this.ciudadanos.length, pagina: 1, limite: 10, totalPaginas: 1 };
  }
}

describe('Casos de Uso de Ciudadano (Hexagonal Test)', () => {
  let repository: MockCiudadanoRepository;

  beforeEach(() => {
    repository = new MockCiudadanoRepository();
  });

  it('debe registrar un ciudadano correctamente', async () => {
    const registrarUseCase = new RegistrarCiudadanoUseCase(repository);
    const dto = {
      tipoDocumento: 'CC' as const,
      numeroDocumento: '1098765432',
      nombres: 'Carlos',
      apellidos: 'Mendoza',
      fechaNacimiento: '1995-05-15',
      correo: 'carlos@test.com',
      telefono: '3101234567',
      direccion: {
        via: 'Calle 10',
        numero1: '20',
        numero2: '30',
        barrio: 'El Poblado',
        ciudad: 'Medellín',
        departamento: 'Antioquia',
      },
    };

    const ciudadano = await registrarUseCase.execute(dto);
    expect(ciudadano.numeroDocumento).toBe('1098765432');
    expect(ciudadano.nombreCompleto).toBe('Carlos Mendoza');
  });

  it('debe lanzar excepcion al intentar registrar documento duplicado', async () => {
    const registrarUseCase = new RegistrarCiudadanoUseCase(repository);
    const dto = {
      tipoDocumento: 'CC' as const,
      numeroDocumento: '1098765432',
      nombres: 'Carlos',
      apellidos: 'Mendoza',
      fechaNacimiento: '1995-05-15',
      correo: 'carlos@test.com',
      telefono: '3101234567',
      direccion: { via: 'Calle 10', numero1: '', numero2: '', barrio: '', ciudad: 'Medellín', departamento: 'Antioquia' },
    };

    await registrarUseCase.execute(dto);
    await expect(registrarUseCase.execute(dto)).rejects.toThrow("ya se encuentra registrado");
  });
});
