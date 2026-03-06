import { useCallback, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Palette, Upload, Wand2, Copy, Globe, Paintbrush, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/vibeSnap/Header";
import { useDesignRemix } from "@/hooks/useDesignRemix";
import { useInspirations } from "@/hooks/useInspirations";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

/* ---- Image Upload Slot ---- */

interface UploadSlotProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  previewUrl: string | null;
  onSelect: (file: File) => void;
  accentClass?: string;
}

const UploadSlot = ({ title, description, icon, previewUrl, onSelect, accentClass = "border-border" }: UploadSlotProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const validTypes = ["image/png", "image/jpeg", "image/webp"];
      if (validTypes.includes(file.type)) onSelect(file);
    },
    [onSelect]
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
    // avoid global paste conflicts between two slots
    void handlePaste;
  }, [handlePaste]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {previewUrl ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-xl overflow-hidden border border-border bg-muted/30 cursor-pointer group"
          onClick={() => inputRef.current?.click()}
        >
          <img
            src={previewUrl}
            alt={title}
            className="w-full h-auto max-h-[220px] object-contain"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
            <span className="text-xs font-medium text-card bg-foreground/60 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              Click to replace
            </span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors duration-200 ${
            isDragging ? "border-vibe-purple bg-vibe-purple/5" : `${accentClass} hover:border-vibe-purple/50`
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <Upload className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">{description}</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
          </div>
        </motion.div>
      )}
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
    </div>
  );
};

/* ---- Remix Loading Skeleton ---- */

const RemixLoading = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pr-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </div>
  </motion.div>
);

/* ---- Remix Result Display ---- */

interface RemixResultViewProps {
  sourceTheme: string;
  referenceStyle: string;
  modificationPrompt: string;
}

const RemixResultView = ({ sourceTheme, referenceStyle, modificationPrompt }: RemixResultViewProps) => {
  const handleCopy = async () => {
    const parts = [
      "[Source Theme]",
      sourceTheme,
      "",
      "[Reference Style]",
      referenceStyle,
      "",
      "[UI Modification Prompt]",
      modificationPrompt,
    ];
    const ok = await copyToClipboard(parts.join("\n"));
    if (ok) toast({ title: "Modification prompt copied" });
  };

  const renderPromptText = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="inline-block bg-vibe-purple/20 text-vibe-purple px-1.5 py-0.5 rounded text-xs font-mono mx-0.5"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-vibe-purple/10 border border-vibe-purple/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-vibe-purple" />
            <span className="text-sm font-semibold text-vibe-purple">Source Theme</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{sourceTheme}</p>
        </div>
        <div className="rounded-xl bg-accent/50 border border-accent p-4">
          <div className="flex items-center gap-2 mb-2">
            <Paintbrush className="w-4 h-4 text-vibe-dark" />
            <span className="text-sm font-semibold text-vibe-dark">Reference Style</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{referenceStyle}</p>
        </div>
      </div>

      {/* Modification prompt */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-foreground">UI Modification Prompt</h4>
          <Button
            size="sm"
            onClick={handleCopy}
            className="bg-vibe-purple hover:bg-vibe-purple/90 text-card gap-1.5 text-xs cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Prompt
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-420px)]">
          <div className="rounded-xl bg-vibe-dark p-5 text-sm leading-relaxed text-card/90 whitespace-pre-wrap font-mono">
            {renderPromptText(modificationPrompt)}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
};

/* ---- Modifier Page ---- */

const ModifierPage = () => {
  const { source, reference, setSource, setReference, isAnalyzing, result, error, canStart, startRemix } = useDesignRemix();
  const { count } = useInspirations();

  return (
    <div className="min-h-screen bg-background">
      <Header inspirationCount={count} />
      <main className="flex flex-col lg:flex-row gap-5 p-5 max-w-[1440px] mx-auto">
        {/* Left Panel */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
          className="w-full lg:w-[380px] lg:min-w-[380px] flex flex-col gap-5"
        >
          <div className="rounded-xl border border-border bg-card p-5">
            <UploadSlot
              title="Your Website"
              description="Upload your website screenshot"
              icon={<Monitor className="w-4 h-4 text-foreground" />}
              previewUrl={source.previewUrl}
              onSelect={setSource}
            />
          </div>

          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90 lg:rotate-0" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <UploadSlot
              title="Reference Style"
              description="Upload a style reference image"
              icon={<Palette className="w-4 h-4 text-foreground" />}
              previewUrl={reference.previewUrl}
              onSelect={setReference}
            />
          </div>

          <Button
            size="lg"
            disabled={!canStart}
            onClick={startRemix}
            className="w-full bg-vibe-purple hover:bg-vibe-purple/90 text-card gap-2 text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            {isAnalyzing ? "Analyzing..." : "Start Style Remix"}
          </Button>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 25, delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          <div className="rounded-xl border border-border bg-card p-5">
            {!result && !isAnalyzing && !error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Wand2 className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Upload your website screenshot and a style reference, AI will generate a UI modification prompt
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {isAnalyzing && <RemixLoading />}

            {result && !isAnalyzing && (
              <RemixResultView
                sourceTheme={result.source_theme}
                referenceStyle={result.reference_style}
                modificationPrompt={result.modification_prompt}
              />
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ModifierPage;
