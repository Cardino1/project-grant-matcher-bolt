import { Link, useLocation } from 'react-router-dom';
import { LogoText } from './Logo';
import { X, LayoutDashboard, FileText, Upload, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Manage Grants', href: '/admin/grants', icon: FileText },
  ];
  
  return (
    <>
      {/* Mobile sidebar overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-secondary-900 bg-opacity-75 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-secondary-900 text-white shadow-lg transform transition ease-in-out duration-300 md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-700">
            <Link to="/admin" className="flex-shrink-0">
              <LogoText />
            </Link>
            <button
              type="button"
              className="text-gray-300 hover:text-white md:hidden"
              onClick={onClose}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Admin Controls
          </div>
          
          <nav className="flex-1 px-2 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-secondary-800 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-secondary-800'
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isActive
                        ? 'text-primary-400'
                        : 'text-gray-400 group-hover:text-gray-300'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}