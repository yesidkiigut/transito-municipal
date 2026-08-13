import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '@/router';
import { Toaster } from 'sonner';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" theme="dark" richColors />
      <AppRouter />
    </BrowserRouter>
  );
};

export default App;
