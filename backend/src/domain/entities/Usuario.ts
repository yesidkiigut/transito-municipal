export type Rol = 'ADMIN' | 'FUNCIONARIO' | 'CIUDADANO';

export class Usuario {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly nombre: string,
    public readonly rol: Rol,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  public esAdmin(): boolean {
    return this.rol === 'ADMIN';
  }

  public esFuncionario(): boolean {
    return this.rol === 'FUNCIONARIO' || this.rol === 'ADMIN';
  }
}
