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
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4000/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, tone, postType }), // Send postType
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Midagi läks valesti");
        return;
      }

      const newPost = {
        id: Date.now(),
        description,
        tone,
        postType: data.postType, // Store post type
        caption: data.caption,
        imageBase64: data.imageBase64,
        createdAt: new Date().toISOString(),
      };

      setCaption(newPost.caption);
      setImageBase64(newPost.imageBase64);
      setCurrentPostType(data.postType);

      // lisa AJALUKKU algusesse
      setHistory((prev) => [newPost, ...prev]);
    } catch (err) {
      console.error(err);
      setError("Serveriga ühenduse viga");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCaption = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Caption kopeeritud lõikelauale ✅");
    } catch (e) {
      alert("Captioni kopeerimine ebaõnnestus");
    }
  };

  const handleDownloadImage = (imageBase64, filename = "socai-post.png") => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imageBase64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // NEW: Handle story generation
  const handleStoryGenerate = async (e) => {
    e.preventDefault();
    if (!storyText.trim() || storyText.trim().length < 20) {
      setError("Story text is too short!");
      return;
    }

    setStoryLoading(true);
    setError("");
    setStoryPosts([]);

    try {
      const res = await fetch("http://localhost:4000/api/story-to-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyText,
          numberOfPosts,
          tone,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to generate posts");
        return;
      }

      setStoryPosts(data.posts);

      // Add all to history
      const newPosts = data.posts.map((post) => ({
        ...post,
        description: `From story: ${storyText.substring(0, 50)}...`,
        tone,
        createdAt: new Date().toISOString(),
      }));
      setHistory((prev) => [...newPosts, ...prev]);
    } catch (err) {
      console.error(err);
      setError("Server connection error");
    } finally {
      setStoryLoading(false);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #1e293b 0, #020617 45%, #000 100%)",
    color: "white",
    padding: "24px",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const cardStyle = {
    background: "rgba(15,23,42,0.95)",
    padding: 16,
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.25)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
  };

  const subtleCardStyle = {
    background: "rgba(15,23,42,0.85)",
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(51,65,85,0.8)",
  };

  const pillStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.08,
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {/* HEADER */}
        <header style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.4)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.12,
              color: "#bbf7d0",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "999px",
                background: "#22c55e",
              }}
            />
            socAI · hackathon demo
          </div>
          <h1
            style={{
              fontSize: 32,
              marginTop: 16,
              marginBottom: 8,
              letterSpacing: -0.02,
            }}
          >
            Automaatne sotsiaalmeedia{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, #22c55e, #a855f7, #38bdf8)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              pilt + caption
            </span>{" "}
            ühe klikiga
          </h1>
          <p style={{ opacity: 0.8, maxWidth: 600 }}>
            Kirjelda stseeni eesti keeles, vali toon ja postituse tüüp. socAI genereerib sulle
            postituse: unikaalne pilt + tekst, mida saad kohe kasutada.
          </p>
        </header>

        {/* PEAMINE GRID: vasakul vorm, paremal viimane tulemus */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.6fr)",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          {/* VORM */}
          <form onSubmit={handleGenerate} style={cardStyle}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Kirjelda postitust</h2>

            {/* NEW: Post Type Selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8 }}>
                Postituse tüüp:
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setPostType("twitter")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 10,
                    border:
                      postType === "twitter"
                        ? "2px solid #38bdf8"
                        : "1px solid #4b5563",
                    background:
                      postType === "twitter"
                        ? "rgba(56,189,248,0.15)"
                        : "#020617",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: postType === "twitter" ? 600 : 400,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 14, marginBottom: 4 }}>
                    🐦 Twitter / Meme
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Tekst pildil</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPostType("regular")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 10,
                    border:
                      postType === "regular"
                        ? "2px solid #a855f7"
                        : "1px solid #4b5563",
                    background:
                      postType === "regular"
                        ? "rgba(168,85,247,0.15)"
                        : "#020617",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: postType === "regular" ? 600 : 400,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 14, marginBottom: 4 }}>📱 Tavaline post</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Caption eraldi</div>
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8 }}>
                Pildi kirjeldus (eesti keeles):
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #4b5563",
                  resize: "vertical",
                  background: "#020617",
                  color: "white",
                }}
                placeholder='nt "Rõõmus kohvik Rapla keskväljakul, kevadine hommik, inimesed joovad kohvi ja naeravad."'
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8 }}>Toon:</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 999,
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "white",
                  width: "100%",
                }}
              >
                <option value="sõbralik">Sõbralik</option>
                <option value="humoorikas">Humoorikas</option>
                <option value="ametlik">Ametlik</option>
                <option value="noortepärane">Noortepärane</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !description.trim()}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                background:
                  loading || !description.trim()
                    ? "rgba(75,85,99,0.9)"
                    : "linear-gradient(90deg,#22c55e,#38bdf8)",
                color: "#020617",
                fontWeight: 600,
                cursor:
                  loading || !description.trim()
                    ? "not-allowed"
                    : "pointer",
                marginTop: 4,
                width: "100%",
              }}
            >
              {loading ? "Genereerin..." : "Genereeri postitus"}
            </button>

            {error && (
              <p style={{ color: "#f97373", marginTop: 12 }}>Viga: {error}</p>
            )}

            <p
              style={{
                marginTop: 16,
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              NB! Demo kasutab xAI Grok API-t. {postType === "twitter"
                ? "Twitter/meme stiilis tekstid pannakse otse pildile."
                : "Tavalise postituse puhul on pilt ja caption eraldi."}
            </p>
          </form>

          {/* VIIMANE TULEMUS */}
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
                alignItems: "center",
              }}
            >
              <h2 style={{ fontSize: 20 }}>Viimane genereeritud postitus</h2>
              {caption && (
                <div style={{ display: "flex", gap: 8 }}>
                  <span
                    style={{
                      ...pillStyle,
                      background:
                        currentPostType === "twitter"
                          ? "rgba(56,189,248,0.12)"
                          : "rgba(168,85,247,0.12)",
                      border:
                        currentPostType === "twitter"
                          ? "1px solid rgba(56,189,248,0.5)"
                          : "1px solid rgba(168,85,247,0.5)",
                      color: "#e0f2fe",
                    }}
                  >
                    {currentPostType === "twitter" ? "TWITTER" : "REGULAR"}
                  </span>
                  <span
                    style={{
                      ...pillStyle,
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.5)",
                      color: "#bbf7d0",
                    }}
                  >
                    LIVE
                  </span>
                </div>
              )}
            </div>

            {!caption && !imageBase64 && (
              <p style={{ opacity: 0.7 }}>
                Genereri esimene postitus – tulemus ilmub siia.
              </p>
            )}

            {caption && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 4 }}>
                    {currentPostType === "twitter"
                      ? "Caption (tekst pildil):"
                      : "Caption:"}
                  </h3>
                  <div
                    style={{
                      ...subtleCardStyle,
                      padding: 14,
                      fontSize: 15,
                      lineHeight: 1.5,
                    }}
                  >
                    {caption}
                  </div>
                  <button
                    onClick={() => handleCopyCaption(caption)}
                    style={{
                      marginTop: 8,
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: "1px solid #4b5563",
                      background: "#020617",
                      color: "white",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Kopeeri caption
                  </button>
                </div>

                {imageBase64 && (
                  <div>
                    <h3 style={{ fontSize: 16, marginBottom: 8 }}>Pilt:</h3>
                    <img
                      src={`data:image/png;base64,${imageBase64}`}
                      alt="Generated"
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: "1px solid rgba(148,163,184,0.2)",
                      }}
                    />
                    <button
                      onClick={() =>
                        handleDownloadImage(
                          imageBase64,
                          `socai-${currentPostType}-${Date.now()}.png`
                        )
                      }
                      style={{
                        marginTop: 8,
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: "1px solid #4b5563",
                        background: "#020617",
                        color: "white",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      Lae pilt alla
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* AJALUGU */}
        {history.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              Varasemad genereeringud ({history.length})
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {history.map((item) => (
                <div key={item.id} style={subtleCardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        ...pillStyle,
                        background:
                          item.postType === "twitter"
                            ? "rgba(56,189,248,0.12)"
                            : "rgba(168,85,247,0.12)",
                        border:
                          item.postType === "twitter"
                            ? "1px solid rgba(56,189,248,0.4)"
                            : "1px solid rgba(168,85,247,0.4)",
                        color: "#e0f2fe",
                      }}
                    >
                      {item.postType === "twitter" ? "🐦 Twitter" : "📱 Regular"}
                    </span>
                    <span style={{ fontSize: 11, opacity: 0.6 }}>
                      {new Date(item.createdAt).toLocaleTimeString("et-EE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {item.imageBase64 && (
                    <img
                      src={`data:image/png;base64,${item.imageBase64}`}
                      alt="History"
                      style={{
                        width: "100%",
                        borderRadius: 6,
                        marginBottom: 8,
                      }}
                    />
                  )}
                  <p
                    style={{
                      fontSize: 13,
                      marginBottom: 8,
                      opacity: 0.9,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.caption}
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleCopyCaption(item.caption)}
                      style={{
                        flex: 1,
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: "1px solid #4b5563",
                        background: "#020617",
                        color: "white",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      📋
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadImage(
                          item.imageBase64,
                          `socai-${item.postType}-${item.id}.png`
                        )
                      }
                      style={{
                        flex: 1,
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: "1px solid #4b5563",
                        background: "#020617",
                        color: "white",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      💾
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STORY TO POSTS SECTION */}
        <div style={{ ...cardStyle, marginTop: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 24 }}>📝</span>
            <h2 style={{ fontSize: 20, margin: 0 }}>
              Story/Text to Multiple Posts
            </h2>
          </div>

          <p
            style={{
              opacity: 0.8,
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            Paste any story, news article, game analysis, or text and AI will
            create multiple viral posts from it!
          </p>

          <form onSubmit={handleStoryGenerate}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8 }}>
                Your Story/Text/Analysis:
              </label>
              <textarea
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                rows={8}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #4b5563",
                  resize: "vertical",
                  background: "#020617",
                  color: "white",
                }}
                placeholder={`Example: 'Real Madrid defeated Barcelona 3-1 in El Clasico. Messi missed a penalty in the 67th minute. Ronaldo scored a hat-trick and celebrated by doing his iconic SIUU celebration...'`}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  Number of posts to generate:
                </label>
                <select
                  value={numberOfPosts}
                  onChange={(e) => setNumberOfPosts(Number(e.target.value))}
                  style={{
                    padding: 10,
                    borderRadius: 999,
                    border: "1px solid #4b5563",
                    background: "#020617",
                    color: "white",
                    width: "100%",
                  }}
                >
                  <option value={2}>2 posts</option>
                  <option value={3}>3 posts</option>
                  <option value={4}>4 posts</option>
                  <option value={5}>5 posts</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  Tone:
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  style={{
                    padding: 10,
                    borderRadius: 999,
                    border: "1px solid #4b5563",
                    background: "#020617",
                    color: "white",
                    width: "100%",
                  }}
                >
                  <option value="sõbralik">Sõbralik</option>
                  <option value="humoorikas">Humoorikas</option>
                  <option value="ametlik">Ametlik</option>
                  <option value="noortepärane">Noortepärane</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={storyLoading || storyText.trim().length < 20}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                background:
                  storyLoading || storyText.trim().length < 20
                    ? "rgba(75,85,99,0.9)"
                    : "linear-gradient(90deg,#a855f7,#ec4899)",
                color: "white",
                fontWeight: 600,
                cursor:
                  storyLoading || storyText.trim().length < 20
                    ? "not-allowed"
                    : "pointer",
                width: "100%",
              }}
            >
              {storyLoading
                ? `Generating ${numberOfPosts} posts...`
                : `🚀 Generate ${numberOfPosts} Posts from Story`}
            </button>
          </form>

          {/* Display generated posts */}
          {storyPosts.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 18, marginBottom: 12 }}>
                ✨ Generated {storyPosts.length} Posts
              </h3>
              <div style={{ display: "grid", gap: 16 }}>
                {storyPosts.map((post, idx) => (
                  <div
                    key={post.id}
                    style={{ ...subtleCardStyle, padding: 16 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 15 }}>
                        Post #{idx + 1}
                      </span>
                      <span
                        style={{
                          ...pillStyle,
                          background:
                            post.postType === "twitter"
                              ? "rgba(56,189,248,0.12)"
                              : "rgba(168,85,247,0.12)",
                          border:
                            post.postType === "twitter"
                              ? "1px solid rgba(56,189,248,0.5)"
                              : "1px solid rgba(168,85,247,0.5)",
                          color: "#e0f2fe",
                        }}
                      >
                        {post.postType === "twitter" ? "🐦 MEME" : "📱 POST"}
                      </span>
                    </div>

                    {post.angle && (
                      <p
                        style={{
                          fontSize: 12,
                          opacity: 0.7,
                          marginBottom: 12,
                          fontStyle: "italic",
                        }}
                      >
                        💡 {post.angle}
                      </p>
                    )}

                    {post.imageBase64 && (
                      <img
                        src={`data:image/png;base64,${post.imageBase64}`}
                        alt={`Post ${idx + 1}`}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          marginBottom: 12,
                        }}
                      />
                    )}

                    <div
                      style={{
                        background: "#020617",
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {post.caption}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleCopyCaption(post.caption)}
                        style={{
                          flex: 1,
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: "1px solid #4b5563",
                          background: "#020617",
                          color: "white",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        📋 Copy Caption
                      </button>
                      <button
                        onClick={() =>
                          handleDownloadImage(post.imageBase64, `story-post-${idx + 1}.png`)
                        }
                        style={{
                          flex: 1,
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: "1px solid #4b5563",
                          background: "#020617",
                          color: "white",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        💾 Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
