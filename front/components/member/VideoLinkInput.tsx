"use client";

import React, { useState, useEffect } from "react";
import { extractYouTubeId, getYouTubeThumbnail, detectMediaSource } from "@/lib/utils/media";
import { MediaSource } from "@/lib/types/member";
import { Video, Link as LinkIcon, AlertCircle } from "lucide-react";

interface VideoLinkInputProps {
  value: string;
  onUrlChange: (url: string, source: MediaSource, thumbUrl: string) => void;
  initialThumbnailUrl?: string | null;
}

export default function VideoLinkInput({ value, onUrlChange, initialThumbnailUrl }: VideoLinkInputProps) {
  const [url, setUrl] = useState(value);
  const [source, setSource] = useState<MediaSource>("external");
  const [thumb, setThumb] = useState<string | null>(initialThumbnailUrl || null);
  const [error, setError] = useState("");

  const handleBlur = () => {
    if (!url) {
      setThumb(null);
      onUrlChange("", "external", "");
      return;
    }

    const detectedSource = detectMediaSource(url);
    setSource(detectedSource);

    if (detectedSource === "youtube") {
      const ytId = extractYouTubeId(url);
      if (ytId) {
        const generatedThumb = getYouTubeThumbnail(ytId, "hq");
        setThumb(generatedThumb);
        onUrlChange(url, "youtube", generatedThumb);
        setError("");
      } else {
        setError("Link YouTube tidak valid!");
      }
    } else {
      // Untuk platform lain (TikTok/IG), biarkan manual atau thumbnail default
      setThumb(null);
      onUrlChange(url, detectedSource, "");
      setError("");
    }
  };

  useEffect(() => {
    setUrl(value);
  }, [value]);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
          LINK VIDEO (YOUTUBE / TIKTOK / INSTAGRAM)
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleBlur}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full bg-[#F6F5FA]/60 dark:bg-[#0E1210]/60 border border-[#212121]/15 dark:border-white/15 px-3 py-2 text-sm rounded-xl focus:outline-none focus:border-[#212121] dark:focus:border-white transition-colors"
        />
        {error && (
          <span className="text-[11px] text-red-600 dark:text-red-500 font-mono flex items-center gap-1 mt-1">
            <AlertCircle size={11} />
            {error}
          </span>
        )}
      </div>

      {thumb && (
        <div className="space-y-1 animate-fade-in">
          <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase block">
            [ PREVIEW THUMBNAIL OTOMATIS ]
          </span>
          <div className="relative h-32 w-48 rounded-xl overflow-hidden border border-[#212121]/10 dark:border-white/10 bg-black shadow-2xs">
            <img src={thumb} alt="YouTube Preview" className="h-full w-full object-cover opacity-85" />
            <div className="absolute top-2 left-2 bg-black/80 p-1 text-white border border-white/10 rounded-lg">
              <Video size={14} className="text-red-500" />
            </div>
          </div>
        </div>
      )}

      {!thumb && url && !error && (
        <div className="flex items-center space-x-2 text-[10px] text-zinc-500 dark:text-zinc-450 font-mono">
          <LinkIcon size={12} />
          <span>Terdeteksi: {source.toUpperCase()} (Tautan eksternal)</span>
        </div>
      )}
    </div>
  );
}
