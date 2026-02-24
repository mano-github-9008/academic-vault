import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/admin';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(username, password)) {
            toast.success('Access Granted. Welcome, Admin.');
            navigate(from, { replace: true });
        } else {
            toast.error('Invalid credentials. Access denied.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-slide-up">
                <div className="bento-card p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-inner">
                            <HiOutlineLockClosed className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Admin <span className="text-indigo-600">Gateway</span></h1>
                        <p className="text-slate-500 mt-2 font-bold tracking-widest text-[10px] uppercase">Secure Terminal Access</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Identifikator</label>
                            <div className="relative group">
                                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Access Key</label>
                            <div className="relative group">
                                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary py-4 uppercase tracking-widest font-black text-xs shadow-lg shadow-indigo-100 mt-4"
                        >
                            Authorize Entry
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Protected by Academic Vault Security Protocol
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
