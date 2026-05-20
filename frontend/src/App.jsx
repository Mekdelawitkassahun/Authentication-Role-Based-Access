import { useEffect, useRef, useState, useCallback } from "react";
import "./App.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

/* ── tiny helpers ─────────────────────────────────── */
const fmt = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/* ── icons (inline SVG, zero deps) ───────────────── */
const Icon = {
  Logo: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Empty: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Swagger: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10S17.523 22 12 22 2 17.523 2 12 6.477 2 12 2zm-1 5v2h2V7h-2zm0 4v6h2v-6h-2z"/>
    </svg>
  ),
};

/* ── Toast component ──────────────────────────────── */
function Toasts({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ── Main App ─────────────────────────────────────── */
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // forms
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  // toasts
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const toast = useCallback((text, type = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const headers = useCallback(
    () =>
      token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" },
    [token]
  );

  /* ── API helpers ──────────────────────────────── */
  const apiFetch = useCallback(
    async (path, opts = {}) => {
      const res = await fetch(`${API_BASE}${path}`, {
        ...opts,
        headers: { ...headers(), ...(opts.headers || {}) },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      return data;
    },
    [headers]
  );

  /* ── Load profile + notes ─────────────────────── */
  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [meData, noteData] = await Promise.all([
        apiFetch("/auth/me"),
        apiFetch("/notes"),
      ]);
      setUser(meData.data);
      setNotes(noteData.data);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [token, apiFetch, toast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ── Auth ─────────────────────────────────────── */
  const handleAuthSuccess = (data) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.data);
    toast(`Welcome, ${data.data.name}!`);
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(regForm),
      });
      handleAuthSuccess(data);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      handleAuthSuccess(data);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setNotes([]);
    toast("Logged out successfully");
  };

  /* ── Notes CRUD ───────────────────────────────── */
  const createNote = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch("/notes", {
        method: "POST",
        body: JSON.stringify(noteForm),
      });
      setNotes((prev) => [data.data, ...prev]);
      setNoteForm({ title: "", content: "" });
      toast("Note created");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const saveEdit = async (id) => {
    try {
      const data = await apiFetch(`/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      setNotes((prev) => prev.map((n) => (n._id === id ? data.data : n)));
      setEditingId(null);
      toast("Note updated");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const deleteNote = async (id) => {
    try {
      await apiFetch(`/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast("Note deleted");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setEditForm({ title: note.title, content: note.content });
  };

  /* ── Render ───────────────────────────────────── */
  return (
    <div className="app">
      <Toasts toasts={toasts} />

      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-brand">
          <Icon.Logo />
          NoteVault
        </span>
        <div className="navbar-right">
          <a
            className="swagger-link"
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noreferrer"
          >
            <Icon.Swagger /> API Docs
          </a>
          {user && (
            <>
              <div className="user-badge">
                {user.name}
                <span className="role-tag">{user.role}</span>
              </div>
              <button className="btn btn-logout" onClick={logout} type="button">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="main">
        {!token ? (
          /* ── Auth page ── */
          <div className="auth-page">
            <div className="auth-hero">
              <h1>Welcome to NoteVault</h1>
              <p>Register or log in to manage your notes securely.</p>
            </div>
            <div className="auth-grid">
              {/* Register */}
              <div className="card">
                <h2>Create account</h2>
                <form onSubmit={register}>
                  <div className="field">
                    <label>Name</label>
                    <input
                      placeholder="Jane Doe"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <button className="btn btn-primary" type="submit">
                    <Icon.Plus /> Register
                  </button>
                </form>
              </div>

              {/* Login */}
              <div className="card">
                <h2>Sign in</h2>
                <form onSubmit={login}>
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <button className="btn btn-primary" type="submit">
                    Sign in
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* ── Dashboard ── */
          <div>
            <div className="dashboard-header">
              <div>
                <h1>My Notes</h1>
                <p>
                  {user?.role === "admin"
                    ? "Admin view — showing all notes in the system"
                    : "Your personal notes"}
                </p>
              </div>
            </div>

            {/* Create note */}
            <div className="card create-card">
              <h2>New note</h2>
              <form onSubmit={createNote}>
                <div className="create-row">
                  <div className="field" style={{ margin: 0 }}>
                    <label>Title</label>
                    <input
                      placeholder="Note title"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label>Content</label>
                    <textarea
                      placeholder="What's on your mind?"
                      rows={2}
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ paddingTop: "22px" }}>
                    <button className="btn btn-primary" type="submit" style={{ width: "auto" }}>
                      <Icon.Plus /> Add
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Notes list */}
            <div className="notes-header">
              <h2>Notes</h2>
              <span className="notes-count">{notes.length}</span>
            </div>

            {loading ? (
              <div className="spinner-wrap">
                <div className="spinner" />
              </div>
            ) : (
              <div className="notes-grid">
                {notes.length === 0 && (
                  <div className="empty-state">
                    <Icon.Empty />
                    <p>No notes yet. Create your first one above.</p>
                  </div>
                )}
                {notes.map((note) => (
                  <div className="note-card" key={note._id}>
                    {editingId === note._id ? (
                      <div className="edit-form">
                        <input
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                        <textarea
                          rows={3}
                          value={editForm.content}
                          onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        />
                        <div className="edit-actions">
                          <button
                            className="btn btn-sm btn-success"
                            type="button"
                            onClick={() => saveEdit(note._id)}
                          >
                            <Icon.Check /> Save
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            type="button"
                            onClick={() => setEditingId(null)}
                          >
                            <Icon.X /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="note-title">{note.title}</p>
                        <p className="note-content">{note.content}</p>
                        <p className="note-meta">{fmt(note.createdAt)}</p>
                        <div className="note-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            type="button"
                            onClick={() => startEdit(note)}
                          >
                            <Icon.Edit /> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            type="button"
                            onClick={() => deleteNote(note._id)}
                          >
                            <Icon.Trash /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
