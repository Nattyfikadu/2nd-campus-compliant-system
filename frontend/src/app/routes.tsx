import { createBrowserRouter } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { AnonymousComplaintPage } from './pages/AnonymousComplaintPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';

export const router = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  { path: '/anonymous', element: <AnonymousComplaintPage /> },
  { path: '/thank-you', element: <ThankYouPage /> },
  { path: '/track', element: <TrackComplaintPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/register/:role', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/dashboard', element: <DashboardLayout /> },
  { path: '/change-password', element: <ChangePasswordPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
