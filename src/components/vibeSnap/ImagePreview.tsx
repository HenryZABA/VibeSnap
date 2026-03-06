import { motion } from "framer-motion";

interface ImagePreviewProps {
  imageUrl: string;
}

const ImagePreview = ({ imageUrl }: ImagePreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 250, damping: 25 }}
      className="space-y-3"
    >
      <h3 className="text-base font-semibold text-foreground">原图</h3>
      <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
        <img
          src={imageUrl}
          alt="Uploaded design"
          className="w-full h-auto max-h-[500px] object-contain"
        />
      </div>
    </motion.div>
  );
};

export default ImagePreview;
