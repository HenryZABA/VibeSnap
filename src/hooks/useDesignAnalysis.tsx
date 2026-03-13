import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { compressImageToBase64 } from "@/lib/utils";
import { invokeEdgeFunction } from "@/lib/edgeFunction";
import type { DesignExtractionResult } from "@/types/vibeSnap";

interface DesignAnalysisState {
  isAnalyzing: boolean;
  result: DesignExtractionResult | null;
  imageUrl: string | null;
  previewUrl: string | null;
  error: string | null;
  analyzeImage: (file: File) => Promise<void>;
  reset: () => void;
}

const DesignAnalysisContext = createContext<DesignAnalysisState | null>(null);

export function DesignAnalysisProvider({ children }: { children: ReactNode }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DesignExtractionResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const analyzeImage = useCallback(async (file: File) => {
    abortRef.current = false;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setImageUrl(null);

    try {
      // Local preview for immediate display
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      // Upload original and compress for AI in parallel
      const fileName = `${Date.now()}-${file.name}`;
      const [uploadResult, compressedBase64] = await Promise.all([
        supabase.storage.from("uploads").upload(fileName, file),
        compressImageToBase64(file, 1024, 1024, 0.6),
      ]);

      if (abortRef.current) return;

      // Set the persistent public URL for storage in DB
      if (!uploadResult.error && uploadResult.data) {
        const { data: urlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(uploadResult.data.path);
        setImageUrl(urlData.publicUrl);
        setPreviewUrl(urlData.publicUrl);
      } else {
        // Fallback: use compressed base64 as data URL
        setImageUrl(`data:image/jpeg;base64,${compressedBase64}`);
      }

      // Call AI analysis with compressed image via direct fetch
      const data = await invokeEdgeFunction<DesignExtractionResult>(
        "analyze-design",
        { image_base64: compressedBase64 }
      );

      if (abortRef.current) return;

      setResult(data);
    } catch (err: unknown) {
      if (!abortRef.current) {
        const message = err instanceof Error ? err.message : "Analysis failed, please try again";
        setError(message);
      }
    } finally {
      if (!abortRef.current) {
        setIsAnalyzing(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setResult(null);
    setImageUrl(null);
    setPreviewUrl(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return (
    <DesignAnalysisContext.Provider
      value={{ isAnalyzing, result, imageUrl, previewUrl, error, analyzeImage, reset }}
    >
      {children}
    </DesignAnalysisContext.Provider>
  );
}

export function useDesignAnalysis() {
  const ctx = useContext(DesignAnalysisContext);
  if (!ctx) throw new Error("useDesignAnalysis must be used within DesignAnalysisProvider");
  return ctx;
}
