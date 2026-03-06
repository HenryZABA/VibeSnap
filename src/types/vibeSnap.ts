export interface PaletteColor {
  name: string;
  hex: string;
  usage: string[];
  description?: string;
}

export interface FontEntry {
  name: string;
  display_name: string;
  css: string;
}

export interface DesignTokens {
  radius: { base: string; pill: string };
  shadow: { base: string; hover: string };
  border: { style: string };
  spacing: { grid: string; layout: string };
}

export interface DesignExtractionResult {
  title?: string;
  summary: {
    style_text: string;
    tags: string[];
  };
  palette: PaletteColor[];
  typography: {
    fonts: FontEntry[];
    scale_hint?: string;
  };
  tokens: DesignTokens;
  prompt: {
    text: string;
    version: string;
  };
}

export interface InspirationItem {
  id: string;
  title: string;
  image_url: string;
  extraction_result: DesignExtractionResult;
  created_at: string;
  updated_at: string;
}
