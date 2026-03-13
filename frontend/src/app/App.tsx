import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/theme-provider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" attribute="class">
      <AuthProvider>
        <ComplaintProvider>
          <RouterProvider router={router} />
          <Toaster />
        </ComplaintProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}