import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const LivePreview = ({ post }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    if (post?.caption) {
      navigator.clipboard.writeText(post.caption);
      toast({
        title: "Caption Copied!",
        description: "Caption has been copied to your clipboard.",
      });
    }
  };

  const handleDownload = () => {
    if (post?.imageUrl) {
      const link = document.createElement("a");
      link.href = post.imageUrl;
      link.download = "socai-generated.png";
      link.click();
      toast({
        title: "Download Started!",
        description: "Your image is being downloaded.",
      });
    }
  };

  if (!post) {
    return (
      <Card className="glass glass-hover p-8 animate-fade-in sticky top-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto animate-float">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to Create</h3>
            <p className="text-muted-foreground text-sm">
              Your generated posts will appear here with a live preview
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass glass-hover p-6 animate-fade-in sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Latest Generated Post</h3>
        <div className="flex gap-2">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            LIVE
          </Badge>
          <Badge variant="outline" className="border-accent/20 text-accent">
            {post.type}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative rounded-lg overflow-hidden group">
          <img
            src={post.imageUrl}
            alt="Generated"
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.caption}</p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1 border-primary/20 hover:bg-primary/10 hover:border-primary/40"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Caption
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 border-accent/20 hover:bg-accent/10 hover:border-accent/40"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
};
