import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';

interface AdminLoginFormValues {
  email: string;
  password: string;
}

export default function AdminLogin() {
  const { signIn } = useAuth();
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginFormValues>();
  
  const onSubmit = async (data: AdminLoginFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: signInError } = await signIn(data.email, data.password);
      
      if (signInError) {
        setError(signInError.message || 'Failed to sign in');
        return;
      }
      
      // Check if the user is an admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('email', data.email)
        .single();
        
      if (userError) {
        setError('Failed to verify admin status');
        return;
      }
      
      if (!userData?.is_admin) {
        setError('You do not have admin privileges');
        return;
      }
      
      navigate('/admin');
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
      
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
              autoComplete="current-password"
              className="input"
              {...register('password', {
                required: 'Password is required',
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
            )}
          </div>
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
                Signing in...
              </>
            ) : (
              'Sign in as Admin'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}