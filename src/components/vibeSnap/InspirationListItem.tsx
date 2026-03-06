import { motion } from "framer-motion";
import { Trash2, Check } from "lucide-react";
import type { InspirationItem } from "@/types/vibeSnap";

interface InspirationListItemProps {
  item: InspirationItem;
  onRemove: (id: string) => void;
  onClick: (item: InspirationItem) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const InspirationListItem = ({
  item,
  onRemove,
  onClick,
  selectable = false,
  selected = false,
  onSelect,
}: InspirationListItemProps) => {
  const tags = item.extraction_result?.summary?.tags ?? [];
  const date = new Date(item.created_at).toLocaleDateString("zh-CN");
  const title = item.title || item.extraction_result?.title || "未命名设计";
  const styleText = item.extraction_result?.summary?.style_text || "";

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
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`group flex items-center gap-4 rounded-xl border bg-card p-3 cursor-pointer transition-colors ${
        selected ? "border-vibe-purple ring-2 ring-vibe-purple/20" : "border-border"
      }`}
      onClick={handleClick}
    >
      {/* Selection checkbox */}
      {selectable && (
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
            selected
              ? "bg-vibe-purple text-white"
              : "border border-border bg-card"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(item.id);
          }}
        >
          {selected && <Check className="w-3 h-3" />}
        </div>
      )}

      {/* Thumbnail */}
      <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
        <img
          src={item.image_url}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{styleText}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground hidden sm:block">{date}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default InspirationListItem;
