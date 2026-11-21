import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0b1e13] text-[#e2f5ea] flex flex-col md:flex-row relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Modern Floating Left Dock on desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-24 lg:pl-28 transition-all">
        <Header />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        {/* Floating Mobile Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  );
}
