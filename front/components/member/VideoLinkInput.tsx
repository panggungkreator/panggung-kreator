"use client";

import React, { useState, useEffect } from "react";
import { extractYouTubeId, getYouTubeThumbnail, detectMediaSource } from "@/lib/utils/media";
import { MediaSource } from "@/lib/types/member";
import { Youtube, Link as LinkIcon, AlertCircle } from "lucide-react";

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
          className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-zinc-300 dark:placeholder-zinc-650"
        />
        {error && (
          <span className="text-[10px] text-red-500 font-mono flex items-center gap-1 mt-1">
            <AlertCircle size={10} />
            {error}
          </span>
        )}
      </div>

      {thumb && (
        <div className="space-y-1 animate-fade-in">
          <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase block">
            [ PREVIEW THUMBNAIL OTOMATIS ]
          </span>
          <div className="relative h-32 w-48 border border-zinc-200 dark:border-zinc-800 bg-black">
            <img src={thumb} alt="YouTube Preview" className="h-full w-full object-cover opacity-80" />
            <div className="absolute top-2 left-2 bg-black/80 p-1 text-white border border-white/10">
              <Youtube size={14} className="text-[#bc151b]" />
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
