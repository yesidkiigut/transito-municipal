export type TipoConexionHassql = 'WEB_SERVICE_REST' | 'SOAP_XML' | 'SQL_SERVER_DIRECT' | 'ARCHIVO_ASOBANCARIA_2001';

export interface ConfiguracionHassqlProps {
  id?: string;
  servidorHost: string;
  puerto: number;
  baseDatos: string;
  usuario: string;
  password: string;
  tipoConexion: TipoConexionHassql;
  tokenApi?: string | null;
  endpointRecaudo: string;
  horaCierreFiscal: string;
  activo: boolean;
  autoSincronizar: boolean;
  formatoAsobancaria: boolean;
  codigoEntidadHassql: string;
  cuentaBancariaRecaudo: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ConfiguracionHassql {
  public readonly id?: string;
  public servidorHost: string;
  public puerto: number;
  public baseDatos: string;
  public usuario: string;
  public password: string;
  public tipoConexion: TipoConexionHassql;
  public tokenApi?: string | null;
  public endpointRecaudo: string;
  public horaCierreFiscal: string;
  public activo: boolean;
  public autoSincronizar: boolean;
  public formatoAsobancaria: boolean;
  public codigoEntidadHassql: string;
  public cuentaBancariaRecaudo: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ConfiguracionHassqlProps) {
    this.id = props.id;
    this.servidorHost = props.servidorHost || 'https://api.hassql.com.co';
    this.puerto = props.puerto || 1433;
    this.baseDatos = props.baseDatos || 'HASSQL_TRANSITO_MUNICIPAL';
    this.usuario = props.usuario || 'usr_transito_sync';
    this.password = props.password || 'Hassql_2026_Secure!';
    this.tipoConexion = props.tipoConexion || 'WEB_SERVICE_REST';
    this.tokenApi = props.tokenApi || 'hsql_tok_live_987654321_transito';
    this.endpointRecaudo = props.endpointRecaudo || 'https://api.hassql.com.co/v1/recaudo/transito';
    this.horaCierreFiscal = props.horaCierreFiscal || '23:59';
    this.activo = props.activo ?? true;
    this.autoSincronizar = props.autoSincronizar ?? true;
    this.formatoAsobancaria = props.formatoAsobancaria ?? true;
    this.codigoEntidadHassql = props.codigoEntidadHassql || 'MUN-TRANSITO-001';
    this.cuentaBancariaRecaudo = props.cuentaBancariaRecaudo || 'CTA-CTE-123456789-BANCOLOMBIA';
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static crearDefecto(): ConfiguracionHassql {
    return new ConfiguracionHassql({
      servidorHost: 'https://api.hassql.com.co',
      puerto: 1433,
      baseDatos: 'HASSQL_TRANSITO_MUNICIPAL',
      usuario: 'usr_transito_sync',
      password: 'Hassql_2026_Secure!',
      tipoConexion: 'WEB_SERVICE_REST',
      tokenApi: 'hsql_tok_live_987654321_transito',
      endpointRecaudo: 'https://api.hassql.com.co/v1/recaudo/transito',
      horaCierreFiscal: '23:59',
      activo: true,
      autoSincronizar: true,
      formatoAsobancaria: true,
      codigoEntidadHassql: 'MUN-TRANSITO-001',
      cuentaBancariaRecaudo: 'CTA-CTE-123456789-BANCOLOMBIA',
    });
  }
}
