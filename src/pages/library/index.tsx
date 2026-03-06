import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/vibeSnap/Header";
import InspirationCard from "@/components/vibeSnap/InspirationCard";
import InspirationListItem from "@/components/vibeSnap/InspirationListItem";
import InspirationDetail from "@/components/vibeSnap/InspirationDetail";
import { useInspirations } from "@/hooks/useInspirations";
import { toast } from "@/hooks/use-toast";
import {
  Bookmark,
  LayoutGrid,
  List,
} from "lucide-react";
import type { InspirationItem } from "@/types/vibeSnap";

type ViewMode = "card" | "list";

const InspirationLibrary = () => {
  const { inspirations, isLoading, removeInspiration, count } = useInspirations();
  const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  const handleRemove = async (id: string) => {
    await removeInspiration.mutateAsync(id);
    toast({ title: "已从灵感库移除" });
  };

  const hasItems = !isLoading && inspirations.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header inspirationCount={count} />
      <main className="max-w-[1440px] mx-auto p-5">
        {/* Action bar */}
        {hasItems && (
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                {inspirations.length} 个灵感
              </h2>
              {/* View mode toggle */}
              <div className="flex items-center rounded-lg border border-border bg-muted p-0.5">
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "card"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-vibe-purple border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && inspirations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
              <Bookmark className="w-9 h-9 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">灵感库为空</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              在提取器中上传截图，分析完成后自动保存到灵感库
            </p>
          </motion.div>
        )}

        {/* Card view */}
        {hasItems && viewMode === "card" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {inspirations.map((item) => (
                <InspirationCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onClick={setSelectedItem}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* List view */}
        {hasItems && viewMode === "list" && (
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {inspirations.map((item) => (
                <InspirationListItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onClick={setSelectedItem}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <InspirationDetail
          item={selectedItem}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      </main>
    </div>
  );
};

export default InspirationLibrary;
