import { useState, useEffect, useRef } from 'react';
import { useSupabase } from '../../context/SupabaseContext';
import { Grant } from '../../types';
import { formatDate } from '../../lib/utils';
import { Plus, Upload, Trash2, Edit, Download, FileText, Check, AlertCircle, X, Loader2 } from 'lucide-react';

interface GrantFormValues {
  id?: string;
  title: string;
  organization: string;
  description: string;
  funding_amount?: string;
  application_deadline?: string;
  art_forms: string[];
  location?: string;
  experience_level?: string;
  grant_link?: string;
}

interface FileUploadResult {
  success: boolean;
  message: string;
  count?: number;
}

const initialFormValues: GrantFormValues = {
  title: '',
  organization: '',
  description: '',
  funding_amount: '',
  application_deadline: '',
  art_forms: [],
  location: '',
  experience_level: '',
  grant_link: '',
};

export default function AdminGrants() {
  const { supabase } = useSupabase();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [fileUploadVisible, setFileUploadVisible] = useState(false);
  const [formValues, setFormValues] = useState<GrantFormValues>(initialFormValues);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<FileUploadResult | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteGrantId, setDeleteGrantId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    fetchGrants();
  }, []);
  
  const fetchGrants = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('grants')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setGrants(data || []);
    } catch (error) {
      console.error('Error fetching grants:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };
  
  const handleArtFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormValues({
        ...formValues,
        art_forms: [...formValues.art_forms, value],
      });
    } else {
      setFormValues({
        ...formValues,
        art_forms: formValues.art_forms.filter(form => form !== value),
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formValues.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formValues.organization.trim()) {
      errors.organization = 'Organization is required';
    }
    
    if (!formValues.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formValues.art_forms.length === 0) {
      errors.art_forms = 'At least one art form must be selected';
    }
    
    setFormErrors(errors);
    
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitLoading(true);
    
    try {
      if (isEditing && formValues.id) {
        // Update existing grant
        const { error } = await supabase
          .from('grants')
          .update({
            title: formValues.title,
            organization: formValues.organization,
            description: formValues.description,
            funding_amount: formValues.funding_amount,
            application_deadline: formValues.application_deadline || null,
            art_forms: formValues.art_forms,
            location: formValues.location,
            experience_level: formValues.experience_level,
            grant_link: formValues.grant_link,
            updated_at: new Date().toISOString(),
          })
          .eq('id', formValues.id);
          
        if (error) throw error;
      } else {
        // Create new grant
        const { error } = await supabase
          .from('grants')
          .insert({
            title: formValues.title,
            organization: formValues.organization,
            description: formValues.description,
            funding_amount: formValues.funding_amount,
            application_deadline: formValues.application_deadline || null,
            art_forms: formValues.art_forms,
            location: formValues.location,
            experience_level: formValues.experience_level,
            grant_link: formValues.grant_link,
          });
          
        if (error) throw error;
      }
      
      // Reset form and refresh grants
      setFormVisible(false);
      setFormValues(initialFormValues);
      setIsEditing(false);
      fetchGrants();
    } catch (error) {
      console.error('Error saving grant:', error);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleEditGrant = (grant: Grant) => {
    setFormValues({
      id: grant.id,
      title: grant.title,
      organization: grant.organization,
      description: grant.description || '',
      funding_amount: grant.funding_amount || '',
      application_deadline: grant.application_deadline || '',
      art_forms: grant.art_forms || [],
      location: grant.location || '',
      experience_level: grant.experience_level || '',
      grant_link: grant.grant_link || '',
    });
    
    setIsEditing(true);
    setFormVisible(true);
    setFormErrors({});
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeleteGrant = async (id: string) => {
    setDeleteGrantId(id);
    
    try {
      const { error } = await supabase
        .from('grants')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove from local state
      setGrants(grants.filter(grant => grant.id !== id));
    } catch (error) {
      console.error('Error deleting grant:', error);
    } finally {
      setDeleteGrantId(null);
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadLoading(true);
    setUploadResult(null);
    
    try {
      // In a real application, we would process the file and upload its contents
      // For this demo, we'll simulate a successful upload
      setTimeout(() => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        let result: FileUploadResult;
        
        if (fileExtension === 'json' || fileExtension === 'csv' || fileExtension === 'xlsx') {
          result = {
            success: true,
            message: `Successfully imported grants from ${file.name}`,
            count: Math.floor(Math.random() * 10) + 1,
          };
          
          // Refresh grants list
          fetchGrants();
        } else {
          result = {
            success: false,
            message: 'Invalid file format. Please upload a JSON, CSV, or XLSX file.',
          };
        }
        
        setUploadResult(result);
        setUploadLoading(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1500);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadResult({
        success: false,
        message: 'An error occurred while processing the file.',
      });
      setUploadLoading(false);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Manage Grants</h1>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            className="btn-primary flex items-center"
            onClick={() => {
              setFormVisible(true);
              setIsEditing(false);
              setFormValues(initialFormValues);
              setFormErrors({});
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Grant
          </button>
          
          <button
            className="btn-outline flex items-center"
            onClick={() => {
              setFileUploadVisible(true);
              setUploadResult(null);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Grants
          </button>
        </div>
      </div>
      
      {formVisible && (
        <div className="bg-white shadow-sm rounded-lg border border-secondary-200 p-6 mb-8 animate-slide-down">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Grant' : 'Add New Grant'}
            </h2>
            <button
              className="text-secondary-500 hover:text-secondary-700"
              onClick={() => setFormVisible(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="title" className="label">
                  Title <span className="text-error-600">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className={`input ${formErrors.title ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                  value={formValues.title}
                  onChange={handleInputChange}
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-error-600">{formErrors.title}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="organization" className="label">
                  Organization <span className="text-error-600">*</span>
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  className={`input ${formErrors.organization ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                  value={formValues.organization}
                  onChange={handleInputChange}
                />
                {formErrors.organization && (
                  <p className="mt-1 text-sm text-error-600">{formErrors.organization}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="label">
                  Description <span className="text-error-600">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className={`input ${formErrors.description ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                  value={formValues.description}
                  onChange={handleInputChange}
                ></textarea>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-error-600">{formErrors.description}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="funding_amount" className="label">
                  Funding Amount
                </label>
                <input
                  type="text"
                  id="funding_amount"
                  name="funding_amount"
                  className="input"
                  value={formValues.funding_amount}
                  onChange={handleInputChange}
                  placeholder="e.g., $5,000 - $10,000"
                />
              </div>
              
              <div>
                <label htmlFor="application_deadline" className="label">
                  Application Deadline
                </label>
                <input
                  type="date"
                  id="application_deadline"
                  name="application_deadline"
                  className="input"
                  value={formValues.application_deadline}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="location" className="label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="input"
                  value={formValues.location}
                  onChange={handleInputChange}
                  placeholder="e.g., New York, NY"
                />
              </div>
              
              <div>
                <label htmlFor="experience_level" className="label">
                  Experience Level
                </label>
                <select
                  id="experience_level"
                  name="experience_level"
                  className="input"
                  value={formValues.experience_level}
                  onChange={handleInputChange}
                >
                  <option value="">Select experience level</option>
                  <option value="Emerging">Emerging</option>
                  <option value="Mid-Career">Mid-Career</option>
                  <option value="Established">Established</option>
                  <option value="Student">Student</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="grant_link" className="label">
                  Grant Link
                </label>
                <input
                  type="url"
                  id="grant_link"
                  name="grant_link"
                  className="input"
                  value={formValues.grant_link}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="label">
                  Art Forms <span className="text-error-600">*</span>
                </label>
                {formErrors.art_forms && (
                  <p className="mt-1 text-sm text-error-600">{formErrors.art_forms}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                  {[
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
                  ].map((form) => (
                    <div key={form} className="flex items-center">
                      <input
                        id={`art-form-${form}`}
                        name="art_forms"
                        type="checkbox"
                        value={form}
                        checked={formValues.art_forms.includes(form)}
                        onChange={handleArtFormChange}
                        className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
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
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setFormVisible(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Grant' : 'Save Grant'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {fileUploadVisible && (
        <div className="bg-white shadow-sm rounded-lg border border-secondary-200 p-6 mb-8 animate-slide-down">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Import Grants</h2>
            <button
              className="text-secondary-500 hover:text-secondary-700"
              onClick={() => setFileUploadVisible(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-secondary-600">
              Upload a JSON, CSV, or Excel file containing grant data. The file should have the following columns:
            </p>
            
            <div className="bg-secondary-50 p-4 rounded-md border border-secondary-200">
              <h3 className="text-sm font-medium text-secondary-900 mb-2">Required Fields:</h3>
              <ul className="list-disc pl-5 text-sm text-secondary-600 space-y-1">
                <li>title (string): Title of the grant</li>
                <li>organization (string): Organization offering the grant</li>
                <li>description (string): Detailed description</li>
              </ul>
              
              <h3 className="text-sm font-medium text-secondary-900 mt-4 mb-2">Optional Fields:</h3>
              <ul className="list-disc pl-5 text-sm text-secondary-600 space-y-1">
                <li>funding_amount (string): Text representation of funding amount</li>
                <li>application_deadline (date): Deadline for applications (YYYY-MM-DD)</li>
                <li>art_forms (array): Array of art forms covered</li>
                <li>location (string): Geographic location</li>
                <li>experience_level (string): Required experience level</li>
                <li>grant_link (string): URL to the grant application</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <label htmlFor="file-upload" className="block mb-2 text-sm font-medium text-secondary-700">
                Select File
              </label>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-secondary-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                disabled={uploadLoading}
              />
            </div>
            
            {uploadLoading && (
              <div className="flex items-center text-secondary-600 mt-4">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing file...
              </div>
            )}
            
            {uploadResult && (
              <div className={`mt-4 p-4 rounded-md ${uploadResult.success ? 'bg-success-50 border border-success-200' : 'bg-error-50 border border-error-200'}`}>
                <div className="flex items-center">
                  {uploadResult.success ? (
                    <Check className={`h-5 w-5 mr-2 text-success-500`} />
                  ) : (
                    <AlertCircle className={`h-5 w-5 mr-2 text-error-500`} />
                  )}
                  <span className={`text-sm font-medium ${uploadResult.success ? 'text-success-800' : 'text-error-800'}`}>
                    {uploadResult.message}
                  </span>
                </div>
                {uploadResult.success && uploadResult.count && (
                  <p className="mt-1 text-sm text-success-600">
                    {uploadResult.count} grants were imported successfully.
                  </p>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setFileUploadVisible(false)}
              >
                Close
              </button>
              <a
                href="/sample-grants.json"
                download
                className="btn-outline flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Sample
              </a>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : grants.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg border border-secondary-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Grant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Art Forms
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {grants.map((grant) => (
                  <tr key={grant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">{grant.title}</div>
                      <div className="text-sm text-secondary-500">{grant.organization}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {grant.art_forms?.slice(0, 3).map((form, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {form}
                          </span>
                        ))}
                        {grant.art_forms && grant.art_forms.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                            +{grant.art_forms.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                      {grant.application_deadline ? formatDate(grant.application_deadline) : 'No deadline'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditGrant(grant)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGrant(grant.id)}
                          className="text-error-600 hover:text-error-900"
                          disabled={deleteGrantId === grant.id}
                        >
                          {deleteGrantId === grant.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No grants found</h3>
          <p className="text-secondary-600 mb-6">
            There are no grants in the database yet. Create your first grant or import grants from a file.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              className="btn-primary flex items-center"
              onClick={() => {
                setFormVisible(true);
                setIsEditing(false);
                setFormValues(initialFormValues);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Grant
            </button>
            <button
              className="btn-outline flex items-center"
              onClick={() => setFileUploadVisible(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Grants
            </button>
          </div>
        </div>
      )}
    </div>
  );
}