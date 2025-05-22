import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSupabase } from '../../context/SupabaseContext';
import { formatDate } from '../../lib/utils';
import { SavedGrant } from '../../types';
import { Link } from 'react-router-dom';
import { UserCircle, CreditCard, BookmarkIcon, Calendar, MapPin, Trash2 } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  
  const [savedGrants, setSavedGrants] = useState<SavedGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSavedGrants = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('saved_grants')
          .select(`
            id,
            user_id,
            grant_id,
            created_at,
            grant:grants(*)
          `)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setSavedGrants(data || []);
      } catch (error) {
        console.error('Error fetching saved grants:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedGrants();
  }, [user, supabase]);
  
  const handleUnsaveGrant = async (savedGrantId: string) => {
    if (!user) return;
    
    setDeleteLoading(savedGrantId);
    
    try {
      const { error } = await supabase
        .from('saved_grants')
        .delete()
        .eq('id', savedGrantId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setSavedGrants(savedGrants.filter(grant => grant.id !== savedGrantId));
    } catch (error) {
      console.error('Error removing saved grant:', error);
    } finally {
      setDeleteLoading(null);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg border border-secondary-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-4">
                <UserCircle className="h-20 w-20 text-secondary-400 mb-4" />
                <h2 className="text-xl font-semibold">{user?.email?.split('@')[0]}</h2>
                <p className="text-secondary-600">{user?.email}</p>
              </div>
              
              <div className="border-t border-secondary-200 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <CreditCard className="h-5 w-5 text-secondary-500 mr-2" />
                  Subscription
                </h3>
                <div className="bg-success-50 text-success-800 px-3 py-2 rounded-md flex items-center">
                  <div className="h-2 w-2 rounded-full bg-success-500 mr-2"></div>
                  <span className="text-sm font-medium">Active</span>
                </div>
                
                <div className="mt-4 text-sm text-secondary-600">
                  <p className="mb-1">Next billing date: June 15, 2025</p>
                  <p>Monthly subscription: $9.99</p>
                </div>
              </div>
              
              <div className="border-t border-secondary-200 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-3">Account Settings</h3>
                <button className="btn-outline w-full justify-center mb-2">
                  Change Password
                </button>
                <button className="btn-ghost w-full justify-center text-error-600 hover:text-error-700 hover:bg-error-50">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-secondary-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BookmarkIcon className="h-5 w-5 text-primary-600 mr-2" />
                Saved Grants
              </h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : savedGrants.length > 0 ? (
                <div className="space-y-4">
                  {savedGrants.map((savedGrant) => (
                    <div key={savedGrant.id} className="flex flex-col border border-secondary-200 rounded-lg p-4 hover:border-primary-300 transition-all">
                      <div className="flex justify-between">
                        <Link to={`/grants/${savedGrant.grant_id}`} className="block mb-1">
                          <h3 className="text-lg font-medium text-secondary-900 hover:text-primary-700">
                            {savedGrant.grant.title}
                          </h3>
                        </Link>
                        <button
                          onClick={() => handleUnsaveGrant(savedGrant.id)}
                          className="text-secondary-400 hover:text-error-500 transition-colors"
                          disabled={deleteLoading === savedGrant.id}
                          aria-label="Remove from saved grants"
                        >
                          {deleteLoading === savedGrant.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      
                      <p className="text-sm text-secondary-600 mb-2">{savedGrant.grant.organization}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {savedGrant.grant.art_forms?.slice(0, 3).map((form, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {form}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap justify-between text-sm mt-2">
                        {savedGrant.grant.location && (
                          <div className="flex items-center text-secondary-600 mr-4">
                            <MapPin className="h-4 w-4 mr-1" />
                            {savedGrant.grant.location}
                          </div>
                        )}
                        {savedGrant.grant.application_deadline && (
                          <div className="flex items-center text-secondary-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            Deadline: {formatDate(savedGrant.grant.application_deadline)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-secondary-50 rounded-lg">
                  <BookmarkIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No saved grants yet</h3>
                  <p className="text-secondary-600 mb-4 max-w-md mx-auto">
                    Start exploring and save grants you're interested in to keep track of them here.
                  </p>
                  <Link to="/grants" className="btn-primary">
                    Explore Grants
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}