import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Twitter, ImageIcon, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const GenerationForm = ({ onGenerate, isLoading }) => {
  const [postType, setPostType] = useState("twitter");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [tone, setTone] = useState("humoorikas");
  const [numPosts, setNumPosts] = useState([3]);

  const handleSinglePost = () => {
    onGenerate({
      type: "single",
      postType,
      description,
      tone,
    });
  };

  const handleMultiplePosts = () => {
    onGenerate({
      type: "multiple",
      story,
      tone,
      numPosts: numPosts[0],
    });
  };

  return (
    <Card className="glass glass-hover p-6 animate-fade-in">
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
          <TabsTrigger value="single" className="data-[state=active]:bg-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Single Post
          </TabsTrigger>
          <TabsTrigger value="multiple" className="data-[state=active]:bg-primary/20">
            <FileText className="w-4 h-4 mr-2" />
            Story to Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div>
            <Label className="mb-3 block text-base">Post Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPostType("twitter")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  postType === "twitter"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card/50 hover:border-primary/50"
                }`}
              >
                <Twitter className="w-6 h-6 mb-2 mx-auto text-accent" />
                <p className="font-semibold">Twitter/Meme</p>
                <p className="text-xs text-muted-foreground">Viral-worthy posts</p>
              </button>
              <button
                onClick={() => setPostType("regular")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  postType === "regular"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card/50 hover:border-primary/50"
                }`}
              >
                <ImageIcon className="w-6 h-6 mb-2 mx-auto text-secondary" />
                <p className="font-semibold">Regular Post</p>
                <p className="text-xs text-muted-foreground">Standard content</p>
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block text-base">
              Image Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the image you want to generate... (e.g., 'A serene sunset over mountains with vibrant orange and purple skies')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] bg-input/50 border-border focus:border-primary resize-none"
            />
          </div>

          <div>
            <Label htmlFor="tone" className="mb-2 block text-base">
              Tone & Style
            </Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone" className="bg-input/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-border">
                <SelectItem value="sõbralik">Sõbralik</SelectItem>
                <SelectItem value="humoorikas">Humoorikas</SelectItem>
                <SelectItem value="ametlik">Ametlik</SelectItem>
                <SelectItem value="noortepärane">Noortepärane</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSinglePost}
            disabled={isLoading || !description.trim()}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Magic...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Post
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Powered by AI • Generates in ~10-15 seconds
          </p>
        </TabsContent>

        <TabsContent value="multiple" className="space-y-6">
          <div>
            <Label htmlFor="story" className="mb-2 block text-base">
              Your Story or Article
            </Label>
            <Textarea
              id="story"
              placeholder="Paste your story, article, or long-form content here. The AI will extract key insights and create multiple engaging posts..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="min-h-[200px] bg-input/50 border-border focus:border-primary resize-none"
            />
          </div>

          <div>
            <Label className="mb-3 block text-base">
              Number of Posts: <Badge className="ml-2">{numPosts[0]}</Badge>
            </Label>
            <Slider
              value={numPosts}
              onValueChange={setNumPosts}
              min={2}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>2 posts</span>
              <span>5 posts</span>
            </div>
          </div>

          <div>
            <Label htmlFor="tone-multi" className="mb-2 block text-base">
              Tone & Style
            </Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone-multi" className="bg-input/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-border">
                <SelectItem value="sõbralik">Sõbralik</SelectItem>
                <SelectItem value="humoorikas">Humoorikas</SelectItem>
                <SelectItem value="ametlik">Ametlik</SelectItem>
                <SelectItem value="noortepärane">Noortepärane</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleMultiplePosts}
            disabled={isLoading || !story.trim()}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-secondary to-pink hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating {numPosts[0]} Posts...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Multiple Posts
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Generates {numPosts[0]} unique posts from your content
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
