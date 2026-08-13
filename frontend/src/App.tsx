import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '@/router';
import { Toaster } from 'sonner';
import { useThemeStore } from '@/store/themeStore';

export const App: React.FC = () => {
  const fetchConfig = useThemeStore((state) => state.fetchConfig);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" theme="dark" richColors />
      <AppRouter />
    </BrowserRouter>
  );
};

export default App;
