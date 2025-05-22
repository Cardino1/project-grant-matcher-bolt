import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '../../lib/stripe';
import { loadStripe } from '@stripe/stripe-js';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormValues>();
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      // Register user
      const { data: authData, error } = await signUp(data.email, data.password);
      
      if (error) {
        setError(error.message || 'Failed to sign up');
        return;
      }
      
      if (!authData?.user?.id) {
        setError('Failed to create user account');
        return;
      }
      
      // After successful registration, redirect to Stripe checkout
      try {
        const session = await createCheckoutSession(authData.user.id);
        
        if (session?.url) {
          window.location.href = session.url;
        } else {
          setError('Failed to create checkout session');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to create checkout session');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-md flex items-start animate-fade-in">
            <AlertCircle className="h-5 w-5 text-error-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="input"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="label">
            Confirm Password
          </label>
          <div className="mt-1">
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="input"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="text-sm">
          <p className="mb-2 text-secondary-600">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
          <p className="text-secondary-600">
            A monthly subscription fee will be required to access the service.
          </p>
        </div>

        <div>
          <button
            type="submit"
            className="btn-primary w-full flex justify-center py-2 px-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign up and subscribe'
            )}
          </button>
        </div>

        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}