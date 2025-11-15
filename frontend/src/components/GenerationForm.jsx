import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Twitter, ImageIcon, FileText, Film, Mic, MicOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { toast } from "sonner";

export const GenerationForm = ({ onGenerate, isLoading }) => {
  const [postType, setPostType] = useState("twitter");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [tone, setTone] = useState("humoorikas");
  const [numPosts, setNumPosts] = useState([3]);

  // ⬇️ UUS: Sora video pikkus (4, 8, 12)
  const [videoSeconds, setVideoSeconds] = useState(4);
  const [videoSize, setVideoSize] = useState("720x1280");
  const [videoWithText, setVideoWithText] = useState(false);

  // Speech recognition for description
  const {
    isListening: isListeningDescription,
    transcript: descriptionTranscript,
    isSupported: isSpeechSupported,
    startListening: startDescriptionListening,
    stopListening: stopDescriptionListening,
    resetTranscript: resetDescriptionTranscript,
  } = useSpeechRecognition();

  // Speech recognition for story
  const {
    isListening: isListeningStory,
    transcript: storyTranscript,
    startListening: startStoryListening,
    stopListening: stopStoryListening,
    resetTranscript: resetStoryTranscript,
  } = useSpeechRecognition();

  // Update description when speech transcript changes
  useEffect(() => {
    if (descriptionTranscript) {
      setDescription(descriptionTranscript);
    }
  }, [descriptionTranscript]);

  // Update story when speech transcript changes
  useEffect(() => {
    if (storyTranscript) {
      setStory(storyTranscript);
    }
  }, [storyTranscript]);

  const toggleDescriptionListening = () => {
    if (!isSpeechSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isListeningDescription) {
      stopDescriptionListening();
      toast.success("Recording stopped");
    } else {
      resetDescriptionTranscript();
      startDescriptionListening();
      toast.info("Listening... Speak your post idea");
    }
  };

  const toggleStoryListening = () => {
    if (!isSpeechSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isListeningStory) {
      stopStoryListening();
      toast.success("Recording stopped");
    } else {
      resetStoryTranscript();
      startStoryListening();
      toast.info("Listening... Tell your story");
    }
  };

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

    const handleVideoGeneration = () => {
      onGenerate({
        type: "video",
        videoPrompt,
        videoSeconds,
        videoSize,
        videoWithText,
      });
    };


  return (
    <Card className="glass glass-hover p-6 animate-fade-in">
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50">
          <TabsTrigger value="single" className="data-[state=active]:bg-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Single Post
          </TabsTrigger>
          <TabsTrigger value="multiple" className="data-[state=active]:bg-primary/20">
            <FileText className="w-4 h-4 mr-2" />
            Story to Posts
          </TabsTrigger>
          <TabsTrigger value="video" className="data-[state=active]:bg-primary/20">
            <Film className="w-4 h-4 mr-2" />
            Sora Video
          </TabsTrigger>
        </TabsList>

        {/* SINGLE POST TAB */}
        <TabsContent value="single" className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="post-description" className="text-base">
                Image Description
              </Label>
              <Button
                type="button"
                size="sm"
                variant={isListeningDescription ? "destructive" : "outline"}
                onClick={toggleDescriptionListening}
                className={`${
                  isListeningDescription 
                    ? "animate-pulse bg-red-500 hover:bg-red-600" 
                    : "border-secondary/20 hover:bg-secondary/10"
                }`}
              >
                {isListeningDescription ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Speak
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="post-description"
              placeholder="Describe the image or scenario you want to create a meme about... or use voice input!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[150px] bg-input/50 border-border focus:border-primary resize-none"
            />
            {isListeningDescription && (
              <p className="text-xs text-secondary mt-2 animate-pulse flex items-center">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Listening... Describe your post idea
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="post-type" className="mb-2 block text-base">
              Post Type
            </Label>
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger id="post-type" className="bg-input/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-border">
                <SelectItem value="twitter">Twitter Meme (text overlay)</SelectItem>
                <SelectItem value="regular">Regular Post (caption only)</SelectItem>
              </SelectContent>
            </Select>
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
            className="w-full h-14 text-lg font-semibold bg-linear-to-r from-primary to-secondary hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Post...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Single Post
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Creates a single social media post with AI-generated image and caption
          </p>
        </TabsContent>


        {/* MULTIPLE POSTS TAB */}
        <TabsContent value="multiple" className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="story" className="text-base">
                Your Story or Article
              </Label>
              <Button
                type="button"
                size="sm"
                variant={isListeningStory ? "destructive" : "outline"}
                onClick={toggleStoryListening}
                className={`${
                  isListeningStory 
                    ? "animate-pulse bg-red-500 hover:bg-red-600" 
                    : "border-secondary/20 hover:bg-secondary/10"
                }`}
              >
                {isListeningStory ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Speak
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="story"
              placeholder="Paste your story, article, or long-form content here... or use voice input!"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="min-h-[200px] bg-input/50 border-border focus:border-primary resize-none"
            />
            {isListeningStory && (
              <p className="text-xs text-secondary mt-2 animate-pulse flex items-center">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Listening... Tell your story
              </p>
            )}
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
            className="w-full h-14 text-lg font-semibold bg-linear-to-r from-secondary to-pink hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50"
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

        {/* SORA VIDEO TAB */}
        <TabsContent value="video" className="space-y-6">
          <div>
            <Label htmlFor="video-prompt" className="mb-2 block text-base">
              Video Description
            </Label>
            <Textarea
              id="video-prompt"
              placeholder="Describe the video you want to create..."
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              className="min-h-[150px] bg-input/50 border-border focus:border-primary resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 Tip: Be specific about visuals, camera movements, lighting, etc.
            </p>
          </div>

          {/* UUS: kestus + suurus */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-base">Duration</Label>
              <Select value={videoSeconds} onValueChange={setVideoSeconds}>
                <SelectTrigger className="bg-input/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border">
                  <SelectItem value="4">4 seconds</SelectItem>
                  <SelectItem value="8">8 seconds</SelectItem>
                  <SelectItem value="12">12 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-base">Aspect ratio</Label>
              <Select value={videoSize} onValueChange={setVideoSize}>
                <SelectTrigger className="bg-input/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border">
                  <SelectItem value="720x1280">Portrait 9:16 (Reels/TikTok)</SelectItem>
                  <SelectItem value="1280x720">Landscape 16:9 (YouTube)</SelectItem>
                  <SelectItem value="1080x1080">Square 1:1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* UUS: “meme text on/off” */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Meme-style text overlay</Label>
              <p className="text-xs text-muted-foreground">
                Uses the same top/bottom text style as your Twitter memes
              </p>
            </div>
            <Switch
              checked={videoWithText}
              onCheckedChange={setVideoWithText}
            />
          </div>

          <Button
            onClick={handleVideoGeneration}
            disabled={isLoading || !videoPrompt.trim()}
            className="w-full h-14 text-lg font-semibold bg-linear-to-r from-accent via-purple-500 to-pink-500 hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Film className="w-5 h-5 mr-2" />
                Generate with Sora
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Powered by OpenAI Sora • Generates in ~30-60 seconds
          </p>
        </TabsContent>

      </Tabs>
    </Card>
  );
};
