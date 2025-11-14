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
  const [history, setHistory] = useState([]);

  const handleGenerate = async (data) => {
    setLoading(true);
    setError("");

    try {
      if (data.type === "single") {
        // Single post generation
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
          type: result.postType === "twitter" ? "Twitter/Meme" : "Regular Post",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setCurrentPost(newPost);
        setHistory((prev) => [newPost, ...prev]);
        setStoryPosts([]); // Clear story posts when generating single post
      } else {
        // Multiple posts from story
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
          type: post.postType === "twitter" ? "Twitter/Meme" : "Regular Post",
          angle: post.angle,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setStoryPosts(generatedPosts);
        setCurrentPost(generatedPosts[0]); // Show first post in preview
        setHistory((prev) => [...generatedPosts, ...prev]);
      }
    } catch (err) {
      console.error(err);
      setError("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
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
                      <p className="text-sm leading-relaxed">{post.caption}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(post.caption)}
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
            <span className="gradient-text font-semibold">socAI</span> • Powered
            by xAI Grok • Built with ❤️ for creators
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
