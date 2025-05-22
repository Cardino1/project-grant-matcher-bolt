import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSupabase } from '../../context/SupabaseContext';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../lib/utils';
import { Grant } from '../../types';
import { ArrowLeft, BookmarkPlus, BookmarkCheck, Calendar, ExternalLink, MapPin, DollarSign, Users, Award } from 'lucide-react';

export default function GrantDetails() {
  const { id } = useParams<{ id: string }>();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  useEffect(() => {
    const fetchGrant = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Fetch grant details
        const { data, error } = await supabase
          .from('grants')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setGrant(data);
        
        // Check if the grant is saved by the user
        if (user) {
          const { data: savedData, error: savedError } = await supabase
            .from('saved_grants')
            .select('*')
            .eq('user_id', user.id)
            .eq('grant_id', id)
            .single();
            
          if (!savedError) {
            setIsSaved(true);
          }
        }
      } catch (error) {
        console.error('Error fetching grant details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGrant();
  }, [id, supabase, user]);
  
  const handleSaveGrant = async () => {
    if (!user || !grant) return;
    
    setSavingStatus('saving');
    
    try {
      if (isSaved) {
        // Unsave the grant
        const { error } = await supabase
          .from('saved_grants')
          .delete()
          .eq('user_id', user.id)
          .eq('grant_id', grant.id);
          
        if (error) throw error;
        
        setIsSaved(false);
      } else {
        // Save the grant
        const { error } = await supabase
          .from('saved_grants')
          .insert({
            user_id: user.id,
            grant_id: grant.id,
          });
          
        if (error) throw error;
        
        setIsSaved(true);
      }
      
      setSavingStatus('success');
    } catch (error) {
      console.error('Error saving/unsaving grant:', error);
      setSavingStatus('error');
    } finally {
      setTimeout(() => {
        setSavingStatus('idle');
      }, 2000);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!grant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Grant Not Found</h2>
        <p className="text-secondary-600 mb-4">
          The grant you're looking for doesn't exist or may have been removed.
        </p>
        <Link to="/grants" className="btn-primary">
          Back to Grants
        </Link>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost mr-4 p-2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold">{grant.title}</h1>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg border border-secondary-200 overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-wrap justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">{grant.organization}</h2>
              
              <div className="flex flex-wrap mt-2 gap-2">
                {grant.art_forms?.map((form, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {form}
                  </span>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleSaveGrant}
              disabled={savingStatus === 'saving'}
              className={`btn flex items-center ${
                isSaved
                  ? 'bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100'
                  : 'bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50'
              }`}
            >
              {savingStatus === 'saving' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
              ) : isSaved ? (
                <BookmarkCheck className="h-4 w-4 mr-2" />
              ) : (
                <BookmarkPlus className="h-4 w-4 mr-2" />
              )}
              {isSaved ? 'Saved' : 'Save Grant'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-secondary-50 p-4 rounded-lg border border-secondary-100">
            {grant.location && (
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-secondary-600 mr-2" />
                <div>
                  <p className="text-sm text-secondary-500 font-medium">Location</p>
                  <p className="text-secondary-900">{grant.location}</p>
                </div>
              </div>
            )}
            
            {grant.application_deadline && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-secondary-600 mr-2" />
                <div>
                  <p className="text-sm text-secondary-500 font-medium">Application Deadline</p>
                  <p className="text-secondary-900">{formatDate(grant.application_deadline)}</p>
                </div>
              </div>
            )}
            
            {grant.funding_amount && (
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-secondary-600 mr-2" />
                <div>
                  <p className="text-sm text-secondary-500 font-medium">Funding Amount</p>
                  <p className="text-secondary-900">{grant.funding_amount}</p>
                </div>
              </div>
            )}
            
            {grant.experience_level && (
              <div className="flex items-center">
                <Users className="h-5 w-5 text-secondary-600 mr-2" />
                <div>
                  <p className="text-sm text-secondary-500 font-medium">Experience Level</p>
                  <p className="text-secondary-900">{grant.experience_level}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="whitespace-pre-line">{grant.description}</p>
          </div>
          
          {grant.grant_link && (
            <div className="mt-8">
              <a
                href={grant.grant_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply for this Grant
              </a>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-primary-50 rounded-lg p-6 border border-primary-100 mb-8">
        <div className="flex items-start">
          <Award className="h-8 w-8 text-primary-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold mb-2">How to Increase Your Chances</h3>
            <ul className="list-disc pl-5 space-y-2 text-secondary-700">
              <li>Thoroughly read the grant guidelines and ensure your application meets all requirements</li>
              <li>Clearly articulate how your project aligns with the grant's mission and goals</li>
              <li>Submit your application well before the deadline to avoid technical issues</li>
              <li>Include a detailed budget that justifies all expenses</li>
              <li>If possible, include examples of your previous work that showcase your artistic abilities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}