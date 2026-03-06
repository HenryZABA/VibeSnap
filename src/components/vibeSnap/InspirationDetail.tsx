import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import DesignSummary from "./DesignSummary";
import DesignPrompt from "./DesignPrompt";
import type { InspirationItem } from "@/types/vibeSnap";

interface InspirationDetailProps {
  item: InspirationItem | null;
  open: boolean;
  onClose: () => void;
}

const InspirationDetail = ({ item, open, onClose }: InspirationDetailProps) => {
  const [activeTab, setActiveTab] = useState("summary");

  if (!item) return null;

  const title = item.title || item.extraction_result?.title || "Untitled Design";

  const handleCopyPromptJson = async () => {
    const json = JSON.stringify(
      [{ prompt: item.extraction_result?.prompt?.text || "" }],
      null,
      2
    );
    const ok = await copyToClipboard(json);
    if (ok) {
      toast({ title: "Prompt JSON copied" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left - Image */}
          <div className="lg:w-[40%] border-b lg:border-b-0 lg:border-r border-border bg-muted/30 p-4 flex items-center justify-center overflow-hidden">
            <img
              src={item.image_url}
              alt={title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Right - Analysis */}
          <div className="flex-1 p-5 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground truncate">{title}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPromptJson}
                className="text-xs gap-1.5 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy JSON
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full grid grid-cols-2 rounded-lg bg-muted h-10 shrink-0">
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

              <TabsContent value="summary" className="mt-4 flex-1 overflow-auto">
                <DesignSummary result={item.extraction_result} />
              </TabsContent>
              <TabsContent value="prompt" className="mt-4 flex-1 overflow-auto">
                <DesignPrompt promptText={item.extraction_result.prompt.text} siteTheme={item.extraction_result.prompt.site_theme} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InspirationDetail;
