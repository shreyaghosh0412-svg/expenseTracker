import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserActivities } from "../api/admin";
import { updateProfile, changePassword } from "../api/auth";
import { User, Lock, Activity, CheckCircle } from "lucide-react";
import "./ProfilePage.css";

const actionLabels = {
  login: "Signed in",
  register: "Created account",
  create_expense: "Added expense",
  update_expense: "Updated expense",
  delete_expense: "Deleted expense",
};

const TABS = [
  { id: "info",     label: "Account Info",   icon: User },
  { id: "password", label: "Change Password", icon: Lock },
  { id: "activity", label: "Activity Log",    icon: Activity },
];

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState("info");

  // ── Edit profile state ────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    username: user.username,
    email: user.email,
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError]   = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // ── Change password state ─────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwLoading, setPwLoading]   = useState(false);
  const [pwError, setPwError]       = useState("");
  const [pwSuccess, setPwSuccess]   = useState("");

  // ── Activity log state ────────────────────────────────────────
  const [activities, setActivities] = useState([]);
  const [actLoading, setActLoading] = useState(false);

  // Fetch activity log only when that tab is opened, to avoid unnecessary requests
  useEffect(() => {
    if (activeTab !== "activity") return;
    setActLoading(true);
    getUserActivities(user.id)
      .then(({ data }) => setActivities(data))
      .catch(() => {})
      .finally(() => setActLoading(false));
  }, [activeTab, user.id]);

  // ── Profile form handlers ─────────────────────────────────────
  const handleProfileChange = (e) =>
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);
    try {
      const { data } = await updateProfile(profileForm);
      // Update localStorage so the navbar username refreshes immediately
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const updated = { ...stored, username: data.username, email: data.email };
      localStorage.setItem("user", JSON.stringify(updated));
      setProfileSuccess("Profile updated successfully.");
      // Force a page reload so AuthContext picks up the new user data
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setProfileError(err.response?.data?.detail || "Update failed. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Password form handlers ────────────────────────────────────
  const handlePwChange = (e) =>
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (pwForm.new_password !== pwForm.confirm_password) {
      return setPwError("New passwords do not match.");
    }
    if (pwForm.new_password.length < 6) {
      return setPwError("New password must be at least 6 characters.");
    }

    setPwLoading(true);
    try {
      await changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwSuccess("Password changed successfully.");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPwError(err.response?.data?.detail || "Password change failed.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        {/* Header with avatar */}
        <div className="profile-hero">
          <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
          <div>
            <h1>{user.username}</h1>
            <p className="profile-email">{user.email}</p>
            <span className={`badge role-badge ${user.role === "admin" ? "badge-admin" : "badge-user"}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="profile-tab-bar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`profile-tab-btn ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Account Info tab ── */}
        {activeTab === "info" && (
          <div className="tab-content fade-up">
            <div className="card form-card">
              <h2 className="form-title">Edit Profile</h2>
              <p className="form-subtitle">Update your username or email address.</p>

              {profileError   && <div className="toast toast-error">{profileError}</div>}
              {profileSuccess && (
                <div className="toast toast-success">
                  <CheckCircle size={15} style={{ display: "inline", marginRight: 6 }} />
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="edit-form">
                <div className="input-group">
                  <label className="input-label">Username</label>
                  <input
                    name="username"
                    className="input"
                    value={profileForm.username}
                    onChange={handleProfileChange}
                    minLength={3}
                    maxLength={30}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    name="email"
                    type="email"
                    className="input"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-meta">
                  <div className="meta-row">
                    <span className="meta-label">Role</span>
                    <span className="meta-value">{user.role}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Member since</span>
                    <span className="meta-value">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                  {profileLoading ? <span className="spinner" /> : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Change Password tab ── */}
        {activeTab === "password" && (
          <div className="tab-content fade-up">
            <div className="card form-card">
              <h2 className="form-title">Change Password</h2>
              <p className="form-subtitle">
                You must enter your current password to set a new one.
                Passwords are hashed with bcrypt before being stored — your plain-text password is never saved.
              </p>

              {pwError   && <div className="toast toast-error">{pwError}</div>}
              {pwSuccess && (
                <div className="toast toast-success">
                  <CheckCircle size={15} style={{ display: "inline", marginRight: 6 }} />
                  {pwSuccess}
                </div>
              )}

              <form onSubmit={handlePwSubmit} className="edit-form">
                <div className="input-group">
                  <label className="input-label">Current Password</label>
                  <input
                    name="current_password"
                    type="password"
                    className="input"
                    placeholder="Enter current password"
                    value={pwForm.current_password}
                    onChange={handlePwChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <input
                    name="new_password"
                    type="password"
                    className="input"
                    placeholder="Min 6 characters"
                    value={pwForm.new_password}
                    onChange={handlePwChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Confirm New Password</label>
                  <input
                    name="confirm_password"
                    type="password"
                    className="input"
                    placeholder="Repeat new password"
                    value={pwForm.confirm_password}
                    onChange={handlePwChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                  {pwLoading ? <span className="spinner" /> : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Activity Log tab ── */}
        {activeTab === "activity" && (
          <div className="tab-content fade-up">
            {actLoading ? (
              <div className="loading-center"><span className="spinner" /></div>
            ) : activities.length === 0 ? (
              <p className="empty-text">No activity recorded yet.</p>
            ) : (
              <div className="activity-list">
                {activities.slice(0, 40).map((a) => (
                  <div key={a.id} className="activity-row">
                    <div className="activity-action">{actionLabels[a.action] || a.action}</div>
                    <div className="activity-detail">{a.detail}</div>
                    <div className="activity-time">{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
