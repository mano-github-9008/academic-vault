export default function SkeletonCard() {
    return (
        <div className="glass-card p-5 animate-fade-in">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="skeleton h-5 w-3/4 mb-3" />
                    <div className="skeleton h-4 w-1/2 mb-2" />
                    <div className="skeleton h-3 w-1/3" />
                </div>
                <div className="skeleton h-9 w-24 rounded-lg" />
            </div>
        </div>
    );
}

export function SkeletonGrid({ count = 6 }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
