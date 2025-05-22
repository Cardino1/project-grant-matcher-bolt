import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  const { user, isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <FileQuestion className="h-24 w-24 text-secondary-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-secondary-900 mb-2">Page Not Found</h1>
        <p className="text-secondary-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {user ? (
          <div className="space-y-4">
            <Link
              to={isAdmin ? '/admin' : '/'}
              className="btn-primary w-full block py-3"
            >
              Go to Dashboard
            </Link>
            {!isAdmin && (
              <Link
                to="/grants"
                className="btn-outline w-full block py-3"
              >
                Browse Grants
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Link
              to="/login"
              className="btn-primary w-full block py-3"
            >
              Go to Login
            </Link>
            <Link
              to="/register"
              className="btn-outline w-full block py-3"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}