import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DesignExtractionResult, InspirationItem } from "@/types/vibeSnap";

export function useInspirations() {
  const queryClient = useQueryClient();

  const { data: inspirations = [], isLoading } = useQuery({
    queryKey: ["inspirations"],
    queryFn: async (): Promise<InspirationItem[]> => {
      const { data, error } = await supabase
        .from("inspirations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as InspirationItem[];
    },
  });

  const addInspiration = useMutation({
    mutationFn: async ({
      imageUrl,
      result,
      title,
    }: {
      imageUrl: string;
      result: DesignExtractionResult;
      title?: string;
    }) => {
      const { error } = await supabase.from("inspirations").insert({
        image_url: imageUrl,
        extraction_result: result as unknown as Record<string, unknown>,
        title: title || result.title || "未命名设计",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspirations"] });
    },
  });

  const removeInspiration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("inspirations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspirations"] });
    },
  });

  const isImageFavorited = (imageUrl: string) => {
    return inspirations.some((item) => item.image_url === imageUrl);
  };

  const getInspirationByImage = (imageUrl: string) => {
    return inspirations.find((item) => item.image_url === imageUrl);
  };

  return {
    inspirations,
    isLoading,
    addInspiration,
    removeInspiration,
    isImageFavorited,
    getInspirationByImage,
    count: inspirations.length,
  };
}
