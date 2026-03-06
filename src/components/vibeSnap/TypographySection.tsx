import { Copy } from "lucide-react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { FontEntry } from "@/types/vibeSnap";

interface TypographySectionProps {
  fonts: FontEntry[];
}

const TypographySection = ({ fonts }: TypographySectionProps) => {
  const handleCopyFont = async (font: FontEntry) => {
    const ok = await copyToClipboard(font.css);
    if (ok) {
      toast({ title: `Copied ${font.name}` });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-3"
    >
      <h4 className="text-base font-semibold text-foreground">Typography</h4>
      <div className="flex flex-wrap gap-3">
        {fonts.map((font) => (
          <button
            key={font.name}
            onClick={() => handleCopyFont(font)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-vibe-purple/40 transition-colors group"
          >
            <span className="text-sm font-medium text-foreground">
              {font.display_name}
            </span>
            <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-vibe-purple transition-colors" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default TypographySection;
