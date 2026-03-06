import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/vibeSnap/Header";
import ImageUploader from "@/components/vibeSnap/ImageUploader";
import ImagePreview from "@/components/vibeSnap/ImagePreview";
import DesignSummary from "@/components/vibeSnap/DesignSummary";
import DesignPrompt from "@/components/vibeSnap/DesignPrompt";
import AnalysisLoading from "@/components/vibeSnap/AnalysisLoading";
import { useDesignAnalysis } from "@/hooks/useDesignAnalysis";
import { useInspirations } from "@/hooks/useInspirations";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Check } from "lucide-react";

const ExtractorPage = () => {
  const { isAnalyzing, result, imageUrl, previewUrl, error, analyzeImage } = useDesignAnalysis();
  const { addInspiration, count } = useInspirations();
  const [activeTab, setActiveTab] = useState("summary");
  const [autoSaved, setAutoSaved] = useState(false);
  const savedUrlRef = useRef<string | null>(null);

  const displayUrl = previewUrl || imageUrl;

  // Auto-save to inspiration library when analysis completes
  useEffect(() => {
    if (result && imageUrl && imageUrl !== savedUrlRef.current) {
      savedUrlRef.current = imageUrl;
      setAutoSaved(false);
      addInspiration
        .mutateAsync({
          imageUrl,
          result,
          title: result.title || "",
        })
        .then(() => {
          setAutoSaved(true);
          toast({ title: "Auto-saved to library" });
        })
        .catch((err) => {
          console.error("Auto-save error:", err);
        });
    }
  }, [result, imageUrl, addInspiration]);

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
            <ImageUploader onImageSelect={analyzeImage} />
          </div>

          {displayUrl && (
            <div className="rounded-xl border border-border bg-card p-5">
              <ImagePreview imageUrl={displayUrl} />
              {autoSaved && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-vibe-purple">
                  <Check className="w-3.5 h-3.5" />
                  <span>Auto-saved to library</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Right Panel */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 25, delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          <div className="rounded-xl border border-border bg-card p-5">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-2 rounded-lg bg-muted h-10">
                <TabsTrigger
                  value="summary"
                  className="rounded-md text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  Design Summary
                </TabsTrigger>
                <TabsTrigger
                  value="prompt"
                  className="rounded-md text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  Design Prompt
                </TabsTrigger>
              </TabsList>

              {!displayUrl && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a screenshot and AI will analyze its design DNA
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {isAnalyzing && (
                <div className="mt-4">
                  <AnalysisLoading />
                </div>
              )}

              {result && !isAnalyzing && (
                <>
                  <TabsContent value="summary" className="mt-4">
                    <DesignSummary result={result} />
                  </TabsContent>
                  <TabsContent value="prompt" className="mt-4">
                    <DesignPrompt promptText={result.prompt.text} siteTheme={result.prompt.site_theme} />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ExtractorPage;
