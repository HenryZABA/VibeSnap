import { motion } from "framer-motion";
import { Trash2, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { InspirationItem } from "@/types/vibeSnap";

interface InspirationCardProps {
  item: InspirationItem;
  onRemove: (id: string) => void;
  onClick: (item: InspirationItem) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const InspirationCard = ({
  item,
  onRemove,
  onClick,
  selectable = false,
  selected = false,
  onSelect,
}: InspirationCardProps) => {
  const tags = item.extraction_result?.summary?.tags ?? [];
  const date = new Date(item.created_at).toLocaleDateString("zh-CN");
  const title = item.title || item.extraction_result?.title || "未命名设计";

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(item.id);
    } else {
      onClick(item);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, boxShadow: "0 12px 30px -8px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`group rounded-xl border bg-card overflow-hidden cursor-pointer transition-colors ${
        selected ? "border-vibe-purple ring-2 ring-vibe-purple/20" : "border-border"
      }`}
      onClick={handleClick}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={item.image_url}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {selectable && (
          <div
            className={`absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
              selected
                ? "bg-vibe-purple text-white"
                : "bg-card/80 backdrop-blur-sm border border-border"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(item.id);
            }}
          >
            {selected && <Check className="w-3.5 h-3.5" />}
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-card transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3.5 space-y-2">
        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </motion.div>
  );
};

export default InspirationCard;
