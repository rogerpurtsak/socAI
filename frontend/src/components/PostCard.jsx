import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PostCard = ({ post }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(post.caption);
    toast({
      title: "Copied!",
      description: "Caption copied to clipboard.",
    });
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = post.imageUrl;
    link.download = `socai-${post.id}.png`;
    link.click();
    toast({
      title: "Download Started!",
    });
  };

  return (
    <Card className="glass glass-hover overflow-hidden group animate-fade-in">
      <div className="relative h-48 overflow-hidden">
        <img
          src={post.imageUrl}
          alt="Generated post"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className="bg-primary/80 backdrop-blur-sm">{post.type}</Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {post.angle && (
          <p className="text-xs italic text-muted-foreground">"{post.angle}"</p>
        )}
        
        <p className="text-sm line-clamp-3 leading-relaxed">{post.caption}</p>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">{post.timestamp}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-8 w-8 p-0 hover:bg-primary/10"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              className="h-8 w-8 p-0 hover:bg-accent/10"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
