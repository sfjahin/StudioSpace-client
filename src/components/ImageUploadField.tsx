"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MAX_IMAGE_MB, uploadImage } from "@/lib/imgbb";

type Props = {
    /** The image URL currently on the form. */
    value: string;
    onChange: (url: string) => void;
    error?: string;
    /** Preview height, e.g. "h-56". */
    previewClassName?: string;
};

const fieldBox =
<<<<<<< HEAD
    "block rounded-xl border bg-ss-surface px-4 pb-3 pt-3 transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20";
const inputCls =
    "mt-1 w-full bg-transparent text-[15px] text-ss-ink outline-none placeholder:text-ss-faint";
=======
    "block rounded-xl border bg-white px-4 pb-3 pt-3 transition-colors focus-within:border-[#FF5A1F] focus-within:ring-2 focus-within:ring-[#FF5A1F]/20";
const inputCls =
    "mt-1 w-full bg-transparent text-[15px] text-[#1b1b1a] outline-none placeholder:text-[#a8a59e]";
>>>>>>> 6a0b7a52d7fcf34f22d7a10e3b9bfa737da6529f

/**
 * Studio photo field: upload a file to imgbb, or paste an image link.
 * Either way the form ends up holding a plain image URL, which is what gets saved in MongoDB.
 */
export default function ImageUploadField({
    value,
    onChange,
    error,
    previewClassName = "h-56",
}: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    // Remember which URL failed to load, so editing the URL clears the error automatically.
    const [failedUrl, setFailedUrl] = useState<string | null>(null);

    const url = value.trim();
    const previewFailed = failedUrl === url;

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        setUploading(true);
        try {
            const uploaded = await uploadImage(file);
            onChange(uploaded);
            toast.success("Photo uploaded.");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "The image upload failed.");
        } finally {
            setUploading(false);
            // Allow picking the same file again after a failure.
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    tabIndex={-1}
                    aria-label="Upload a studio photo"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
<<<<<<< HEAD
                    className="inline-flex items-center gap-2 rounded-xl border border-ss-line bg-ss-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-ss-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60"
                >
                    {uploading ? (
                        <Loader2 className="size-4 animate-spin text-brand" aria-hidden />
                    ) : (
                        <ImagePlus className="size-4 text-brand" aria-hidden />
                    )}
                    {uploading ? "Uploading…" : "Upload a photo"}
                </button>
                <span className="text-xs text-ss-muted">
=======
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e7e3db] bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#f3f0ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40 disabled:opacity-60"
                >
                    {uploading ? (
                        <Loader2 className="size-4 animate-spin text-[#FF5A1F]" aria-hidden />
                    ) : (
                        <ImagePlus className="size-4 text-[#FF5A1F]" aria-hidden />
                    )}
                    {uploading ? "Uploading…" : "Upload a photo"}
                </button>
                <span className="text-xs text-[#8f8c85]">
>>>>>>> 6a0b7a52d7fcf34f22d7a10e3b9bfa737da6529f
                    JPG, PNG, WebP or GIF · up to {MAX_IMAGE_MB} MB · hosted on imgbb
                </span>
            </div>

<<<<<<< HEAD
            <label className={`${fieldBox} ${error ? "border-red-400" : "border-ss-line"}`}>
                <span className="block text-[11px] font-medium text-ss-muted">
                    Image URL<span className="text-brand"> *</span>
=======
            <label className={`${fieldBox} ${error ? "border-red-400" : "border-[#e7e3db]"}`}>
                <span className="block text-[11px] font-medium text-[#6f6c66]">
                    Image URL<span className="text-[#FF5A1F]"> *</span>
>>>>>>> 6a0b7a52d7fcf34f22d7a10e3b9bfa737da6529f
                </span>
                <input
                    type="url"
                    className={inputCls}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Upload above, or paste a link like https://i.ibb.co/…/photo.jpg"
                />
                {error ? (
                    <span className="mt-1 block text-[11px] text-red-600" role="alert">
                        {error}
                    </span>
                ) : (
<<<<<<< HEAD
                    <span className="mt-1 block text-[11px] text-ss-muted">
=======
                    <span className="mt-1 block text-[11px] text-[#8f8c85]">
>>>>>>> 6a0b7a52d7fcf34f22d7a10e3b9bfa737da6529f
                        Uploading fills this in for you.
                    </span>
                )}
            </label>

            {url && (
<<<<<<< HEAD
                <div className="overflow-hidden rounded-xl border border-ss-line bg-ss-sunk">
                    {previewFailed ? (
                        <p className="px-4 py-10 text-center text-xs text-ss-muted">
=======
                <div className="overflow-hidden rounded-xl border border-[#e7e3db] bg-[#f0ece4]">
                    {previewFailed ? (
                        <p className="px-4 py-10 text-center text-xs text-[#7a776f]">
>>>>>>> 6a0b7a52d7fcf34f22d7a10e3b9bfa737da6529f
                            We couldn&apos;t load that image. Check the link and try again.
                        </p>
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={url}
                            alt="Studio cover preview"
                            className={`${previewClassName} w-full object-cover`}
                            onError={() => setFailedUrl(url)}
                        />
                    )}
<<<<<<< HEAD
                    <p className="border-t border-ss-line bg-ss-surface px-3 py-2 text-[11px] text-ss-muted">
=======
                    <p className="border-t border-[#e7e3db] bg-white px-3 py-2 text-[11px] text-[#7a776f]">
>>>>>>> 6a0b7a52d7fcf34f22d7a10e3b9bfa737da6529f
                        Cover photo preview
                    </p>
                </div>
            )}
        </div>
    );
}
