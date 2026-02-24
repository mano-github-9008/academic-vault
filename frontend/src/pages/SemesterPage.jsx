import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SkeletonGrid } from '../components/SkeletonCard';
import {
    HiOutlineSearch,
    HiOutlineDownload,
    HiOutlineDocumentText,
    HiOutlineCalendar,
    HiOutlineFolder,
    HiOutlineEye
} from 'react-icons/hi';
import toast from 'react-hot-toast';

// API_URL is now standardized to use relative paths for better compatibility
const API_URL = '';

const semesterNames = {
    1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth',
    5: 'Fifth', 6: 'Sixth', 7: 'Seventh', 8: 'Eighth'
};

function formatFileSize(bytes) {
    if (!bytes) return '—';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

/**
 * Extracts subject from filename. 
 * Format expected: "Subject_Title.ext"
 */
function getSubject(filename, fallbackCategory) {
    if (!filename) return fallbackCategory || 'General';
    if (filename.includes('_')) {
        return filename.split('_')[0].trim();
    }
    return fallbackCategory || 'General';
}

export default function SemesterPage() {
    const { semesterId } = useParams();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchResources();
    }, [semesterId]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/resources?semester=${semesterId}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setResources(data);
        } catch (err) {
            toast.error('Failed to load resources');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (resource) => {
        setDownloading(resource.id);
        try {
            const res = await fetch(`/api/resources/download/${resource.id}`);
            if (!res.ok) throw new Error('Failed to get download URL');
            const { url, fileName } = await res.json();

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Downloading ${fileName}`);
        } catch (err) {
            toast.error('Download failed');
            console.error(err);
        } finally {
            setDownloading(null);
        }
    };

    const handleView = async (resource) => {
        try {
            const res = await fetch(`${API_URL}/api/resources/download/${resource.id}`);
            if (!res.ok) throw new Error('Failed to get view URL');
            const { url } = await res.json();
            window.open(url, '_blank');
        } catch (err) {
            toast.error('Preview failed');
            console.error(err);
        }
    };

    // Filter and Group resources
    const filtered = resources.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase()) ||
        r.file_name?.toLowerCase().includes(search.toLowerCase())
    );

    const grouped = filtered.reduce((acc, resource) => {
        const subject = getSubject(resource.file_name, resource.category);
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(resource);
        return acc;
    }, {});

    const sortedSubjects = Object.keys(grouped).sort();

    return (
        <div className="page-enter space-y-8 pb-20">
            {/* Header / Search Bento Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="lg:col-span-2 bento-card p-8 flex flex-col justify-center">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {semesterNames[semesterId] || ''} <span className="text-indigo-600">Semester</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        {loading ? 'Reading repository...' : `${filtered.length} specialized resource${filtered.length !== 1 ? 's' : ''} found across ${sortedSubjects.length} subjects`}
                    </p>
                </div>

                <div className="bento-card p-8 flex flex-col justify-center bg-indigo-600">
                    <div className="relative group">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 group-focus-within:text-white transition-colors" />
                        <input
                            id="search-resources"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter by title or subject..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-indigo-200 focus:outline-none focus:ring-4 focus:ring-white/10 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Resource Bento Grid Grouped by Subject */}
            {loading ? (
                <SkeletonGrid count={6} />
            ) : filtered.length === 0 ? (
                <div className="bento-card py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HiOutlineFolder className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                        {search ? 'Empty result set' : 'Repository is blank'}
                    </h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        {search
                            ? 'The search term returned zero matches. Try generalized keywords.'
                            : 'No resources have been cataloged for this semester yet.'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {sortedSubjects.map((subject) => (
                        <div key={subject} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] whitespace-nowrap bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100/50">
                                    {subject}
                                </h2>
                                <div className="h-[1px] w-full bg-slate-100" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                                {grouped[subject].map((resource, idx) => (
                                    <div
                                        key={resource.id}
                                        className="bento-card-hover p-6 flex flex-col h-full animate-slide-up"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                                <HiOutlineDocumentText className="w-6 h-6" />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleView(resource)}
                                                    className="p-3 bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white rounded-xl transition-all duration-300"
                                                    title="View Document"
                                                >
                                                    <HiOutlineEye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(resource)}
                                                    disabled={downloading === resource.id}
                                                    className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-50"
                                                    title="Download"
                                                >
                                                    {downloading === resource.id ? (
                                                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin hover:border-white" />
                                                    ) : (
                                                        <HiOutlineDownload className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                {resource.title}
                                            </h3>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-100">
                                                    {resource.file_name?.split('.').pop() || 'File'}
                                                </span>
                                                <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-100">
                                                    {formatFileSize(resource.file_size)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineCalendar className="w-3.5 h-3.5" />
                                                {formatDate(resource.created_at)}
                                            </div>
                                            <span className="text-indigo-500">{resource.file_name?.includes('.') ? resource.file_name.split('.').pop() : 'Resource'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
