import { useState } from "react";

function App() {
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("sõbralik");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // viimane genereering (peavaade)
  const [caption, setCaption] = useState("");
  const [imageBase64, setImageBase64] = useState("");

  // AJALUGU – kõik genereeritud postitused
  const [history, setHistory] = useState([]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4000/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, tone }),
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
        caption: data.caption,
        imageBase64: data.imageBase64,
        createdAt: new Date().toISOString(),
      };

      setCaption(newPost.caption);
      setImageBase64(newPost.imageBase64);

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

  const containerStyle = {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #1e293b 0, #020617 45%, #000 100%)",
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
            Kirjelda stseeni eesti keeles, vali toon ja socAI genereerib sulle
            postituse: unikaalne pilt + pildile peale pandud tekst, mida saad
            kohe kasutada.
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
              NB! Demo kasutab OpenAI API-t, seega generaator võib mõnikord
              vastuseid veidi varieerida. Tekstid ja pildid on loodud
              automaatselt.
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
                <span
                  style={{
                    ...pillStyle,
                    background: "rgba(56,189,248,0.12)",
                    border: "1px solid rgba(56,189,248,0.5)",
                    color: "#e0f2fe",
                  }}
                >
                  LIVE
                </span>
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
                    Caption (tekst):
                  </h3>
                  <p style={{ marginBottom: 8 }}>{caption}</p>
                  <button
                    type="button"
                    onClick={() => handleCopyCaption(caption)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.9)",
                      background: "transparent",
                      color: "white",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Kopeeri caption
                  </button>
                </div>

                {imageBase64 && (
                  <div>
                    <h3 style={{ fontSize: 16, marginBottom: 4 }}>
                      Pilt tekstiga:
                    </h3>
                    <img
                      src={`data:image/png;base64,${imageBase64}`}
                      alt="Genereeritud postitus"
                      style={{
                        maxWidth: "100%",
                        borderRadius: 14,
                        border: "1px solid rgba(15,23,42,1)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadImage(
                          imageBase64,
                          "socAI-post-latest.png"
                        )
                      }
                      style={{
                        marginTop: 10,
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: "none",
                        background: "rgba(34,197,94,0.9)",
                        color: "#020617",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Laadi pilt alla
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* AJALUGU */}
        {history.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Genereeritud ajalugu</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              {history.map((post, idx) => (
                <div key={post.id} style={subtleCardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        opacity: 0.8,
                      }}
                    >
                      #{history.length - idx}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        opacity: 0.6,
                      }}
                    >
                      {new Date(post.createdAt).toLocaleTimeString("et-EE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      opacity: 0.75,
                      marginBottom: 4,
                    }}
                  >
                    <strong>Kirjeldus:</strong> {post.description}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      opacity: 0.75,
                      marginBottom: 4,
                    }}
                  >
                    <strong>Toon:</strong> {post.tone}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      marginBottom: 8,
                    }}
                  >
                    <strong>Caption:</strong> {post.caption}
                  </p>

                  {post.imageBase64 && (
                    <img
                      src={`data:image/png;base64,${post.imageBase64}`}
                      alt="History post"
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        marginBottom: 8,
                      }}
                    />
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCopyCaption(post.caption)}
                      style={{
                        flex: 1,
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: "1px solid rgba(148,163,184,0.7)",
                        background: "transparent",
                        color: "white",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      Kopeeri caption
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadImage(
                          post.imageBase64,
                          `socAI-post-${post.id}.png`
                        )
                      }
                      style={{
                        flex: 1,
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: "none",
                        background: "rgba(34,197,94,0.9)",
                        color: "#020617",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Laadi pilt alla
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
