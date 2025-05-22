import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function StripeRedirect() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying subscription status...');
  
  useEffect(() => {
    const checkSubscription = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        // Wait a moment to ensure Stripe webhook has processed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setMessage('Subscription verified. Redirecting to dashboard...');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error checking subscription:', error);
        setMessage('Failed to verify subscription. Please try logging in again.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };
    
    checkSubscription();
  }, [user, authLoading, navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <Loader2 className="h-10 w-10 text-primary-600 animate-spin mb-4" />
      <h2 className="text-xl font-semibold mb-2">Processing Your Subscription</h2>
      <p className="text-secondary-600 max-w-md">{message}</p>
    </div>
  );
}