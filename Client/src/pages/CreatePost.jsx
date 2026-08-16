import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function CreatePost() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // AI caption state
  const [suggestions, setSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setSuggestions([]); // clear old suggestions if a new image is picked
      setAiError("");
    }
  };

  const handleSuggestCaptions = async () => {
    if (!image) {
      setAiError("Pick an image first");
      return;
    }
    setAiLoading(true);
    setAiError("");
    setSuggestions([]);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await api.post("/posts/generate-caption", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuggestions(res.data.captions || []);
    } catch (err) {
      setAiError(err.response?.data?.message || "Couldn't generate captions, try again");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!image) {
      setError("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);

    try {
      setLoading(true);
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>New post</h1>
        <form onSubmit={handleSubmit} className="form-stack">
          <label className="file-input-wrap">
            {preview ? "Change photo" : "Click to choose a photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              style={{ display: "block", marginTop: 10 }}
            />
          </label>

          {preview && <img src={preview} alt="preview" className="image-preview" />}

          {preview && (
            <button
              type="button"
              onClick={handleSuggestCaptions}
              disabled={aiLoading}
              className="btn btn-secondary btn-block"
            >
              {aiLoading ? "✨ Thinking of captions..." : "✨ Suggest captions with AI"}
            </button>
          )}

          {aiError && <p className="error-text">{aiError}</p>}

          {suggestions.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCaption(s)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: caption === s ? "#eef0ff" : "#fff",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="input"
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? "Posting..." : "Share"}
          </button>
        </form>
      </div>
    </>
  );
}