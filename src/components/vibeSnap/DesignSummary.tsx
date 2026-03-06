import { ScrollArea } from "@/components/ui/scroll-area";
import StyleSummary from "./StyleSummary";
import ColorPalette from "./ColorPalette";
import TypographySection from "./TypographySection";
import VisualTokens from "./VisualTokens";
import type { DesignExtractionResult } from "@/types/vibeSnap";

interface DesignSummaryProps {
  result: DesignExtractionResult;
}

const DesignSummary = ({ result }: DesignSummaryProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      <div className="space-y-5 pr-4 pb-6">
        <StyleSummary result={result} />
        <ColorPalette palette={result.palette} />
        <TypographySection fonts={result.typography.fonts} />
        <VisualTokens tokens={result.tokens} />
      </div>
    </ScrollArea>
  );
};

export default DesignSummary;
