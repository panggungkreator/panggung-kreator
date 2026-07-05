"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  File,
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  Copy,
  Trash2,
  Search,
  Check,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Eye,
  Loader,
  CheckCircle,
  ChevronDown
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
  } | null;
}

export default function MediaLibraryClient() {
  const [bucket, setBucket] = useState<"media" | "gallery">("media");
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Copy Feedback State (stores the filename that was copied)
  const [copiedFilename, setCopiedFilename] = useState<string | null>(null);

  // Fetch files from Storage bucket
  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();

      // List files from root directory of currently selected bucket
      const { data, error: storageError } = await supabase.storage
        .from(bucket)
        .list("", {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" }
        });

      if (storageError) throw new Error(storageError.message);

      setFiles(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat berkas media: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [bucket]);

  const getPublicUrl = (fileName: string) => {
    const supabase = createClient();
    return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
  };

  const handleCopyUrl = (fileName: string) => {
    const url = getPublicUrl(fileName);
    navigator.clipboard.writeText(url);
    setCopiedFilename(fileName);
    setTimeout(() => setCopiedFilename(null), 2000);
  };

  const handleDeleteFile = async (fileName: string) => {
    const confirmation = window.confirm(
      `Hapus berkas "${fileName}" dari folder ${bucket.toUpperCase()} secara permanen?`
    );
    if (!confirmation) return;

    try {
      const supabase = createClient();
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (removeError) throw new Error(removeError.message);

      alert("Berkas berhasil dihapus!");
      await fetchFiles();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menghapus berkas: " + err.message);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetFile = e.target.files?.[0];
    if (!targetFile) return;

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const compressedFile = await compressImage(targetFile);
      const fileExt = compressedFile.name.split(".").pop();
      const sanitizedName = compressedFile.name
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();
      const fileName = `${Date.now()}_${sanitizedName}.${fileExt}`;

      const supabase = createClient();
      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(fileName, compressedFile, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadErr) throw new Error(uploadErr.message);

      setUploadSuccess(`Berkas "${targetFile.name}" berhasil diunggah!`);
      // Reset input
      e.target.value = "";

      await fetchFiles();
    } catch (err: any) {
      console.error(err);
      setUploadError("Gagal mengunggah: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const kb = bytes / 1024;
    if (kb >= 1024) {
      return (kb / 1024).toFixed(1) + " MB";
    }
    return kb.toFixed(0) + " KB";
  };

  const getFileIcon = (mimetype: string) => {
    if (!mimetype) return <File className="w-8 h-8 text-text-secondary" />;
    if (mimetype.startsWith("image/")) return <ImageIcon className="w-8 h-8 text-indigo-500" />;
    if (mimetype.startsWith("video/")) return <Video className="w-8 h-8 text-amber-500" />;
    if (mimetype.startsWith("text/") || mimetype.includes("pdf") || mimetype.includes("word")) {
      return <FileText className="w-8 h-8 text-emerald-500" />;
    }
    return <File className="w-8 h-8 text-text-secondary" />;
  };

  // Filtered dataset
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      // Exclude placeholder directory files that Supabase Storage might return
      if (f.name === ".emptyFolderPlaceholder") return false;

      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const mimetype = f.metadata?.mimetype || "";

      let matchesType = true;
      if (typeFilter === "image") {
        matchesType = mimetype.startsWith("image/");
      } else if (typeFilter === "video") {
        matchesType = mimetype.startsWith("video/");
      } else if (typeFilter === "document") {
        matchesType = mimetype.startsWith("text/") || mimetype.includes("pdf") || mimetype.includes("word") || mimetype.includes("excel") || mimetype.includes("powerpoint");
      }

      return matchesSearch && matchesType;
    });
  }, [files, search, typeFilter]);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ CMS MEDIA ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Media Library
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={fetchFiles}
            className="px-6 py-4 border border-border-default hover:bg-bg-well rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Quick upload file input */}
          <label className="bg-text-primary text-bg-card border border-text-primary hover:opacity-90 rounded-full px-6 py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-opacity">
            <Upload size={14} />
            Upload File Baru
            <input
              type="file"
              onChange={handleUploadFile}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Tabs / Buckets selector */}
      <div className="flex gap-4 border-b border-border-default pb-1.5">
        <button
          onClick={() => setBucket("media")}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${bucket === "media"
            ? "text-text-primary border-b-2 border-text-primary"
            : "text-text-secondary hover:text-text-primary"
            }`}
        >
          Media Bucket
        </button>
        <button
          onClick={() => setBucket("gallery")}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${bucket === "gallery"
            ? "text-text-primary border-b-2 border-text-primary"
            : "text-text-secondary hover:text-text-primary"
            }`}
        >
          Gallery Bucket
        </button>
      </div>

      {/* Upload Feedback Status */}
      {isUploading && (
        <div className="bg-bg-card border border-border-default rounded-xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
            <Loader className="w-4 h-4 animate-spin text-text-secondary" />
            <span>Sedang mengunggah berkas ke Supabase Storage...</span>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center justify-between text-red-500 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError("")} className="text-red-500 font-bold hover:underline">✕</button>
        </div>
      )}

      {uploadSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center justify-between text-[#2D5A00] text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-[#2D5A00]" />
            <span>{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess("")} className="text-[#2D5A00] font-bold hover:underline">✕</button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="py-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama berkas..."
              className="bg-bg-well border border-gray-400 rounded-full py-4 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-[52px]">
                <SelectValue placeholder="Semua Tipe Berkas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe Berkas</SelectItem>
                <SelectItem value="image">Gambar saja</SelectItem>
                <SelectItem value="video">Video saja</SelectItem>
                <SelectItem value="document">Dokumen / PDF saja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Files Grid View */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-3 text-text-secondary" />
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Memuat media berkas...</p>
        </div>
      ) : error ? (
        <div className="bg-bg-card border border-border-default rounded-2xl p-10 text-center text-red-500">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
          <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => {
            const mimetype = file.metadata?.mimetype || "";
            const isImage = mimetype.startsWith("image/");
            const fileUrl = getPublicUrl(file.name);
            const isCopied = copiedFilename === file.name;

            return (
              <div
                key={file.id || file.name}
                className="bg-bg-card border border-border-default rounded-2xl overflow-hidden flex flex-col justify-between hover:border-text-primary/30 transition-colors"
              >
                {/* Visual Thumbnail Area */}
                <div className="h-36 bg-bg-well border-b border-border-default relative flex items-center justify-center overflow-hidden p-2 group">
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt={file.name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                      loading="lazy"
                    />
                  ) : (
                    getFileIcon(mimetype)
                  )}

                  {/* Quick Copy Link Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(file.name)}
                      className="bg-bg-card text-text-primary border border-border-default hover:scale-105 rounded-full p-2.5 shadow-md transition-all cursor-pointer"
                      title="Salin Link Berkas"
                    >
                      {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-bg-card text-text-primary border border-border-default hover:scale-105 rounded-full p-2.5 shadow-md transition-all flex items-center justify-center"
                      title="Lihat Fullscreen"
                    >
                      <Eye size={14} />
                    </a>
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-4 flex-1 flex flex-col justify-between min-h-[90px]">
                  <div>
                    <p
                      className="text-xs font-bold text-text-primary break-all line-clamp-2"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-border-default/50 text-[10px] text-text-secondary font-medium">
                    <span>{formatSize(file.metadata?.size || 0)}</span>
                    <span className="uppercase text-[9px] font-bold text-text-muted">{file.name.split(".").pop()}</span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-4 pb-4 pt-1 flex gap-2">
                  <button
                    onClick={() => handleCopyUrl(file.name)}
                    className={`flex-1 border text-[10px] font-bold uppercase tracking-wider rounded-full py-1.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${isCopied
                      ? "bg-[#EDFFF4] text-[#22C55E] border-emerald-500/20"
                      : "border-border-default text-text-primary hover:bg-bg-well"
                      }`}
                  >
                    {isCopied ? (
                      <>
                        <Check size={11} />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        Copy Link
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.name)}
                    className="border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 rounded-full p-2 text-red-500 transition-colors cursor-pointer flex items-center justify-center"
                    title="Hapus Media"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-bg-card border border-border-default rounded-2xl p-12 text-center text-text-muted">
          <FolderOpen className="w-10 h-10 mx-auto mb-3" />
          <p className="text-xs font-bold uppercase tracking-wider">Tidak ada berkas media ditemukan</p>
        </div>
      )}

    </div>
  );
}
