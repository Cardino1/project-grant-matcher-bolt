import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function CheckoutSuccess() {
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
        <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-secondary-900 mb-4">Payment Successful!</h1>
        <p className="text-secondary-600 mb-6">
          Thank you for subscribing to PAGEX. You now have full access to our grants and residencies database.
        </p>
        <Link
          to="/"
          className="btn-primary w-full py-3"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}