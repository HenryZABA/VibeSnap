import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { DesignExtractionResult } from "@/types/vibeSnap";

interface StyleSummaryProps {
  result: DesignExtractionResult;
}

const StyleSummary = ({ result }: StyleSummaryProps) => {
  const handleCopyJson = async () => {
    const json = JSON.stringify(result, null, 2);
    const ok = await copyToClipboard(json);
    if (ok) {
      toast({ title: "已复制 JSON" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-xl border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base font-semibold text-foreground">设计风格</h4>
        <Button variant="outline" size="sm" onClick={handleCopyJson} className="shrink-0 text-xs gap-1.5">
          <Copy className="w-3.5 h-3.5" />
          复制 JSON
        </Button>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {result.summary.style_text}
      </p>
      <div className="flex flex-wrap gap-2">
        {result.summary.tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="rounded-full text-xs font-medium px-3 py-1 border-border text-foreground"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
};

export default StyleSummary;
