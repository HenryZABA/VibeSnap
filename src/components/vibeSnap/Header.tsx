import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QrCode, Bookmark } from "lucide-react";

interface HeaderProps {
  inspirationCount?: number;
}

const Header = ({ inspirationCount = 0 }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isExtractor = location.pathname === "/" || location.pathname === "/extractor";
  const isLibrary = location.pathname === "/library";

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-card border-b border-border">
      <div
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="w-9 h-9 rounded-lg bg-vibe-dark flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white"/>
          </svg>
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">
          VibeSnap
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={isExtractor ? "default" : "outline"}
          size="sm"
          onClick={() => navigate("/extractor")}
          className={isExtractor ? "bg-vibe-dark text-card hover:bg-vibe-dark/90" : ""}
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">提取器</span>
        </Button>
        <Button
          variant={isLibrary ? "default" : "outline"}
          size="sm"
          onClick={() => navigate("/library")}
          className={isLibrary ? "bg-vibe-dark text-card hover:bg-vibe-dark/90" : "relative"}
        >
          <Bookmark className="w-4 h-4" />
          <span className="hidden sm:inline">灵感库</span>
          {inspirationCount > 0 && (
            <span className="ml-1 min-w-[18px] h-[18px] rounded-full bg-vibe-purple text-[11px] font-semibold text-card flex items-center justify-center px-1">
              {inspirationCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
