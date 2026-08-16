import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfile();
  }, [id]);

  const isOwnProfile = currentUser?.id === id;
  const isFollowing = profile?.followers?.some((f) => f._id === currentUser?.id);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      await api.put(`/users/${id}/follow`);
      await fetchProfile();
    } catch (err) {
      console.error("Follow toggle failed:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        {loading && <p className="loading-text">Loading...</p>}
        {!loading && !profile && <p className="empty-state">User not found</p>}

        {!loading && profile && (
          <div className="profile-header">
            <div className="avatar-ring">
              <img
                src={profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
                alt={profile.username}
                className="avatar"
                style={{ width: 84, height: 84 }}
              />
            </div>
            <div>
              <h2 className="profile-name">{profile.username}</h2>
              <p className="profile-bio">{profile.bio || "No bio yet"}</p>
              <div className="profile-stats">
                <span><strong>{profile.followers.length}</strong> followers</span>
                <span><strong>{profile.following.length}</strong> following</span>
              </div>

              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`btn ${isFollowing ? "btn-following" : "btn-primary"}`}
                  style={{ marginTop: 14 }}
                >
                  {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}