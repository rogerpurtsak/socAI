import React, { useState } from "react";

export function SoraGenerator() {
  const [promptInput, setPromptInput] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function generateVideo() {
    try {
      setLoading(true);
      setErrorMsg(null);
      setVideoUrl(null);
      setStatus(null);
      setJobId(null);

      const res = await fetch("http://localhost:4000/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          seconds: 4,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Generate failed");
        setLoading(false);
        return;
      }

      setJobId(data.id);
      setStatus(data.status);

      pollStatus(data.id);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Unknown error");
      setLoading(false);
    }
  }

  function pollStatus(id) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/video/${id}/status`);
        const data = await res.json();

        setStatus(data.status);

        if (data.status === "completed") {
          clearInterval(interval);
          setLoading(false);
          setVideoUrl(`http://localhost:4000/api/video/${id}/content`);
        }

        if (data.status === "failed") {
          clearInterval(interval);
          setLoading(false);
          console.error("Video failed:", data.error);
          setErrorMsg(data.error || "Video failed");
        }
      } catch (e) {
        clearInterval(interval);
        setLoading(false);
        console.error(e);
        setErrorMsg(e.message || "Status check failed");
      }
    }, 3000);
  }

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: "1rem", border: "1px solid #444", borderRadius: 12 }}>
      <h2>Sora video generator</h2>

      <textarea
        value={promptInput}
        onChange={(e) => setPromptInput(e.target.value)}
        placeholder="Kirjelda stseeni (inglise keeles)..."
        rows={4}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />

      <button
        onClick={generateVideo}
        disabled={loading || !promptInput.trim()}
        style={{ padding: "0.5rem 1rem", marginBottom: "0.5rem" }}
      >
        {loading ? "Generating..." : "Generate Sora video"}
      </button>

      {status && <p>Status: {status}</p>}
      {jobId && <p>Job ID: {jobId}</p>}
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      {videoUrl && (
        <div style={{ marginTop: "1rem" }}>
          <video
            controls
            src={videoUrl}
            style={{ maxWidth: "100%", borderRadius: 12 }}
          />
        </div>
      )}
    </div>
  );
}
