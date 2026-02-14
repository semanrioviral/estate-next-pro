"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";

interface ImageUploaderProps {
    onUploadComplete: (urls: string[]) => void;
    maxFiles?: number;
    initialUrls?: string[];
}

interface UploadingFile {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: "pending" | "uploading" | "success" | "error";
    url?: string;
}

export default function ImageUploader({
    onUploadComplete,
    maxFiles = 10,
    initialUrls = [],
}: ImageUploaderProps) {
    const [files, setFiles] = useState<UploadingFile[]>(
        initialUrls.map((url) => ({
            id: Math.random().toString(36).substring(7),
            file: null as any,
            preview: url,
            progress: 100,
            status: "success",
            url: url,
        }))
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (files.length + selectedFiles.length > maxFiles) {
            alert(`Máximo ${maxFiles} imágenes permitidas`);
            return;
        }

        const newFiles = selectedFiles.map((file) => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: "pending" as const,
        }));

        setFiles((prev) => [...prev, ...newFiles]);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const filtered = prev.filter((f) => f.id !== id);
            // Revoke object URL to avoid memory leaks
            const removed = prev.find((f) => f.id === id);
            if (removed) URL.revokeObjectURL(removed.preview);
            return filtered;
        });
    };

    const uploadFiles = async () => {
        const pendingFiles = files.filter((f) => f.status === "pending" || f.status === "error");

        // Start with already successful URLs
        const updatedUrls = files
            .filter(f => f.status === "success" && f.url)
            .map(f => f.url as string);

        // If nothing to upload, just notify
        if (pendingFiles.length === 0) {
            onUploadComplete(updatedUrls);
            return;
        }

        for (const fileObj of pendingFiles) {
            try {
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "uploading" } : f));

                // 1. Prepare Unsigned Upload Data
                const formData = new FormData();
                formData.append("file", fileObj.file);
                formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
                formData.append("folder", "properties");

                // 2. Upload directly to Cloudinary
                const uploadRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!uploadRes.ok) {
                    const errorData = await uploadRes.json();
                    console.error("Cloudinary upload failed details:", errorData);
                    throw new Error("Upload failed");
                }

                const data = await uploadRes.json();
                const secureUrl = data.secure_url;

                // Update local tracking and UI state
                updatedUrls.push(secureUrl);
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "success", url: secureUrl } : f));
            } catch (error) {
                console.error("Upload error:", error);
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "error" } : f));
            }
        }

        // Notify parent with the full, fresh list
        console.log("ImageUploader: Notificando subida completa con URLs:", updatedUrls);
        onUploadComplete(updatedUrls);
    };

    return (
        <div className="space-y-6">
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer group"
            >
                <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">Haz clic o arrastra imágenes</p>
                    <p className="text-sm text-gray-500">Sugerido: Formato horizontal, max 10MB</p>
                </div>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />
            </div>

            {files.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {files.map((file) => (
                        <div key={file.id} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group">
                            <Image
                                src={file.preview}
                                alt="preview"
                                fill
                                className="object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-2 right-2">
                                {file.status === "uploading" && (
                                    <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg">
                                        <Loader2 size={16} className="animate-spin text-red-600" />
                                    </div>
                                )}
                                {file.status === "success" && (
                                    <div className="bg-green-500 p-1.5 rounded-full shadow-lg text-white">
                                        <CheckCircle2 size={16} />
                                    </div>
                                )}
                                {file.status === "error" && (
                                    <div className="bg-red-500 p-1.5 rounded-full shadow-lg text-white text-[10px] font-bold px-2">
                                        ERROR
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {files.some(f => f.status === "pending" || f.status === "error") && (
                <button
                    onClick={uploadFiles}
                    className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                    Subir Imágenes a Cloudinary
                </button>
            )}
        </div>
    );
}
