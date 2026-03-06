import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { compressImageToBase64 } from "@/lib/utils";

export interface RemixResult {
  source_theme: string;
  reference_style: string;
  modification_prompt: string;
}

interface ImageSlot {
  file: File | null;
  previewUrl: string | null;
}

export function useDesignRemix() {
  const [source, setSourceState] = useState<ImageSlot>({ file: null, previewUrl: null });
  const [reference, setReferenceState] = useState<ImageSlot>({ file: null, previewUrl: null });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RemixResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const setSource = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setSourceState({ file, previewUrl: url });
    setResult(null);
    setError(null);
  }, []);

  const setReference = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setReferenceState({ file, previewUrl: url });
    setResult(null);
    setError(null);
  }, []);

  const canStart = !!source.file && !!reference.file && !isAnalyzing;

  const startRemix = useCallback(async () => {
    if (!source.file || !reference.file) return;

    abortRef.current = false;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Compress both images in parallel
      const [sourceBase64, referenceBase64] = await Promise.all([
        compressImageToBase64(source.file, 1600, 1600, 0.75),
        compressImageToBase64(reference.file, 1600, 1600, 0.75),
      ]);

      if (abortRef.current) return;

      // Call remix edge function
      const { data, error: fnError } = await supabase.functions.invoke(
        "remix-design",
        { body: { source_base64: sourceBase64, reference_base64: referenceBase64 } }
      );

      if (abortRef.current) return;
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setResult(data as RemixResult);
    } catch (err: unknown) {
      if (!abortRef.current) {
        const message = err instanceof Error ? err.message : "分析失败，请重试";
        setError(message);
      }
    } finally {
      if (!abortRef.current) {
        setIsAnalyzing(false);
      }
    }
  }, [source.file, reference.file]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setSourceState({ file: null, previewUrl: null });
    setReferenceState({ file: null, previewUrl: null });
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    source,
    reference,
    setSource,
    setReference,
    isAnalyzing,
    result,
    error,
    canStart,
    startRemix,
    reset,
  };
}
