import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { PaletteColor } from "@/types/vibeSnap";

interface ColorPaletteProps {
  palette: PaletteColor[];
}

const ColorPalette = ({ palette }: ColorPaletteProps) => {
  const handleCopyHex = async (hex: string) => {
    const ok = await copyToClipboard(hex);
    if (ok) {
      toast({ title: `已复制 ${hex}` });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      <div className="flex items-baseline gap-3">
        <h4 className="text-base font-semibold text-foreground">核心色板</h4>
        <span className="text-xs text-vibe-purple cursor-pointer hover:underline">
          点击卡片复制 HEX
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {palette.map((color, i) => (
          <motion.div
            key={color.hex + i}
            whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => handleCopyHex(color.hex)}
            className="cursor-pointer rounded-xl border border-border bg-card overflow-hidden group"
          >
            <div
              className="h-20 w-full transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: color.hex }}
            />
            <div className="p-3 space-y-1">
              <p className="text-sm font-medium text-foreground truncate">
                {color.name}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {color.hex}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                {color.usage.join(", ")}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ColorPalette;
