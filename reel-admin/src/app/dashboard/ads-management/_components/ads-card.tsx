import { Card } from "@/components/ui/card";
import { AdsType } from "../page";
import { PlayIcon, Trash2 } from "lucide-react";

export default function AdsCard({ ad, onDelete, onPlay }: { ad: AdsType, onDelete?: () => void, onPlay?: () => void }) {
    return (
        <Card className="relative aspect-[1/1] overflow-hidden rounded-lg shadow-md">
            {/* Background Image */}
            <video
                src={ad.adsVideoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay={false}
                muted={true}
                loop={true}
            />

            {/* Play Button Overlay */}
            <button
                className="absolute inset-0 flex items-center justify-center"
                aria-label="Play"
                onClick={onPlay}
            >
                <span className="bg-white/60 rounded-full p-4 shadow-lg">
                    <PlayIcon className="text-3xl text-primary" />
                </span>
            </button>

            {/* Delete Icon */}
            <button
                className="absolute top-3 right-3 bg-white/60 rounded-full p-2 shadow"
                aria-label="Delete"
                onClick={onDelete}
            >
                <Trash2 className="text-lg text-primary" />
            </button>
        </Card>
    );
}
