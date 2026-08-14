import { IAcuerdoPagoRepository } from '../../../domain/ports/outgoing/IAcuerdoPagoRepository';

export class ConsultarAcuerdosCiudadanoUseCase {
  constructor(private readonly acuerdoPagoRepository: IAcuerdoPagoRepository) {}

  public async executeByCiudadano(ciudadanoId: string): Promise<any[]> {
    return this.acuerdoPagoRepository.findByCiudadanoId(ciudadanoId);
  }

  public async executeById(id: string): Promise<any> {
    const acuerdo = await this.acuerdoPagoRepository.findById(id);
    if (!acuerdo) {
      throw new Error(`Acuerdo de pago con ID o código ${id} no fue encontrado.`);
    }
    return acuerdo;
  }

  public async executeByPlaca(placa: string): Promise<any[]> {
    return this.acuerdoPagoRepository.findByPlaca(placa);
  }

  public async executeList(filtros?: { estado?: string; pagina?: number; limite?: number }): Promise<any> {
    return this.acuerdoPagoRepository.findAll(filtros);
  }
}
