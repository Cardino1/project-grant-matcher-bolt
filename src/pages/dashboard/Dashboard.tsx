import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSupabase } from '../../context/SupabaseContext';
import { formatDate } from '../../lib/utils';
import { Grant } from '../../types';
import { BookmarkIcon, Calendar, FileSearch, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const [userName, setUserName] = useState<string>('');
  const [recentGrants, setRecentGrants] = useState<Grant[]>([]);
  const [savedGrants, setSavedGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Get the first part of the email (before the @) to use as the name
        const email = user.email || '';
        const namePart = email.split('@')[0];
        
        // Capitalize the first letter
        setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        
        // Fetch recent grants
        const { data: recentData, error: recentError } = await supabase
          .from('grants')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (recentError) throw recentError;
        setRecentGrants(recentData || []);
        
        // Fetch saved grants
        const { data: savedData, error: savedError } = await supabase
          .from('saved_grants')
          .select('grant_id, grants(*)')
          .eq('user_id', user.id)
          .limit(3);
          
        if (savedError) throw savedError;
        
        const savedGrantsData = savedData?.map(item => item.grants) || [];
        setSavedGrants(savedGrantsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, supabase]);
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Welcome back, {userName || 'Artist'}!</h1>
      <p className="text-secondary-600 mb-8">Here are your personalized grant recommendations</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-600" />
            Recent Grants
          </h2>
          
          {loading ? (
            <div className="text-secondary-500">Loading recent grants...</div>
          ) : recentGrants.length > 0 ? (
            <div className="space-y-4">
              {recentGrants.map((grant) => (
                <Link key={grant.id} to={`/grants/${grant.id}`}>
                  <div className="card hover:border-primary-300 transition-all">
                    <h3 className="text-lg font-semibold mb-1">{grant.title}</h3>
                    <p className="text-sm text-secondary-600 mb-2">{grant.organization}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {grant.art_forms?.slice(0, 3).map((form, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {form}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-secondary-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {grant.location || 'Various Locations'}
                      </div>
                      <div className="text-secondary-600">
                        {grant.application_deadline ? `Deadline: ${formatDate(grant.application_deadline)}` : 'No deadline'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              <Link to="/grants" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
                View all grants
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          ) : (
            <div className="text-secondary-500">No recent grants available</div>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <BookmarkIcon className="h-5 w-5 mr-2 text-primary-600" />
            Saved Grants
          </h2>
          
          {loading ? (
            <div className="text-secondary-500">Loading saved grants...</div>
          ) : savedGrants.length > 0 ? (
            <div className="space-y-4">
              {savedGrants.map((grant) => (
                <Link key={grant.id} to={`/grants/${grant.id}`}>
                  <div className="card hover:border-primary-300 transition-all">
                    <h3 className="text-lg font-semibold mb-1">{grant.title}</h3>
                    <p className="text-sm text-secondary-600 mb-2">{grant.organization}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {grant.art_forms?.slice(0, 3).map((form, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {form}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-secondary-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {grant.location || 'Various Locations'}
                      </div>
                      <div className="text-secondary-600">
                        {grant.application_deadline ? `Deadline: ${formatDate(grant.application_deadline)}` : 'No deadline'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              <Link to="/profile" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
                View all saved grants
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          ) : (
            <div className="bg-secondary-50 rounded-lg p-6 text-center">
              <FileSearch className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No saved grants yet</h3>
              <p className="text-secondary-600 mb-4">
                Start saving grants you're interested in to keep track of them here.
              </p>
              <Link to="/grants" className="btn-primary">
                Explore Grants
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-primary-50 rounded-lg p-6 border border-primary-100 animate-slide-up">
        <h2 className="text-xl font-semibold mb-4">Discover Grants and Residencies</h2>
        <p className="text-secondary-700 mb-4">
          Find opportunities tailored to your artistic practice. Use our comprehensive filtering tools to discover grants and residencies that match your needs.
        </p>
        <Link to="/grants" className="btn-primary">
          Search Grants
        </Link>
      </div>
    </div>
  );
}