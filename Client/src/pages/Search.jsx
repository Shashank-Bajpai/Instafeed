import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="feed-header" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 22, fontWeight: 800 }}>Find people</span>
        </h1>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {loading && <p className="loading-text">Searching...</p>}

        {!loading && searched && results.length === 0 && (
          <p className="empty-state">No users found for "{query}"</p>
        )}

        {results.map((u) => (
          <Link key={u._id} to={`/profile/${u._id}`} className="search-result-row">
            <img
              src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`}
              alt={u.username}
              className="avatar"
              style={{ width: 40, height: 40 }}
            />
            <span>{u.username}</span>
          </Link>
        ))}
      </div>
    </>
  );
}