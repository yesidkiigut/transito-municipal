import React from 'react';

export const metadata = {
  title: 'Tránsito Municipal API',
  description: 'API REST y Motor de Liquidación de Tránsito Municipal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#020617', color: '#f8fafc' }}>
        {children}
      </body>
    </html>
  );
}
