import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import {
    HiOutlineHome,
    HiOutlineAcademicCap,
    HiOutlineShieldCheck,
    HiOutlineX,
    HiOutlineLogout,
    HiOutlineVideoCamera
} from 'react-icons/hi';

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

const semesterColors = [
    'from-blue-500 to-cyan-400',
    'from-violet-500 to-purple-400',
    'from-emerald-500 to-teal-400',
    'from-orange-500 to-amber-400',
    'from-rose-500 to-pink-400',
    'from-indigo-500 to-blue-400',
    'from-fuchsia-500 to-pink-400',
    'from-teal-500 to-emerald-400'
];

export default function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { isAdmin, logout } = useAdmin();

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`;

    const handleLogout = () => {
        logout();
        navigate('/');
        if (onClose) onClose();
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <HiOutlineAcademicCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Academic Vault</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Repository</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
                            <HiOutlineX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        <NavLink to="/" end className={linkClass} onClick={onClose}>
                            <HiOutlineHome className="w-5 h-5" />
                            Home
                        </NavLink>

                        <NavLink to="/videos" className={linkClass} onClick={onClose}>
                            <HiOutlineVideoCamera className="w-5 h-5" />
                            Video Library
                        </NavLink>

                        <div className="pt-6 pb-2">
                            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semesters</p>
                        </div>

                        {semesters.map((sem, i) => (
                            <NavLink
                                key={sem}
                                to={`/semester/${sem}`}
                                className={linkClass}
                                onClick={onClose}
                            >
                                <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${semesterColors[i]} flex items-center justify-center shadow-sm`}>
                                    <span className="text-[10px] font-bold text-white">{sem}</span>
                                </div>
                                Semester {sem}
                            </NavLink>
                        ))}

                        <div className="pt-6 pb-2">
                            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</p>
                        </div>
                        <NavLink to="/admin" className={linkClass} onClick={onClose}>
                            <HiOutlineShieldCheck className="w-5 h-5" />
                            Admin Terminal
                        </NavLink>

                        {isAdmin && (
                            <button
                                onClick={handleLogout}
                                className="w-full mt-2 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
                            >
                                <HiOutlineLogout className="w-5 h-5" />
                                Terminate Session
                            </button>
                        )}
                    </nav>

                    {/* Branding Footer */}
                    <div className="p-6 border-t border-slate-100">
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-wider">
                                &copy; 2024 ACADEMIC VAULT
                            </p>
                            <p className="text-[9px] text-center text-slate-400 mt-1 uppercase tracking-tight">
                                OPEN SOURCE REPOSITORY
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
