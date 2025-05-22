import { Outlet } from 'react-router-dom';
import { PageX } from '../ui/Logo';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const content = children || <Outlet />;
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <PageX className="w-24 h-24" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-secondary-900">
          Welcome to PAGEX
        </h2>
        <p className="mt-2 text-center text-sm text-secondary-600">
          Discover art grants and residencies tailored for you
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {content}
        </div>
      </div>
    </div>
  );
}