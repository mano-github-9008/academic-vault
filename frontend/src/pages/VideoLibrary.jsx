import { useState, useEffect } from 'react';
import { HiOutlineVideoCamera, HiOutlineSearch, HiOutlineFolder, HiOutlinePlay, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = '';

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export default function VideoLibrary() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeVideo, setActiveVideo] = useState(null);
    const [filterSemester, setFilterSemester] = useState(null);

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
            } else {
                throw new Error(data.error || 'Failed to fetch library');
            }
        } catch (err) {
            toast.error('Failed to load video catalog');
            console.error('VideoLibrary Fetch Error:', err);
            setVideos([]); // Fallback to empty array to prevent crash
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

    // Simple youtube/video-id extractor
    const getEmbedUrl = (url) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
            return `https://www.youtube.com/embed/${id}`;
        }
        return url;
    };

    return (
        <div className="page-enter space-y-8 pb-32">
            {/* Header / Filter Center */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="lg:col-span-2 bento-card p-10 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Video <span className="text-indigo-600">Archive</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Semester-wise curator for digital lectures and seminars.
                    </p>
                </div>

                <div className="lg:col-span-2 bento-card p-8 bg-indigo-600 flex flex-col gap-4">
                    <div className="relative group">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search library..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-indigo-200 focus:outline-none focus:ring-4 focus:ring-white/10 transition-all font-bold"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="flex-1 bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white font-bold appearance-none hover:bg-white/20 transition-all cursor-pointer focus:outline-none"
                            onChange={(e) => setFilterSemester(e.target.value || null)}
                        >
                            <option value="" className="text-slate-900">All Semesters</option>
                            {semesters.map(s => (
                                <option key={s} value={s} className="text-slate-900">Semester {s}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Video Player Modal/Overlay if active */}
            {activeVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveVideo(null)} />
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-scale-up">
                        <iframe
                            src={getEmbedUrl(activeVideo.url)}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        <button
                            onClick={() => setActiveVideo(null)}
                            className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all border border-white/10"
                        >
                            <HiOutlineX className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* Content Display */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bento-card py-32 text-center">
                    <HiOutlineVideoCamera className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-900">Archive is dormant</h3>
                    <p className="text-slate-500 mt-2 font-medium">No videos found matching your current parameters.</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {sortedSemesters.map(semNum => (
                        <div key={semNum} className="space-y-10">
                            <div className="flex items-center gap-6">
                                <span className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-xl shadow-indigo-100">
                                    {semNum}
                                </span>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                    Semester <span className="text-indigo-600">{semNum}</span>
                                </h2>
                                <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
                            </div>

                            {Object.keys(groupedBySemester[semNum]).sort().map(subject => (
                                <div key={subject} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <HiOutlineFolder className="w-5 h-5 text-slate-300" />
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">{subject}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {groupedBySemester[semNum][subject].map((video, idx) => (
                                            <div
                                                key={video.id}
                                                className="group bento-card-hover p-0 overflow-hidden flex flex-col h-full cursor-pointer animate-slide-up"
                                                style={{ animationDelay: `${idx * 50}ms` }}
                                                onClick={() => setActiveVideo(video)}
                                            >
                                                <div className="aspect-video relative bg-slate-900 overflow-hidden">
                                                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/20 group-hover:bg-indigo-600/40 transition-colors z-10">
                                                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500">
                                                            <HiOutlinePlay className="w-6 h-6 text-indigo-600 translate-x-0.5" />
                                                        </div>
                                                    </div>
                                                    {/* Video Thumbnail Placeholder (if you don't have real thumbnails) */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                                                        <HiOutlineVideoCamera className="w-8 h-8 text-white mb-2" />
                                                        <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">Stream Logic</span>
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors">
                                                        {video.title}
                                                    </h4>
                                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{subject}</span>
                                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">S{semNum} Digital</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

