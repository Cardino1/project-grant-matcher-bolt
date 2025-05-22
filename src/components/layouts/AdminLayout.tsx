import { Outlet } from 'react-router-dom';
import AdminNavbar from '../ui/AdminNavbar';
import AdminSidebar from '../ui/AdminSidebar';
import { useState } from 'react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 container-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}