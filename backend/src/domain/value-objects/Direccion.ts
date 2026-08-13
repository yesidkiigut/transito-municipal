export interface DireccionProps {
  via: string;
  numero1: string;
  numero2: string;
  barrio: string;
  ciudad: string;
  departamento: string;
}

export class Direccion {
  public readonly via: string;
  public readonly numero1: string;
  public readonly numero2: string;
  public readonly barrio: string;
  public readonly ciudad: string;
  public readonly departamento: string;

  constructor(props: DireccionProps) {
    if (!props.via || !props.ciudad || !props.departamento) {
      throw new Error('La dirección debe contener al menos vía, ciudad y departamento');
    }
    this.via = props.via;
    this.numero1 = props.numero1 || '';
    this.numero2 = props.numero2 || '';
    this.barrio = props.barrio || '';
    this.ciudad = props.ciudad;
    this.departamento = props.departamento;
  }

  public toString(): string {
    return `${this.via} #${this.numero1}-${this.numero2}, ${this.barrio}, ${this.ciudad} - ${this.departamento}`;
  }
}
