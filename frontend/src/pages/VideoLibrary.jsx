import { useState, useEffect } from 'react';
import { HiOutlineVideoCamera, HiOutlineSearch, HiOutlineFolder, HiOutlinePlay, HiOutlineX, HiOutlineFilter } from 'react-icons/hi';
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
        <div className="page-enter pb-16">
            {/* ─── TOP BAR ─── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Video <span className="text-indigo-600">Library</span>
                    </h1>
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">
                        {filtered.length} streams available
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-64">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full bg-slate-100 border-0 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium"
                        />
                    </div>
                    <select
                        className="bg-slate-100 border-0 rounded-xl py-2.5 px-4 text-sm text-slate-700 font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                        onChange={(e) => setFilterSemester(e.target.value || null)}
                    >
                        <option value="">All Sem</option>
                        {semesters.map(s => (
                            <option key={s} value={s}>Sem {s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ─── LOADING ─── */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                    <div className="aspect-video bg-slate-200 rounded-2xl animate-pulse" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />)}
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl bg-[#0f0f0f] py-32 text-center">
                    <HiOutlineVideoCamera className="w-16 h-16 text-slate-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-white">Archive is dormant</h3>
                    <p className="text-slate-500 mt-2 font-medium">No videos found matching your current parameters.</p>
                </div>
            ) : (
                /* ─── MAIN LAYOUT ─── */
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

                    {/* ── LEFT: MAIN PLAYER ── */}
                    <div className="space-y-4">
                        {/* Player Container */}
                        <div className="relative rounded-2xl overflow-hidden bg-[#0f0f0f] shadow-2xl shadow-black/20">
                            {activeVideo ? (
                                <div className={`aspect-video transition-opacity duration-300 ${videoTransition ? 'opacity-0' : 'opacity-100'}`}>
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
                                <div className="aspect-video flex items-center justify-center">
                                    <div className="text-center">
                                        <HiOutlinePlay className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold text-sm">Select a video to start</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Video Info */}
                        {activeVideo && (
                            <div className="px-1 space-y-3 animate-video-fade-in">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                                    {activeVideo.title}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                        Semester {activeVideo.semester}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                                        {activeVideo.subject}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: UP NEXT QUEUE ── */}
                    <div className="rounded-2xl bg-[#0f0f0f] overflow-hidden border border-white/5 shadow-xl shadow-black/10">
                        {/* Queue Header */}
                        <div className="px-5 py-4 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Up Next</h3>
                                <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded-full">{filtered.length}</span>
                            </div>
                        </div>

                        {/* Queue List */}
                        <div className="max-h-[calc(100vh-280px)] overflow-y-auto video-queue-scrollbar">
                            {sortedSemesters.map(semNum => (
                                <div key={semNum}>
                                    {/* Semester Divider */}
                                    <div className="px-5 py-2.5 bg-white/[0.02] border-b border-white/5 sticky top-0 z-10 backdrop-blur-sm">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                                            Semester {semNum}
                                        </span>
                                    </div>

                                    {Object.keys(groupedBySemester[semNum]).sort().map(subject => (
                                        <div key={subject}>
                                            {/* Subject Label */}
                                            <div className="px-5 py-2 flex items-center gap-2">
                                                <HiOutlineFolder className="w-3 h-3 text-slate-600" />
                                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{subject}</span>
                                            </div>

                                            {/* Video Cards */}
                                            {groupedBySemester[semNum][subject].map((video) => {
                                                const isActive = activeVideo?.id === video.id;
                                                const thumbnail = getYouTubeThumbnail(video.url);

                                                return (
                                                    <div
                                                        key={video.id}
                                                        onClick={() => handleVideoSwitch(video)}
                                                        className={`flex gap-3 px-5 py-3 cursor-pointer transition-all duration-200 group relative
                                                            ${isActive
                                                                ? 'bg-indigo-600/10 border-l-[3px] border-l-indigo-500'
                                                                : 'hover:bg-white/[0.04] border-l-[3px] border-l-transparent'
                                                            }`}
                                                    >
                                                        {/* Thumbnail */}
                                                        <div className="relative w-[168px] min-w-[168px] aspect-video rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                                                            {thumbnail ? (
                                                                <img
                                                                    src={thumbnail}
                                                                    alt={video.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <HiOutlineVideoCamera className="w-6 h-6 text-slate-600" />
                                                                </div>
                                                            )}
                                                            {/* Play overlay */}
                                                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isActive ? 'opacity-100 bg-indigo-600/30' : 'opacity-0 group-hover:opacity-100 bg-black/30'}`}>
                                                                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                                    <HiOutlinePlay className="w-4 h-4 text-slate-900 translate-x-[1px]" />
                                                                </div>
                                                            </div>
                                                            {isActive && (
                                                                <div className="absolute bottom-1.5 left-1.5">
                                                                    <span className="text-[8px] font-black text-white bg-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Now Playing</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex flex-col justify-center min-w-0 py-0.5">
                                                            <h4 className={`text-[13px] font-bold leading-snug line-clamp-2 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-300 group-hover:text-white'}`}>
                                                                {video.title}
                                                            </h4>
                                                            <span className="text-[10px] text-slate-600 font-medium mt-1.5 truncate">
                                                                {subject}
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
