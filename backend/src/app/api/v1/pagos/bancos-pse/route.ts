import { NextResponse } from 'next/server';

export const BANCOS_COLOMBIA_PSE = [
  { codigo: '1007', nombre: 'BANCOLOMBIA', tipo: 'Bancos' },
  { codigo: '1051', nombre: 'DAVIVIENDA', tipo: 'Bancos' },
  { codigo: '1001', nombre: 'BANCO DE BOGOTA', tipo: 'Bancos' },
  { codigo: '1013', nombre: 'BBVA COLOMBIA', tipo: 'Bancos' },
  { codigo: '1023', nombre: 'BANCO DE OCCIDENTE', tipo: 'Bancos' },
  { codigo: '1002', nombre: 'BANCO POPULAR', tipo: 'Bancos' },
  { codigo: '1040', nombre: 'BANCO AGRARIO DE COLOMBIA', tipo: 'Bancos' },
  { codigo: '1052', nombre: 'BANCO AV VILLAS', tipo: 'Bancos' },
  { codigo: '1006', nombre: 'BANCO ITAU', tipo: 'Bancos' },
  { codigo: '1062', nombre: 'BANCO FALABELLA', tipo: 'Bancos' },
  { codigo: '1061', nombre: 'BANCO COOPCENTRAL', tipo: 'Bancos' },
  { codigo: '1066', nombre: 'BANCO CAJA SOCIAL', tipo: 'Bancos' },
  { codigo: '1032', nombre: 'BANCO GNB SUDAMERIS', tipo: 'Bancos' },
  { codigo: '1019', nombre: 'SCOTIABANK COLPATRIA', tipo: 'Bancos' },
  { codigo: '1507', nombre: 'NEQUI (Bancolombia)', tipo: 'Billeteras' },
  { codigo: '1551', nombre: 'DAVIPLATA (Davivienda)', tipo: 'Billeteras' },
  { codigo: '1070', nombre: 'LULO BANK', tipo: 'Bancos Digitales' },
  { codigo: '1071', nombre: 'NU COLOMBIA (NuBank)', tipo: 'Bancos Digitales' },
  { codigo: '1072', nombre: 'DALE! (Grupo Aval)', tipo: 'Billeteras' },
  { codigo: '1073', nombre: 'MOVII', tipo: 'Billeteras' },
  { codigo: '1074', nombre: 'RAPPIPAY', tipo: 'Bancos Digitales' },
];

export async function GET() {
  return NextResponse.json(BANCOS_COLOMBIA_PSE);
}
