import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../../context/SupabaseContext';
import { formatDate, truncateText } from '../../lib/utils';
import { GrantFilters, Grant, ArtForm, ExperienceLevel } from '../../types';
import { Search, Calendar, Filter, ChevronsUpDown, MapPin, ExternalLink } from 'lucide-react';

const artForms: ArtForm[] = [
  'Visual Arts',
  'Performing Arts',
  'Music',
  'Literature',
  'Film & Media',
  'Digital Arts',
  'Multidisciplinary',
  'Sculpture',
  'Photography',
  'Design',
  'Crafts',
];

const experienceLevels: ExperienceLevel[] = [
  'Emerging',
  'Mid-Career',
  'Established',
  'Student',
  'All Levels',
];

export default function Grants() {
  const { supabase } = useSupabase();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GrantFilters>({});
  const [sortBy, setSortBy] = useState<string>('deadline');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const fetchGrants = async () => {
      setLoading(true);
      
      try {
        let query = supabase.from('grants').select('*');
        
        // Apply search filter
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,organization.ilike.%${filters.search}%`);
        }
        
        // Apply art form filter
        if (filters.artForms && filters.artForms.length > 0) {
          query = query.containedBy('art_forms', filters.artForms);
        }
        
        // Apply location filter
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }
        
        // Apply experience level filter
        if (filters.experienceLevel) {
          query = query.eq('experience_level', filters.experienceLevel);
        }
        
        // Apply sorting
        if (sortBy === 'deadline') {
          query = query.order('application_deadline', { ascending: true, nullsLast: true });
        } else if (sortBy === 'title') {
          query = query.order('title', { ascending: true });
        } else if (sortBy === 'recent') {
          query = query.order('created_at', { ascending: false });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setGrants(data || []);
      } catch (error) {
        console.error('Error fetching grants:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGrants();
  }, [supabase, filters, sortBy]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };
  
  const handleArtFormChange = (form: string) => {
    const currentForms = filters.artForms || [];
    
    if (currentForms.includes(form)) {
      setFilters({
        ...filters,
        artForms: currentForms.filter(f => f !== form),
      });
    } else {
      setFilters({
        ...filters,
        artForms: [...currentForms, form],
      });
    }
  };
  
  const handleExperienceLevelChange = (level: string) => {
    setFilters({
      ...filters,
      experienceLevel: filters.experienceLevel === level ? undefined : level,
    });
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, location: e.target.value });
  };
  
  const clearFilters = () => {
    setFilters({});
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Grants & Residencies</h1>
        <button
          className="btn-outline flex items-center md:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className={`lg:col-span-1 lg:block ${showFilters ? 'block' : 'hidden'}`}>
          <div className="bg-white shadow-sm rounded-lg border border-secondary-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                className="text-sm text-primary-600 hover:text-primary-700"
                onClick={clearFilters}
              >
                Clear all
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="search" className="label">
                  Search
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-secondary-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="input pl-10"
                    placeholder="Search grants..."
                    value={filters.search || ''}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="label mb-2">Art Forms</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {artForms.map((form) => (
                    <div key={form} className="flex items-center">
                      <input
                        id={`art-form-${form}`}
                        name="art-form"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                        checked={(filters.artForms || []).includes(form)}
                        onChange={() => handleArtFormChange(form)}
                      />
                      <label
                        htmlFor={`art-form-${form}`}
                        className="ml-2 block text-sm text-secondary-700"
                      >
                        {form}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="label mb-2">Experience Level</label>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <div key={level} className="flex items-center">
                      <input
                        id={`experience-${level}`}
                        name="experience"
                        type="radio"
                        className="h-4 w-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
                        checked={filters.experienceLevel === level}
                        onChange={() => handleExperienceLevelChange(level)}
                      />
                      <label
                        htmlFor={`experience-${level}`}
                        className="ml-2 block text-sm text-secondary-700"
                      >
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="location" className="label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  className="input"
                  placeholder="City, country, or region"
                  value={filters.location || ''}
                  onChange={handleLocationChange}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-secondary-600">
              {loading ? 'Loading grants...' : `${grants.length} grants found`}
            </div>
            
            <div className="flex items-center">
              <label htmlFor="sort" className="text-sm font-medium text-secondary-700 mr-2">
                Sort by:
              </label>
              <select
                id="sort"
                className="text-sm border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="deadline">Deadline (soonest)</option>
                <option value="title">Title (A-Z)</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : grants.length > 0 ? (
            <div className="space-y-4">
              {grants.map((grant) => (
                <div key={grant.id} className="card hover:border-primary-300 transition-all">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-semibold mb-1">{grant.title}</h3>
                    <p className="text-secondary-600 mb-2">{grant.organization}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {grant.art_forms?.slice(0, 3).map((form, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {form}
                        </span>
                      ))}
                      {grant.art_forms && grant.art_forms.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                          +{grant.art_forms.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <p className="text-secondary-700 mb-4">
                      {truncateText(grant.description || '', 150)}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-between mt-auto">
                      <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                        {grant.location && (
                          <div className="flex items-center text-sm text-secondary-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {grant.location}
                          </div>
                        )}
                        {grant.application_deadline && (
                          <div className="flex items-center text-sm text-secondary-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            Deadline: {formatDate(grant.application_deadline)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-3">
                        <Link
                          to={`/grants/${grant.id}`}
                          className="btn-primary text-sm py-1"
                        >
                          View Details
                        </Link>
                        {grant.grant_link && (
                          <a
                            href={grant.grant_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline text-sm py-1 flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Apply
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-secondary-200">
              <Search className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No grants found</h3>
              <p className="text-secondary-600 mb-4 max-w-md mx-auto">
                We couldn't find any grants matching your current filters. Try adjusting your search criteria.
              </p>
              <button
                className="btn-primary"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}