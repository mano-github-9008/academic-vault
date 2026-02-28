import { useState, useEffect } from 'react';
import { HiOutlineVideoCamera, HiOutlineSearch, HiOutlineFolder, HiOutlinePlay, HiOutlineFilter } from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = '';

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export default function VideoLibrary() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeVideo, setActiveVideo] = useState(null);
    const [filterSemester, setFilterSemester] = useState(null);
    const [videoTransition, setVideoTransition] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/videos`);
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setVideos(data);
                if (data.length > 0 && !activeVideo) {
                    setActiveVideo(data[0]);
                }
            } else {
                throw new Error(data.error || 'Failed to fetch library');
            }
        } catch (err) {
            toast.error('Failed to load video catalog');
            console.error('VideoLibrary Fetch Error:', err);
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = videos.filter((v) => {
        const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
            v.subject.toLowerCase().includes(search.toLowerCase());
        const matchSem = filterSemester ? v.semester === parseInt(filterSemester) : true;
        return matchSearch && matchSem;
    });

    const groupedBySemester = filtered.reduce((acc, video) => {
        if (!acc[video.semester]) acc[video.semester] = {};
        if (!acc[video.semester][video.subject]) acc[video.semester][video.subject] = [];
        acc[video.semester][video.subject].push(video);
        return acc;
    }, {});

    const sortedSemesters = Object.keys(groupedBySemester).sort((a, b) => a - b);

    const getEmbedUrl = (url) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
            return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
        }
        return url;
    };

    const getYouTubeThumbnail = (url) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
            return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
        }
        return null;
    };

    const handleVideoSwitch = (video) => {
        if (activeVideo?.id === video.id) return;
        setVideoTransition(true);
        setTimeout(() => {
            setActiveVideo(video);
            setVideoTransition(false);
        }, 200);
    };

    return (
        <div className="page-enter pb-16 space-y-6">
            {/* ─── HEADER BENTO ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bento-card p-8 lg:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Video <span className="text-indigo-600">Archive</span>
                        </h1>
                        <p className="text-slate-400 mt-1 font-bold text-xs uppercase tracking-widest">
                            {filtered.length} streams indexed
                        </p>
                    </div>
                </div>
                <div className="bento-card p-6 flex flex-col gap-3">
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search library..."
                            className="input-field pl-10 text-sm"
                        />
                    </div>
                    <select
                        className="input-field text-sm"
                        onChange={(e) => setFilterSemester(e.target.value || null)}
                    >
                        <option value="">All Semesters</option>
                        {semesters.map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ─── LOADING ─── */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                    <div className="aspect-video bg-slate-100 rounded-2xl animate-pulse" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bento-card py-32 text-center">
                    <HiOutlineVideoCamera className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-900">Archive is dormant</h3>
                    <p className="text-slate-500 mt-2 font-medium">No videos found matching your current parameters.</p>
                </div>
            ) : (
                /* ─── MAIN LAYOUT ─── */
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

                    {/* ── LEFT: PLAYER ── */}
                    <div className="space-y-4">
                        <div className="bento-card p-0 overflow-hidden">
                            {activeVideo ? (
                                <div className={`aspect-video bg-slate-900 transition-opacity duration-300 ${videoTransition ? 'opacity-0' : 'opacity-100'}`}>
                                    <iframe
                                        key={activeVideo.id}
                                        src={getEmbedUrl(activeVideo.url)}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video bg-slate-50 flex items-center justify-center">
                                    <div className="text-center">
                                        <HiOutlinePlay className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold text-sm">Select a video to begin</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Video Info Card */}
                        {activeVideo && (
                            <div className="bento-card p-6 animate-video-fade-in">
                                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                                    {activeVideo.title}
                                </h2>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                                        Semester {activeVideo.semester}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100">
                                        {activeVideo.subject}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: UP NEXT QUEUE ── */}
                    <div className="bento-card overflow-hidden">
                        {/* Queue Header */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Up Next</h3>
                                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{filtered.length} STREAMS</span>
                            </div>
                        </div>

                        {/* Queue List */}
                        <div className="max-h-[calc(100vh-280px)] overflow-y-auto divide-y divide-slate-50">
                            {sortedSemesters.map(semNum => (
                                <div key={semNum}>
                                    {/* Semester Divider */}
                                    <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
                                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em]">
                                            Semester {semNum}
                                        </span>
                                    </div>

                                    {Object.keys(groupedBySemester[semNum]).sort().map(subject => (
                                        <div key={subject}>
                                            {/* Subject Label */}
                                            <div className="px-6 py-2 flex items-center gap-2 bg-white">
                                                <HiOutlineFolder className="w-3 h-3 text-slate-300" />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{subject}</span>
                                            </div>

                                            {/* Video Cards */}
                                            {groupedBySemester[semNum][subject].map((video) => {
                                                const isActive = activeVideo?.id === video.id;
                                                const thumbnail = getYouTubeThumbnail(video.url);

                                                return (
                                                    <div
                                                        key={video.id}
                                                        onClick={() => handleVideoSwitch(video)}
                                                        className={`flex gap-3 px-6 py-3 cursor-pointer transition-all duration-200 group relative
                                                            ${isActive
                                                                ? 'bg-indigo-50/50 border-l-[3px] border-l-indigo-500'
                                                                : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'
                                                            }`}
                                                    >
                                                        {/* Thumbnail */}
                                                        <div className="relative w-[140px] min-w-[140px] aspect-video rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                            {thumbnail ? (
                                                                <img
                                                                    src={thumbnail}
                                                                    alt={video.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                                    <HiOutlineVideoCamera className="w-5 h-5 text-slate-300" />
                                                                </div>
                                                            )}
                                                            {/* Play overlay */}
                                                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 rounded-xl ${isActive ? 'opacity-100 bg-indigo-600/20' : 'opacity-0 group-hover:opacity-100 bg-black/20'}`}>
                                                                <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                                                                    <HiOutlinePlay className="w-4 h-4 text-indigo-600 translate-x-[1px]" />
                                                                </div>
                                                            </div>
                                                            {isActive && (
                                                                <div className="absolute bottom-1.5 left-1.5">
                                                                    <span className="text-[7px] font-black text-white bg-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md">Playing</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex flex-col justify-center min-w-0 py-0.5">
                                                            <h4 className={`text-[12px] font-bold leading-snug line-clamp-2 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                                                                {video.title}
                                                            </h4>
                                                            <span className="text-[10px] text-slate-400 font-medium mt-1.5 truncate">
                                                                {subject} · S{video.semester}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
