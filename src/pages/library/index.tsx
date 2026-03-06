import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/vibeSnap/Header";
import InspirationCard from "@/components/vibeSnap/InspirationCard";
import InspirationListItem from "@/components/vibeSnap/InspirationListItem";
import InspirationDetail from "@/components/vibeSnap/InspirationDetail";
import { useInspirations } from "@/hooks/useInspirations";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  Download,
  Copy,
  ExternalLink,
  LayoutGrid,
  List,
  CheckSquare,
  X,
} from "lucide-react";
import type { InspirationItem } from "@/types/vibeSnap";

type ViewMode = "card" | "list";

const InspirationLibrary = () => {
  const { inspirations, isLoading, removeInspiration, count } = useInspirations();
  const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleRemove = async (id: string) => {
    await removeInspiration.mutateAsync(id);
    selectedIds.delete(id);
    setSelectedIds(new Set(selectedIds));
    toast({ title: "已从灵感库移除" });
  };

  const handleExportCSV = () => {
    if (inspirations.length === 0) return;
    const rows = inspirations.map((item) => {
      const prompt = (item.extraction_result?.prompt?.text || "").replace(/"/g, '""');
      return `"${prompt}"`;
    });
    const csv = rows.join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibeSnap-prompts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV 已导出" });
  };

  const handleCopyAllJson = async () => {
    if (inspirations.length === 0) return;
    const json = JSON.stringify(
      inspirations.map((item) => ({
        prompt: item.extraction_result?.prompt?.text || "",
      })),
      null,
      2
    );
    const ok = await copyToClipboard(json);
    if (ok) {
      toast({ title: "JSON 已复制到剪贴板" });
    }
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.size === inspirations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inspirations.map((i) => i.id)));
    }
  };

  const handleCopySelectedJson = async () => {
    if (selectedIds.size === 0) {
      toast({ title: "请先选择条目" });
      return;
    }
    const selected = inspirations.filter((i) => selectedIds.has(i.id));
    const json = JSON.stringify(
      selected.map((item) => ({
        prompt: item.extraction_result?.prompt?.text || "",
      })),
      null,
      2
    );
    const ok = await copyToClipboard(json);
    if (ok) {
      toast({ title: `已复制 ${selected.length} 条 JSON` });
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const enterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedIds(new Set());
  };

  const hasItems = !isLoading && inspirations.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header inspirationCount={count} />
      <main className="max-w-[1440px] mx-auto p-5">
        {/* Action bar */}
        {hasItems && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
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

            <div className="flex flex-wrap gap-2">
              {!selectionMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={enterSelectionMode}
                    className="text-xs gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    批量操作
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAllJson}
                    className="text-xs gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    复制全部 JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="text-xs gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    导出 CSV
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      window.open(
                        "http://enter-admin.dev.knoffice.tech/auto-template/batch-create?env=dev",
                        "_blank"
                      )
                    }
                    className="text-xs gap-1.5 bg-vibe-purple hover:bg-vibe-purple/90 text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    去生成
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    {selectedIds.size === inspirations.length ? "取消全选" : "全选"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySelectedJson}
                    disabled={selectedIds.size === 0}
                    className="text-xs gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    复制选中 JSON ({selectedIds.size})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exitSelectionMode}
                    className="text-xs gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    退出
                  </Button>
                </>
              )}
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
                  selectable={selectionMode}
                  selected={selectedIds.has(item.id)}
                  onSelect={toggleSelect}
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
                  selectable={selectionMode}
                  selected={selectedIds.has(item.id)}
                  onSelect={toggleSelect}
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
