import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";

export default function Home() {
  useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <>
      <Navbar />
      <div className="page">
        {loading && <p className="loading-text">Loading feed...</p>}

        {!loading && posts.length === 0 && (
          <div className="empty-state">
            <p>Your feed is empty.</p>
            <p>Follow people or share your first photo to get started.</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard key={post._id} post={post} onUpdate={fetchFeed} />
        ))}
      </div>
    </>
  );
}