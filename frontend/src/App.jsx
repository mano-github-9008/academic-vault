import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import SemesterPage from './pages/SemesterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminProvider } from './context/AdminContext';
import VideoLibrary from './pages/VideoLibrary';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';

function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar (mobile) */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
                    <button
                        id="mobile-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        <HiOutlineMenuAlt2 className="w-6 h-6" />
                    </button>
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Academic <span className="text-indigo-600">Vault</span></span>
                    <div className="w-10" /> {/* Spacer */}
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<AdminLogin />} />
                            <Route path="/videos" element={<VideoLibrary />} />
                            <Route path="/semester/:semesterId" element={<SemesterPage />} />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AdminProvider>
            <Routes>
                <Route path="/*" element={<AppLayout />} />
            </Routes>
        </AdminProvider>
    );
}
