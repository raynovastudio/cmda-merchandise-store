import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadProductImage } from "@/lib/imageStorage";

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  productId?: string;
  className?: string;
};

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export function ImageUpload({
  value,
  onChange,
  productId,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!ACCEPTED.includes(file.type)) {
        setError("Only JPG, PNG, WebP, and GIF images are accepted.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Image must be under 5 MB.");
        return;
      }

      if (productId) {
        setUploading(true);
        try {
          const url = await uploadProductImage(file, productId);
          onChange(url);
        } catch (e: unknown) {
          const msg =
            e instanceof Error ? e.message : "Upload failed. Try again.";
          setError(msg);
        } finally {
          setUploading(false);
        }
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onChange, productId],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  return (
    <div className={className}>
      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-border">
          <img
            src={value}
            alt="Product preview"
            className="h-48 w-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-white disabled:opacity-50"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={uploading}
                className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-secondary/30",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : dragging ? (
              <ImageIcon className="h-5 w-5 text-primary" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {uploading
                ? "Uploading..."
                : dragging
                  ? "Drop image here"
                  : "Click or drag to upload"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              JPG, PNG, WebP — up to 5 MB
            </p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <X className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
