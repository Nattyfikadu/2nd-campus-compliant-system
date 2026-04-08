import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <RouterProvider router={router} />
        <Toaster />
      </ComplaintProvider>
    </AuthProvider>
  );
}