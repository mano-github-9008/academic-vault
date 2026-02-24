import { Link } from 'react-router-dom';
import { HiOutlineDocumentText, HiOutlineCloudUpload, HiOutlineUsers, HiOutlineArrowRight } from 'react-icons/hi';

const semesterCards = [
    { sem: 1, gradient: 'from-blue-600 to-cyan-500', icon: '📘' },
    { sem: 2, gradient: 'from-violet-600 to-purple-500', icon: '📙' },
    { sem: 3, gradient: 'from-emerald-600 to-teal-500', icon: '📗' },
    { sem: 4, gradient: 'from-orange-600 to-amber-500', icon: '📕' },
    { sem: 5, gradient: 'from-rose-600 to-pink-500', icon: '📓' },
    { sem: 6, gradient: 'from-indigo-600 to-blue-500', icon: '📔' },
    { sem: 7, gradient: 'from-fuchsia-600 to-pink-500', icon: '📒' },
    { sem: 8, gradient: 'from-teal-600 to-emerald-500', icon: '📚' }
];

const stats = [
    { label: 'Total Files', value: '—', icon: HiOutlineDocumentText, color: 'text-blue-400' },
    { label: 'Semesters', value: '8', icon: HiOutlineCloudUpload, color: 'text-purple-400' },
    { label: 'Active Users', value: '—', icon: HiOutlineUsers, color: 'text-emerald-400' }
];

export default function Home() {
    return (
        <div className="page-enter space-y-10 pb-20">
            {/* Bento Grid Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 lg:gap-6">
                {/* Hero Card - Large Bento Module */}
                <div className="md:col-span-3 md:row-span-2 relative overflow-hidden bento-card p-8 md:p-12 flex flex-col justify-end min-h-[400px]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-60" />
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Open Repository</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Your Academic <span className="text-indigo-600">Vault</span> for <br className="hidden md:block" /> Digital Resources
                        </h1>
                        <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
                            Organized by semester for effortless access. Download notes, lab reports, and study materials in high precision.
                        </p>
                    </div>
                </div>

                {/* Stats Bento Modules */}
                {stats.map((stat, i) => (
                    <div key={stat.label} className="bento-card p-6 flex flex-col justify-between">
                        <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Semester Selection Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Browse Semesters</h2>
                    <div className="h-px bg-slate-100 flex-1 mx-6 hidden sm:block" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">8 Available</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {semesterCards.map(({ sem, gradient, icon }) => (
                        <Link
                            key={sem}
                            to={`/semester/${sem}`}
                            className="group bento-card-hover p-8 relative"
                        >
                            <div className="relative z-10 flex flex-col h-full">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg shadow-indigo-100 mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    {icon}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">Semester {sem}</h3>
                                <p className="text-sm text-slate-400 mt-1">Full access to resources</p>

                                <div className="mt-8 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Explore</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                        <HiOutlineArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
