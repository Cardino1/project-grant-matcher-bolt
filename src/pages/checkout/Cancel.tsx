import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function CheckoutCancel() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center animate-fade-in">
        <XCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-secondary-900 mb-4">Payment Cancelled</h1>
        <p className="text-secondary-600 mb-6">
          Your subscription payment was cancelled. You need an active subscription to access PAGEX's grant database.
        </p>
        <div className="space-y-3">
          <Link
            to="/register"
            className="btn-primary w-full py-3 block"
          >
            Try Again
          </Link>
          <Link
            to="/login"
            className="btn-ghost w-full py-3 block"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}