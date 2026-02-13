"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";

interface ImageUploaderProps {
    onUploadComplete: (urls: string[]) => void;
    maxFiles?: number;
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
}: ImageUploaderProps) {
    const [files, setFiles] = useState<UploadingFile[]>([]);
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

        for (const fileObj of pendingFiles) {
            try {
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "uploading" } : f));

                // 1. Get Signature
                const timestamp = Math.round(new Date().getTime() / 1000);
                const paramsToSign = {
                    timestamp,
                    folder: "properties",
                    // Transformation on upload
                    transformation: "w_1600,c_limit,f_auto,q_auto",
                };

                const signRes = await fetch("/api/cloudinary/sign", {
                    method: "POST",
                    body: JSON.stringify({ paramsToSign }),
                });
                const { signature } = await signRes.json();

                // 2. Upload to Cloudinary
                const formData = new FormData();
                formData.append("file", fileObj.file);
                formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
                formData.append("timestamp", timestamp.toString());
                formData.append("signature", signature);
                formData.append("folder", "properties");
                formData.append("transformation", "w_1600,c_limit,f_auto,q_auto");

                const uploadRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!uploadRes.ok) throw new Error("Upload failed");

                const data = await uploadRes.json();

                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "success", url: data.secure_url } : f));
            } catch (error) {
                console.error("Upload error:", error);
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "error" } : f));
            }
        }

        // Notify parent
        const allUrls = files
            .map(f => f.status === "success" ? f.url : null)
            .filter(Boolean) as string[];

        // Check if new successes were added
        const currentSuccesses = files.filter(f => f.status === "success").length;
        if (currentSuccesses > 0) {
            onUploadComplete(allUrls);
        }
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
                                {file.status === "pending" && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
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
