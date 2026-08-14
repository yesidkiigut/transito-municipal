export interface IAcuerdoPagoRepository {
  findById(id: string): Promise<any | null>;
  findByCiudadanoId(ciudadanoId: string): Promise<any[]>;
  findByPlaca(placa: string): Promise<any[]>;
  findAll(filtros?: { estado?: string; pagina?: number; limite?: number }): Promise<{
    data: any[];
    total: number;
    pagina: number;
    limite: number;
  }>;
}
