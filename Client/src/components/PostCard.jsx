import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [showAltText, setShowAltText] = useState(false);

  const isLiked = post.likes.includes(user?.id);

  const handleLike = async () => {
    await api.put(`/posts/${post._id}/like`);
    onUpdate();
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await api.post(`/posts/${post._id}/comment`, { text: commentText });
    setCommentText("");
    onUpdate();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this post? This can't be undone.");
    if (!confirmed) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onUpdate();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  const isOwnPost = post.author?._id === user?.id;

  return (
    <div className="post-card">
      <div className="post-header" style={{ display: "flex", alignItems: "center" }}>
        <Link to={`/profile/${post.author?._id}`} className="avatar-ring">
          <img
            src={post.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.username}`}
            alt={post.author?.username}
            className="avatar"
            style={{ width: 30, height: 30 }}
          />
        </Link>
        <Link to={`/profile/${post.author?._id}`} style={{ flex: 1 }}>
          {post.author?.username || "Unknown user"}
        </Link>
        {isOwnPost && (
          <button
            onClick={handleDelete}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: 13,
              padding: "4px 8px",
            }}
          >
            Delete
          </button>
        )}
      </div>

      <img src={post.imageUrl} alt={post.altText || "User post"} className="post-image" />

      {post.altText && (
        <div style={{ padding: "6px 14px 0" }}>
          <button
            type="button"
            onClick={() => setShowAltText((s) => !s)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "var(--text-muted)",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ✨ AI image description {showAltText ? "▲" : "▼"}
          </button>
          {showAltText && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0", fontStyle: "italic" }}>
              {post.altText}
            </p>
          )}
        </div>
      )}

      <div className="post-actions">
        <button onClick={handleLike} className={`like-btn ${isLiked ? "liked" : ""}`}>
          <span className="heart">{isLiked ? "♥" : "♡"}</span>
          {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
        </button>
      </div>

      {post.caption && (
        <div className="post-caption">
          <strong>{post.author?.username}</strong>{post.caption}
        </div>
      )}

      {post.comments.length > 0 && (
        <div className="comment-list">
          {post.comments.map((c, i) => (
            <p key={i} className="comment-row">
              <strong>{c.user?.username || "user"}</strong>{c.text}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleComment} className="comment-form">
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="comment-input"
        />
        <button type="submit" disabled={!commentText.trim()} className="comment-submit">
          Post
        </button>
      </form>
    </div>
  );
}