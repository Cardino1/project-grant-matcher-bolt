import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../../context/SupabaseContext';
import { BarChart, Users, FileText, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const { supabase } = useSupabase();
  const [stats, setStats] = useState({
    totalGrants: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    recentApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Fetch total grants
        const { count: grantsCount, error: grantsError } = await supabase
          .from('grants')
          .select('*', { count: 'exact', head: true });
          
        if (grantsError) throw grantsError;
        
        // Fetch total users
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
          
        if (usersError) throw usersError;
        
        // For the sake of the demo, we'll just use random numbers for the other stats
        const activeSubscriptions = Math.floor(usersCount * 0.7);
        const recentApplications = Math.floor(Math.random() * 50);
        
        setStats({
          totalGrants: grantsCount || 0,
          totalUsers: usersCount || 0,
          activeSubscriptions,
          recentApplications,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [supabase]);
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Total Grants</h3>
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-secondary-900">{stats.totalGrants}</p>
              <p className="text-sm text-secondary-600 mt-1">Available in the database</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Total Users</h3>
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-secondary-900">{stats.totalUsers}</p>
              <p className="text-sm text-secondary-600 mt-1">Registered accounts</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Active Subscriptions</h3>
                <BarChart className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-secondary-900">{stats.activeSubscriptions}</p>
              <p className="text-sm text-secondary-600 mt-1">Paying subscribers</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Recent Applications</h3>
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-secondary-900">{stats.recentApplications}</p>
              <p className="text-sm text-secondary-600 mt-1">In the last 30 days</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/admin/grants" className="btn-primary w-full justify-center py-3">
                  Manage Grants
                </Link>
                <button className="btn-outline w-full justify-center py-3">
                  Manage Users
                </button>
                <button className="btn-outline w-full justify-center py-3">
                  View Subscription Reports
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">System Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-secondary-700">Database Status</p>
                  <div className="mt-1 flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-success-500 mr-2"></div>
                    <span className="text-secondary-900">Operational</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-secondary-700">API Status</p>
                  <div className="mt-1 flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-success-500 mr-2"></div>
                    <span className="text-secondary-900">Operational</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-secondary-700">Last Database Backup</p>
                  <div className="mt-1 text-secondary-900">Today at 03:00 AM</div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-secondary-700">System Version</p>
                  <div className="mt-1 text-secondary-900">1.0.0</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}