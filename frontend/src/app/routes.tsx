import { createBrowserRouter, redirect } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardLayout } from './layouts/DashboardLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/register/:role',
    element: <RegisterPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
  },
  {
    path: '*',
    loader: () => redirect('/'),
  },
]);
