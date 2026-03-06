import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { DesignTokens } from "@/types/vibeSnap";

interface VisualTokensProps {
  tokens: DesignTokens;
}

const tokenCards = [
  {
    key: "radius" as const,
    title: "Radius",
    getContent: (t: DesignTokens) =>
      `${t.radius.base} for general elements, ${t.radius.pill} for pills/avatars`,
    getCopyText: (t: DesignTokens) =>
      `border-radius: ${t.radius.base};\n/* pill */ border-radius: ${t.radius.pill};`,
  },
  {
    key: "shadow" as const,
    title: "Shadow",
    getContent: (t: DesignTokens) =>
      `box-shadow: ${t.shadow.base}; subtle elevation, stronger on hover`,
    getCopyText: (t: DesignTokens) =>
      `box-shadow: ${t.shadow.base};\n/* hover */ box-shadow: ${t.shadow.hover};`,
  },
  {
    key: "border" as const,
    title: "Border",
    getContent: (t: DesignTokens) => t.border.style,
    getCopyText: (t: DesignTokens) => `border: ${t.border.style};`,
  },
  {
    key: "spacing" as const,
    title: "Spacing",
    getContent: (t: DesignTokens) =>
      `${t.spacing.layout}, ${t.spacing.grid}`,
    getCopyText: (t: DesignTokens) =>
      `/* Grid */ ${t.spacing.grid}\n/* Layout */ ${t.spacing.layout}`,
  },
];

const VisualTokens = ({ tokens }: VisualTokensProps) => {
  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      toast({ title: `Copied ${label}` });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-3"
    >
      <h4 className="text-base font-semibold text-foreground">Visual Tokens</h4>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tokenCards.map((card) => (
          <motion.div
            key={card.key}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => handleCopy(card.getCopyText(tokens), card.title)}
            className="cursor-pointer rounded-xl border border-border bg-card p-4 space-y-2 hover:border-vibe-purple/40 transition-colors"
          >
            <h5 className="text-sm font-semibold text-foreground">{card.title}</h5>
            <p className="text-xs text-muted-foreground leading-relaxed break-all">
              {card.getContent(tokens)}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default VisualTokens;
