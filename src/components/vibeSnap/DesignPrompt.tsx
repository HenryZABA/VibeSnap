import { Copy, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface DesignPromptProps {
  promptText: string;
  siteTheme?: string;
}

const DesignPrompt = ({ promptText, siteTheme }: DesignPromptProps) => {
  const handleCopyPrompt = async () => {
    const fullText = siteTheme
      ? `【网站主题与定位】\n${siteTheme}\n\n【设计提示词】\n${promptText}`
      : promptText;
    const ok = await copyToClipboard(fullText);
    if (ok) {
      toast({ title: "提示词已复制" });
    }
  };

  // Highlight text wrapped in backticks
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between relative z-10">
        <h4 className="text-base font-semibold text-foreground">设计提示词</h4>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleCopyPrompt();
          }}
          className="bg-vibe-purple hover:bg-vibe-purple/90 text-card gap-1.5 text-xs cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          复制提示词
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-230px)]">
        <div className="space-y-4 pr-4">
          {siteTheme && (
            <div className="rounded-xl bg-vibe-purple/10 border border-vibe-purple/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-vibe-purple" />
                <span className="text-sm font-semibold text-vibe-purple">网站主题与定位</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">
                {siteTheme}
              </p>
            </div>
          )}
          <div className="rounded-xl bg-vibe-dark p-5 text-sm leading-relaxed text-card/90 whitespace-pre-wrap font-mono">
            {renderPromptText(promptText)}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default DesignPrompt;
