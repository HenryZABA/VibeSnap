import { useCallback, useRef, useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

const ImageUploader = ({ onImageSelect }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const validTypes = ["image/png", "image/jpeg", "image/webp"];
      if (validTypes.includes(file.type)) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    },
    [handleFile]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">输入设计</h3>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors duration-200 ${
          isDragging
            ? "border-vibe-purple bg-vibe-purple/5"
            : "border-border hover:border-vibe-purple/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Upload className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            点击、拖拽或粘贴图片
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            支持 PNG, JPG, WEBP 格式
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </motion.div>
    </div>
  );
};

export default ImageUploader;
