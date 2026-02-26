import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { SkeletonGrid } from '../components/SkeletonCard';
import {
    HiOutlineCloudUpload,
    HiOutlineTrash,
    HiOutlineDocumentText,
    HiOutlineCalendar,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineVideoCamera,
    HiOutlineLink,
    HiOutlineTag
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = '';

const categories = ['General', 'Notes', 'Assignments', 'Lab Reports', 'Question Papers', 'Syllabus', 'Reference Material'];

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

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

export default function AdminDashboard() {
    const [resources, setResources] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [videoDeleteConfirm, setVideoDeleteConfirm] = useState(null);

    // Bulk File Upload State
    const [semester, setSemester] = useState('1');
    const [category, setCategory] = useState('General');
    const [selectedFiles, setSelectedFiles] = useState([]); // Multiple files
    const [uploadProgress, setUploadProgress] = useState({}); // Track individual file status

    // Bulk Delete State
    const [selectedResourceIds, setSelectedResourceIds] = useState([]);

    // Video Registration State
    const [videoTitle, setVideoTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [videoSubject, setVideoSubject] = useState('');
    const [videoSemester, setVideoSemester] = useState('1');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resResources, resVideos] = await Promise.all([
                fetch(`/api/resources`),
                fetch(`/api/videos`)
            ]);

            if (resResources.ok) setResources(await resResources.json());
            if (resVideos.ok) setVideos(await resVideos.json());
        } catch (err) {
            toast.error('Failed to sync with repository');
        } finally {
            setLoading(false);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...acceptedFiles]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'application/ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/plain': ['.txt'],
            'application/zip': ['.zip'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        }
    });

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            toast.error('No candidate files');
            return;
        }

        setUploading(true);
        let successCount = 0;
        let failCount = 0;

        for (const file of selectedFiles) {
            const fileId = `${file.name}-${file.size}`;
            setUploadProgress(prev => ({ ...prev, [fileId]: 'uploading' }));

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('title', file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                formData.append('semester', semester);
                formData.append('category', category);

                const res = await fetch(`/api/resources/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) {
                    let errorMsg = 'Failed';
                    try {
                        const data = await res.json();
                        errorMsg = data.details || data.error || errorMsg;
                    } catch (e) { }
                    throw new Error(errorMsg);
                }

                setUploadProgress(prev => ({ ...prev, [fileId]: 'done' }));
                successCount++;
            } catch (err) {
                console.error(`Upload failed for ${file.name}:`, err);
                setUploadProgress(prev => ({ ...prev, [fileId]: 'error' }));
                failCount++;
            }
        }

        setUploading(false);
        if (successCount > 0) toast.success(`${successCount} resources integrated`);
        if (failCount > 0) toast.error(`${failCount} uploads failed`);

        setSelectedFiles([]);
        setUploadProgress({});
        fetchData();
    };

    const handleBulkDelete = async () => {
        if (selectedResourceIds.length === 0) return;

        setDeleteConfirm(null);
        toast.promise(
            (async () => {
                const res = await fetch(`/api/resources/bulk-delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedResourceIds })
                });
                if (!res.ok) throw new Error('Bulk deletion failed');
                setSelectedResourceIds([]);
                fetchData();
            })(),
            {
                loading: 'Purging selection...',
                success: 'Archive updated',
                error: 'Terminal error during purge'
            }
        );
    };

    const toggleSelection = (id) => {
        setSelectedResourceIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleVideoRegister = async (e) => {
        e.preventDefault();
        setRegistering(true);
        try {
            const res = await fetch(`/api/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: videoTitle,
                    url: videoUrl,
                    subject: videoSubject,
                    semester: videoSemester
                })
            });

            if (!res.ok) throw new Error('Registration failed');

            toast.success('Visual resource cataloged');
            setVideoTitle('');
            setVideoUrl('');
            setVideoSubject('');
            setVideoSemester('1');
            fetchData();
        } catch (err) {
            toast.error('Sync failed');
        } finally {
            setRegistering(false);
        }
    };

    const handleDeleteResource = async (id) => {
        try {
            const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Defragmentation failed');
            toast.success('Bit purged');
            fetchData();
        } catch (err) {
            toast.error('Terminal error');
        }
    };

    const handleDeleteVideo = async (id) => {
        try {
            const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Defragmentation failed');
            toast.success('Stream removed');
            fetchData();
        } catch (err) {
            toast.error('Terminal error');
        }
    };

    return (
        <div className="page-enter space-y-12 pb-32">
            {/* Header Bento Module */}
            <div className="bento-card p-12 bg-slate-900 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-50" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Admin <span className="text-indigo-400">Terminal</span></h1>
                    <p className="text-slate-400 mt-4 font-bold tracking-[0.3em] text-[10px] uppercase">Academic Repository Controller v2.5</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* INGESTION UNIT - 5 cols */}
                <div className="lg:col-span-5 space-y-8 h-full">

                    {/* File Cataloger */}
                    <div className="bento-card p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <HiOutlineCloudUpload className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Bulk Ingester</h2>
                        </div>

                        <form onSubmit={handleBulkUpload} className="space-y-6">
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-500 ${isDragActive
                                    ? 'border-indigo-600 bg-indigo-50 animate-pulse'
                                    : selectedFiles.length > 0
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                {selectedFiles.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                                            <HiOutlineCheck className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <p className="text-xs font-black text-slate-800 tracking-tight">{selectedFiles.length} files staged</p>
                                        <div className="max-h-32 overflow-y-auto space-y-1 px-2">
                                            {selectedFiles.map(f => (
                                                <div key={`${f.name}-${f.size}`} className="flex items-center justify-between text-[10px] bg-white p-2 rounded-lg border border-slate-50">
                                                    <span className="truncate max-w-[150px] font-bold text-slate-600">{f.name}</span>
                                                    {uploadProgress[`${f.name}-${f.size}`] === 'uploading' && <span className="text-indigo-500 animate-pulse font-black uppercase">Syncing...</span>}
                                                    {uploadProgress[`${f.name}-${f.size}`] === 'done' && <HiOutlineCheck className="text-emerald-500" />}
                                                    {uploadProgress[`${f.name}-${f.size}`] === 'error' && <HiOutlineX className="text-red-500" />}
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFiles([]); }} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Clear All</button>
                                    </div>
                                ) : (
                                    <>
                                        <HiOutlineCloudUpload className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Deploy Resources</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">Select multiple files</p>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="input-field">{semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}</select>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                            </div>

                            <button type="submit" disabled={uploading || selectedFiles.length === 0} className="w-full btn-primary py-4 uppercase tracking-[0.2em] font-black text-[10px]">
                                {uploading ? 'Executing Bulk Integration...' : 'Commit Selection to Repository'}
                            </button>
                        </form>
                    </div>

                    {/* Video Registrar */}
                    <div className="bento-card p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <HiOutlineVideoCamera className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Visual Registrar</h2>
                        </div>

                        <form onSubmit={handleVideoRegister} className="space-y-5">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Stream Alias</label>
                                <input type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="input-field" placeholder="Video Lesson Title" required />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Source URL</label>
                                <div className="relative group">
                                    <HiOutlineLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                    <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="input-field pl-10" placeholder="YouTube/Stream Link" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Subject</label>
                                    <div className="relative group">
                                        <HiOutlineTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                        <input type="text" value={videoSubject} onChange={(e) => setVideoSubject(e.target.value)} className="input-field pl-10" placeholder="Physics" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Semester</label>
                                    <select value={videoSemester} onChange={(e) => setVideoSemester(e.target.value)} className="input-field">{semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}</select>
                                </div>
                            </div>
                            <button type="submit" disabled={registering} className="w-full bg-slate-900 text-white py-4 rounded-xl uppercase tracking-[0.2em] font-black text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-100">
                                {registering ? 'Indexing Metadata...' : 'Register Visual Bit'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ARCHIVE MONITOR - 7 cols */}
                <div className="lg:col-span-7 space-y-8">

                    {/* Catalog Monitor */}
                    <div className="bento-card overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
                            <div className="flex items-center gap-4">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Repository Catalog</h2>
                                {selectedResourceIds.length > 0 && (
                                    <button
                                        onClick={() => handleBulkDelete()}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                                    >
                                        <HiOutlineTrash className="w-3.5 h-3.5" />
                                        Purge {selectedResourceIds.length} Selected
                                    </button>
                                )}
                            </div>
                            <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{resources.length} UNITS</span>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-50">
                            {resources.map(res => (
                                <div
                                    key={res.id}
                                    className={`p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group ${selectedResourceIds.includes(res.id) ? 'bg-indigo-50/30' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedResourceIds.includes(res.id)}
                                            onChange={() => toggleSelection(res.id)}
                                            className="w-4 h-4 rounded-md border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                                            <HiOutlineDocumentText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter truncate max-w-[200px]">{res.title}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">S{res.semester}</span>
                                                <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">{res.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteResource(res.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><HiOutlineTrash className="w-5 h-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stream Monitor */}
                    <div className="bento-card overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Stream Index</h2>
                            <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{videos.length} STREAMS</span>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                            {videos.map(vid => (
                                <div key={vid.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                                            <HiOutlineVideoCamera className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter truncate max-w-[200px]">{vid.title}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">S{vid.semester}</span>
                                                <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest">{vid.subject}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteVideo(vid.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><HiOutlineTrash className="w-5 h-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
            <div className="flex justify-center pt-12 pb-8">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100/50">Build v2.5.1rc - Multi-Sync Active</p>
            </div>
        </div>
    );
}