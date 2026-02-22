"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { GalleryImage } from "@/lib/supabase/properties";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, GripVertical, Star } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";



interface ImageUploaderProps {
    onUploadComplete: (images: GalleryImage[]) => void;
    maxFiles?: number;
    initialUrls?: string[];
    initialImages?: GalleryImage[];
}

interface UploadingFile {
    id: string;
    file: File | null;
    preview: string;
    progress: number;
    status: "pending" | "uploading" | "success" | "error";
    url?: string;
    es_principal: boolean;
    db_id?: string;
}

function SortableImage({
    file,
    onRemove,
    onSetPrincipal,
}: {
    file: UploadingFile;
    onRemove: (id: string) => void;
    onSetPrincipal: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative aspect-square rounded-2xl overflow-hidden border-2 group transition-all ${file.es_principal ? "border-red-500 shadow-lg shadow-red-100" : "border-zinc-100 dark:border-zinc-800"
                }`}
        >
            <Image src={file.preview} alt="preview" fill className="object-cover" />

            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-md rounded-lg shadow-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <GripVertical size={16} className="text-zinc-400" />
            </div>

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSetPrincipal(file.id);
                    }}
                    className={`p-2 rounded-full transition-colors ${file.es_principal
                        ? "bg-red-600 text-white"
                        : "bg-white text-zinc-600 hover:bg-red-50 hover:text-red-600"
                        }`}
                    title={file.es_principal ? "Imagen Principal" : "Marcar como Principal"}
                >
                    <Star size={16} fill={file.es_principal ? "currentColor" : "none"} />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(file.id);
                    }}
                    className="p-2 bg-white rounded-full text-zinc-600 hover:bg-red-600 hover:text-white transition-colors"
                    title="Eliminar imágen"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Principal Badge */}
            {file.es_principal && (
                <div className="absolute bottom-2 left-2 right-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest py-1 px-2 rounded-lg text-center shadow-lg">
                    Principal
                </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-2 right-2 z-10">
                {file.status === "uploading" && (
                    <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg">
                        <Loader2 size={16} className="animate-spin text-red-600" />
                    </div>
                )}
                {file.status === "success" && !file.es_principal && (
                    <div className="bg-emerald-500 p-1.5 rounded-full shadow-lg text-white">
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
    );
}

export default function ImageUploader({
    onUploadComplete,
    maxFiles = 15,
    initialUrls = [],
    initialImages = [],
}: ImageUploaderProps) {
    const buildInitialId = (seed: string, index: number): string => {
        const normalized = seed
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 16);
        return `init-${index}-${normalized || 'img'}`;
    };

    const [files, setFiles] = useState<UploadingFile[]>(() => {
        if (initialImages && initialImages.length > 0) {
            return initialImages.map((img, index) => ({
                id: buildInitialId(img.id || img.url, index),
                file: null,
                preview: img.url,
                progress: 100,
                status: "success",
                url: img.url,
                es_principal: img.es_principal,
                db_id: img.id
            }));
        }
        return initialUrls.map((url, index) => ({
            id: buildInitialId(url, index),
            file: null,
            preview: url,
            progress: 100,
            status: "success",
            url: url,
            es_principal: index === 0,
            db_id: undefined
        }));
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Notify parent whenever files list changes AND all are successful
    useEffect(() => {
        const allSuccessful = files.every((f) => f.status === "success");
        if (allSuccessful && files.length > 0) {
            const galleryData: GalleryImage[] = files.map((f, index) => ({
                id: f.db_id, // Database record ID
                url: f.url || f.preview,
                orden: index,
                es_principal: f.es_principal,
            }));
            onUploadComplete(galleryData);
        }
    }, [files, onUploadComplete]);

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
            es_principal: files.length === 0, // Mark as principal if it's the first image ever
        }));

        setFiles((prev) => [...prev, ...newFiles]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const index = prev.findIndex((f) => f.id === id);
            if (index === -1) return prev;

            const wasPrincipal = prev[index].es_principal;
            const newFiles = prev.filter((f) => f.id !== id);

            // If we removed the principal, mark the first one remaining as principal
            if (wasPrincipal && newFiles.length > 0) {
                newFiles[0].es_principal = true;
            }

            URL.revokeObjectURL(prev[index].preview);
            return newFiles;
        });
    };

    const setAsPrincipal = (id: string) => {
        setFiles((prev) =>
            prev.map((f) => ({
                ...f,
                es_principal: f.id === id,
            }))
        );
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const uploadFiles = async () => {
        const pendingFiles = files.filter((f) => f.status === "pending" || f.status === "error");

        if (pendingFiles.length === 0) return;

        for (const fileObj of pendingFiles) {
            try {
                setFiles((prev) =>
                    prev.map((f) => (f.id === fileObj.id ? { ...f, status: "uploading" } : f))
                );

                const formData = new FormData();
                formData.append("file", fileObj.file!);
                formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
                formData.append("folder", "properties");

                const uploadRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!uploadRes.ok) throw new Error("Upload failed");

                const data = await uploadRes.json();
                const secureUrl = data.secure_url;

                setFiles((prev) =>
                    prev.map((f) => (f.id === fileObj.id ? { ...f, status: "success", url: secureUrl } : f))
                );
            } catch (error) {
                console.error("Upload error:", error);
                setFiles((prev) =>
                    prev.map((f) => (f.id === fileObj.id ? { ...f, status: "error" } : f))
                );
            }
        }
    };

    return (
        <div className="space-y-8">
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all cursor-pointer group"
            >
                <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-red-100 group-hover:text-red-600 transition-all">
                    <Upload size={32} />
                </div>
                <div className="text-center">
                    <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                        Añadir Imágenes
                    </p>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                        Drag & Drop o click para buscar
                    </p>
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
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={files.map((f) => f.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {files.map((file) => (
                                <SortableImage
                                    key={file.id}
                                    file={file}
                                    onRemove={removeFile}
                                    onSetPrincipal={setAsPrincipal}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {files.some((f) => f.status === "pending" || f.status === "error") && (
                <button
                    type="button"
                    onClick={uploadFiles}
                    className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black py-6 rounded-3xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-xl uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                >
                    <Upload size={18} />
                    Subir a Cloudinary
                </button>
            )}

            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <Star size={10} className="inline mr-2 text-red-500" />
                Tip: Arrastra las imágenes para reordenar. La primera imagen será la portada si no marcas una como principal.
            </p>
        </div>
    );
}
