import { RegistrarVehiculoUseCase } from '../../src/application/use-cases/vehiculo/RegistrarVehiculoUseCase';
import { TransferirVehiculoUseCase } from '../../src/application/use-cases/vehiculo/TransferirVehiculoUseCase';
import { IVehiculoRepository } from '../../src/domain/ports/outgoing/IVehiculoRepository';
import { ICiudadanoRepository } from '../../src/domain/ports/outgoing/ICiudadanoRepository';
import { Vehiculo } from '../../src/domain/entities/Vehiculo';
import { Ciudadano } from '../../src/domain/entities/Ciudadano';
import { Direccion } from '../../src/domain/value-objects/Direccion';

class MockVehiculoRepo implements IVehiculoRepository {
  public vehiculos: Vehiculo[] = [];
  public tieneComparendos = false;

  async save(vehiculo: Vehiculo): Promise<Vehiculo> {
    this.vehiculos.push(vehiculo);
    return vehiculo;
  }
  async findByPlaca(placa: string): Promise<Vehiculo | null> {
    return this.vehiculos.find(v => v.placa === placa) || null;
  }
  async findById(id: string): Promise<Vehiculo | null> {
    return this.vehiculos.find(v => v.id === id) || null;
  }
  async update(vehiculo: Vehiculo): Promise<Vehiculo> {
    const idx = this.vehiculos.findIndex(v => v.id === vehiculo.id);
    if (idx !== -1) this.vehiculos[idx] = vehiculo;
    return vehiculo;
  }
  async findAll(): Promise<any> {
    return { data: this.vehiculos, total: this.vehiculos.length, pagina: 1, limite: 10, totalPaginas: 1 };
  }
  async tieneComparendosPendientes(placa: string): Promise<boolean> {
    return this.tieneComparendos;
  }
}

class MockCiudadanoRepo implements ICiudadanoRepository {
  public ciudadanos: Ciudadano[] = [];
  async save(c: Ciudadano) { this.ciudadanos.push(c); return c; }
  async findById(id: string) { return this.ciudadanos.find(c => c.id === id) || null; }
  async findByDocumento(doc: string) { return this.ciudadanos.find(c => c.numeroDocumento === doc) || null; }
  async update(c: Ciudadano) { return c; }
  async findAll() { return { data: this.ciudadanos, total: 0, pagina: 1, limite: 10, totalPaginas: 1 }; }
}

describe('Casos de Uso Vehiculo y Reglas de Negocio', () => {
  let vehiculoRepo: MockVehiculoRepo;
  let ciudadanoRepo: MockCiudadanoRepo;

  beforeEach(() => {
    vehiculoRepo = new MockVehiculoRepo();
    ciudadanoRepo = new MockCiudadanoRepo();
  });

  it('debe bloquear la transferencia de propiedad si el vehículo tiene comparendos pendientes', async () => {
    const c1 = new Ciudadano({ id: 'c1', tipoDocumento: 'CC', numeroDocumento: '111', nombres: 'A', apellidos: 'B', fechaNacimiento: new Date('1990-01-01'), correo: 'a@test.com', telefono: '123', direccion: new Direccion({ via: 'Cll 1', numero1: '', numero2: '', barrio: '', ciudad: 'Medellin', departamento: 'Ant' }) });
    const c2 = new Ciudadano({ id: 'c2', tipoDocumento: 'CC', numeroDocumento: '222', nombres: 'C', apellidos: 'D', fechaNacimiento: new Date('1990-01-01'), correo: 'b@test.com', telefono: '123', direccion: new Direccion({ via: 'Cll 1', numero1: '', numero2: '', barrio: '', ciudad: 'Medellin', departamento: 'Ant' }) });

    await ciudadanoRepo.save(c1);
    await ciudadanoRepo.save(c2);

    const registrarUseCase = new RegistrarVehiculoUseCase(vehiculoRepo, ciudadanoRepo);
    await registrarUseCase.execute({
      placa: 'XYZ-999',
      marca: 'Toyota',
      linea: 'Corolla',
      modelo: 2023,
      cilindraje: 2000,
      color: 'Gris',
      tipoVehiculo: 'AUTOMOVIL',
      claseServicio: 'PARTICULAR',
      numeroMotor: 'MOT123',
      numeroChasis: 'CHA123',
      fechaMatricula: '2023-01-01',
      propietarioInicialCiudadanoId: 'c1',
    });

    // Marcar que tiene comparendos
    vehiculoRepo.tieneComparendos = true;

    const transferirUseCase = new TransferirVehiculoUseCase(vehiculoRepo, ciudadanoRepo);
    await expect(transferirUseCase.execute('XYZ-999', { nuevoPropietarioCiudadanoId: 'c2' }))
      .rejects.toThrow('No se puede realizar el traspaso');
  });
});
