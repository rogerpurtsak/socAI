import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { GenerationForm } from "./components/GenerationForm";
import { LivePreview } from "./components/LivePreview";
import { PostsGallery } from "./components/PostsGallery";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPost, setCurrentPost] = useState(null);
  const [storyPosts, setStoryPosts] = useState([]);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [history, setHistory] = useState([]);

  // UUS: hoian meeles Sora job’i staatust (soovi korral saad UI-s näidata)
  const [videoJobId, setVideoJobId] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);

  // 🔁 Polli Sora job’i staatust, kuni completed/failed
  const pollVideoStatus = (id, prompt) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/video/${id}/status`
        );
        const data = await res.json();

        console.log("Sora status:", data);
        setVideoStatus(data.status);

        if (data.status === "completed") {
          clearInterval(interval);
          setLoading(false);

          const videoUrl = `http://localhost:4000/api/video/${id}/content`;

          const newVideo = {
            id,
            videoUrl,
            prompt,
            type: "Sora Video",
            expiresAt: data.expires_at,
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setGeneratedVideo(newVideo);
          setHistory((prev) => [newVideo, ...prev]);
          setCurrentPost(null);
          setStoryPosts([]);
        }

        if (data.status === "failed") {
          clearInterval(interval);
          setLoading(false);
          console.error("Video failed:", data.error);
          setError(data.error || "Video generation failed");
        }
      } catch (e) {
        clearInterval(interval);
        setLoading(false);
        console.error("Status poll error:", e);
        setError("Failed to check video status");
      }
    }, 3000);
  };

  const handleGenerate = async (data) => {
    setError("");

    // SINGLE POST
    if (data.type === "single") {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/api/generate-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: data.description,
            tone: data.tone,
            postType: data.postType,
          }),
        });

        const result = await res.json();

        if (!res.ok || result.error) {
          setError(result.error || "Something went wrong");
          return;
        }

        const newPost = {
          id: Date.now(),
          imageUrl: `data:image/png;base64,${result.imageBase64}`,
          caption: result.caption,
          type:
            result.postType === "twitter" ? "Twitter/Meme" : "Regular Post",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setCurrentPost(newPost);
        setHistory((prev) => [newPost, ...prev]);
        setStoryPosts([]);
        setGeneratedVideo(null);
      } catch (err) {
        console.error(err);
        setError("Server connection error");
      } finally {
        setLoading(false);
      }

      return;
    }

    // VIDEO (SORA)
    if (data.type === "video") {
      setLoading(true);
      setGeneratedVideo(null);
      setVideoJobId(null);
      setVideoStatus(null);

      try {
        const res = await fetch("http://localhost:4000/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: data.videoPrompt,
            seconds: data.videoSeconds,
            withText: data.videoWithText,
          }),
        });


        const result = await res.json();
        console.log("generate-video result:", result);

        if (!res.ok || result.error) {
          setError(result.error || "Failed to generate video");
          setLoading(false);
          return;
        }

        // Backend tagastab nüüd job info: { success, id, status, ... }
        setVideoJobId(result.id);
        setVideoStatus(result.status || "queued");

        // Käivitame polling’u; see paneb hiljem generatedVideo paika,
        // kui status === "completed"
        pollVideoStatus(result.id, data.videoPrompt);
      } catch (err) {
        console.error(err);
        setError("Server connection error");
        setLoading(false);
      }

      return;
    }

    // STORY -> MULTIPLE POSTS
    if (data.type === "multiple") {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/api/story-to-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storyText: data.story,
            numberOfPosts: data.numPosts,
            tone: data.tone,
          }),
        });

        const result = await res.json();

        if (!res.ok || result.error) {
          setError(result.error || "Failed to generate posts");
          return;
        }

        const generatedPosts = result.posts.map((post) => ({
          id: post.id,
          imageUrl: `data:image/png;base64,${post.imageBase64}`,
          caption: post.caption,
          type:
            post.postType === "twitter" ? "Twitter/Meme" : "Regular Post",
          angle: post.angle,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setStoryPosts(generatedPosts);
        setCurrentPost(generatedPosts[0]);
        setHistory((prev) => [...generatedPosts, ...prev]);
        setGeneratedVideo(null);
      } catch (err) {
        console.error(err);
        setError("Server connection error");
      } finally {
        setLoading(false);
      }

      return;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-card">
      <Header />
      <Hero />

      <main className="container mx-auto px-4 pb-20">
        {/* Main Generation Area */}
        <div className="grid lg:grid-cols-[1.2fr,1.6fr] gap-8 mb-12">
          <GenerationForm onGenerate={handleGenerate} isLoading={loading} />
          <LivePreview post={currentPost} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center animate-fade-in">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        {/* Video Generation Results */}
        {generatedVideo && (
          <div className="mb-12 animate-fade-in">
            <div className="glass glass-hover rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">🎬 Generated Sora Video</h2>
              </div>

              {videoStatus && (
                <p className="text-xs text-muted-foreground mb-4">
                  Status: {videoStatus}
                </p>
              )}

              <div className="glass rounded-lg p-6 space-y-4">
                <video
                  src={generatedVideo.videoUrl}
                  controls
                  className="w-full rounded-lg bg-black"
                  style={{ maxHeight: "500px" }}
                >
                  Your browser does not support the video tag.
                </video>

                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">Prompt:</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {generatedVideo.prompt}
                  </p>
                </div>

                {generatedVideo.expiresAt && (
                  <div className="text-xs text-muted-foreground">
                    ⏱️ Expires:{" "}
                    {new Date(
                      generatedVideo.expiresAt
                    ).toLocaleString()}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = generatedVideo.videoUrl;
                      link.download = `sora-video-${generatedVideo.id}.mp4`;
                      link.click();
                    }}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-accent/20 hover:bg-accent/10 transition-all font-semibold"
                  >
                    💾 Download Video
                  </button>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(generatedVideo.prompt)
                    }
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-primary/20 hover:bg-primary/10 transition-all font-semibold"
                  >
                    📋 Copy Prompt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Story Posts Results */}
        {storyPosts.length > 0 && (
          <div className="mb-12 animate-fade-in">
            <div className="glass glass-hover rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  ✨ Generated {storyPosts.length} Posts from Your Story
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storyPosts.map((post, idx) => (
                  <div
                    key={post.id}
                    className="glass glass-hover rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Post #{idx + 1}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {post.type}
                      </span>
                    </div>

                    {post.angle && (
                      <p className="text-xs italic text-muted-foreground">
                        💡 {post.angle}
                      </p>
                    )}

                    <img
                      src={post.imageUrl}
                      alt={`Post ${idx + 1}`}
                      className="w-full rounded-lg"
                    />

                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm leading-relaxed">
                        {post.caption}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(post.caption)
                        }
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-primary/20 hover:bg-primary/10 transition-all"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = post.imageUrl;
                          link.download = `story-post-${idx + 1}.png`;
                          link.click();
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-accent/20 hover:bg-accent/10 transition-all"
                      >
                        💾 Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Gallery */}
        <PostsGallery posts={history} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center">
        <div className="container mx-auto px-4">
          <p className="text-sm text-muted-foreground">
            <span className="gradient-text font-semibold">socAI</span> •
            Powered by xAI Grok • Built with ❤️ for creators
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
