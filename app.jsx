import { useState, useEffect } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://lquxeqmqziqqkwwxbqdy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rcHNUAvoXbrGHBcW4S4GuA_l0YxNpCM";

const supabase = {
  async from(table) {
    return {
      select: async (cols = "*", filters = "") => {
        const url = `${SUPABASE_URL}/rest/v1/${table}?select=${cols}${filters}&order=created_at.desc`;
        const res = await fetch(url, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        });
        return res.json();
      },
      insert: async (data) => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: "POST",
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify(data),
        });
        return res.json();
      },
      update: async (data, match) => {
        const filter = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join("&");
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
          method: "PATCH",
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify(data),
        });
        return res.json();
      },
      delete: async (match) => {
        const filter = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join("&");
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
          method: "DELETE",
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        });
        return res.ok;
      },
    };
  },
};

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO_STORIES = [
  { id: "1", title: "The Last Lighthouse", body: "She hadn't expected the light to still be on. Three years since the storms took everyone, and yet the beam cut through the fog every thirty seconds, faithful as a heartbeat.\n\nShe pulled the rowboat ashore and climbed the rocks. The door was unlocked. Inside, the mechanism turned and turned — gears older than her grandmother, oil she hadn't put there.", genre: "Mystery", tags: ["atmospheric", "mystery"], word_count: 68, is_public: true, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "2", title: "Tuesday's Fault", body: "The argument had started over toast. Which was, Mira thought, the most honest way arguments ever started — not over the thing itself, but over what the thing meant.\n\nHe had made her toast without asking. She had eaten it without thanking him. And now they sat on opposite ends of the couch like continents that had drifted too far to remember touching.", genre: "Literary", tags: ["relationships", "quiet"], word_count: 72, is_public: false, created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: "3", title: "Cartography of Forgetting", body: "By forty-two, my mother had mapped every road she'd ever traveled. Not on paper — in her body. The highway to her childhood home lived in her shoulders. The street where my father left was a knot behind her left ear.\n\nWhen the dementia came, it came like a cartographer with an eraser. It took the roads first. Then the knots.", genre: "Literary", tags: ["memory", "family"], word_count: 71, is_public: true, created_at: new Date(Date.now() - 86400000 * 14).toISOString() },
];

const GENRES = ["Literary", "Mystery", "Sci-Fi", "Fantasy", "Horror", "Romance", "Thriller", "Other"];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const isConfigured = () => SUPABASE_URL !== "https://YOUR_PROJECT.supabase.co";
const isPublicRoute = () => window.location.pathname === "/public";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f9f7f4;
    --surface: #ffffff;
    --border: #e8e3dc;
    --text: #1a1714;
    --text-soft: #7a7269;
    --accent: #2d5a3d;
    --accent-light: #e8f0eb;
    --tag-bg: #f0ede8;
    --danger: #c0392b;
    --serif: 'Libre Baskerville', Georgia, serif;
    --sans: 'DM Sans', sans-serif;
    --radius: 4px;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--sans); -webkit-font-smoothing: antialiased; }
  .app { max-width: 680px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }

  .header { padding: 28px 20px 20px; border-bottom: 1px solid var(--border); background: var(--bg); position: sticky; top: 0; z-index: 10; backdrop-filter: blur(8px); }
  .header-top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
  .logo { font-family: var(--serif); font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: var(--text); }
  .logo span { color: var(--accent); }
  .btn-new { background: var(--accent); color: white; border: none; font-family: var(--sans); font-size: 13px; font-weight: 500; padding: 8px 16px; border-radius: var(--radius); cursor: pointer; transition: opacity 0.15s; }
  .btn-new:hover { opacity: 0.85; }

  .search-row { display: flex; gap: 8px; }
  .search-input { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 9px 12px; font-family: var(--sans); font-size: 14px; color: var(--text); outline: none; transition: border-color 0.15s; }
  .search-input:focus { border-color: var(--accent); }
  .search-input::placeholder { color: var(--text-soft); }
  .genre-select { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 9px 10px; font-family: var(--sans); font-size: 13px; color: var(--text-soft); outline: none; cursor: pointer; }

  .stats-bar { padding: 10px 20px; font-size: 12px; color: var(--text-soft); border-bottom: 1px solid var(--border); font-family: var(--sans); }

  .story-list { flex: 1; padding: 0 20px 80px; }
  .story-card { padding: 20px 0; border-bottom: 1px solid var(--border); cursor: pointer; animation: fadeIn 0.2s ease; }
  .story-card:hover .story-title { color: var(--accent); }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; } }
  .card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
  .genre-badge { font-size: 11px; font-weight: 500; letter-spacing: 0.6px; text-transform: uppercase; color: var(--accent); background: var(--accent-light); padding: 2px 7px; border-radius: 2px; font-family: var(--sans); }
  .public-badge { font-size: 10px; font-weight: 500; color: #6b7280; background: #f3f4f6; padding: 2px 7px; border-radius: 2px; font-family: var(--sans); }
  .card-date { font-size: 12px; color: var(--text-soft); font-family: var(--sans); }
  .card-words { font-size: 12px; color: var(--text-soft); font-family: var(--sans); }
  .dot { color: var(--border); }
  .story-title { font-family: var(--serif); font-size: 19px; font-weight: 700; line-height: 1.3; color: var(--text); margin-bottom: 8px; transition: color 0.15s; }
  .story-excerpt { font-family: var(--sans); font-size: 14px; color: var(--text-soft); line-height: 1.65; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .card-tags { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
  .tag { font-size: 11px; color: var(--text-soft); background: var(--tag-bg); padding: 2px 8px; border-radius: 20px; font-family: var(--sans); }

  .empty { text-align: center; padding: 80px 20px; }
  .empty-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.4; }
  .empty-title { font-family: var(--serif); font-size: 20px; margin-bottom: 8px; }
  .empty-sub { font-size: 14px; color: var(--text-soft); line-height: 1.6; }

  .view { position: fixed; inset: 0; background: var(--bg); z-index: 20; overflow-y: auto; animation: slideUp 0.22s cubic-bezier(0.16,1,0.3,1); }
  @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .view-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg); z-index: 5; }
  .btn-back { background: none; border: none; font-family: var(--sans); font-size: 13px; color: var(--text-soft); cursor: pointer; padding: 6px 0; }
  .btn-back:hover { color: var(--text); }
  .view-actions { display: flex; gap: 8px; }
  .btn-icon { background: none; border: 1px solid var(--border); border-radius: var(--radius); padding: 6px 12px; font-size: 12px; font-family: var(--sans); cursor: pointer; color: var(--text-soft); transition: all 0.15s; }
  .btn-icon:hover { border-color: var(--text); color: var(--text); }
  .btn-danger { color: var(--danger); border-color: #f0d0ce; }
  .btn-danger:hover { border-color: var(--danger); background: #fff5f5; }

  .reader-content { max-width: 600px; margin: 0 auto; padding: 40px 24px 80px; }
  .reader-genre { font-size: 11px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; font-family: var(--sans); }
  .reader-title { font-family: var(--serif); font-size: 28px; font-weight: 700; line-height: 1.25; margin-bottom: 12px; }
  .reader-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-soft); margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--border); font-family: var(--sans); }
  .reader-body { font-family: var(--serif); font-size: 17px; line-height: 1.85; color: var(--text); white-space: pre-wrap; }
  .reader-tags { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); display: flex; gap: 6px; flex-wrap: wrap; }

  .editor-content { max-width: 600px; margin: 0 auto; padding: 28px 24px 80px; }
  .field { margin-bottom: 18px; }
  .field label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 0.6px; text-transform: uppercase; color: var(--text-soft); margin-bottom: 6px; font-family: var(--sans); }
  .field input, .field select, .field textarea { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 12px; font-family: var(--sans); font-size: 14px; color: var(--text); outline: none; transition: border-color 0.15s; }
  .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--accent); }
  .field textarea { font-family: var(--serif); font-size: 15px; line-height: 1.8; resize: vertical; min-height: 300px; }
  .field-title input { font-family: var(--serif); font-size: 20px; font-weight: 700; }
  .word-count-bar { display: flex; justify-content: flex-end; font-size: 11px; color: var(--text-soft); margin-top: 4px; }

  .publish-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-top: 1px solid var(--border); margin-top: 4px; }
  .publish-label { font-size: 13px; font-family: var(--sans); color: var(--text); }
  .publish-label span { display: block; font-size: 11px; color: var(--text-soft); margin-top: 2px; }
  .toggle { position: relative; width: 44px; height: 24px; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .toggle-slider { position: absolute; inset: 0; background: #d1d5db; border-radius: 24px; cursor: pointer; transition: background 0.2s; }
  .toggle-slider:before { content: ""; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: white; border-radius: 50%; transition: transform 0.2s; }
  .toggle input:checked + .toggle-slider { background: var(--accent); }
  .toggle input:checked + .toggle-slider:before { transform: translateX(20px); }

  .save-row { display: flex; gap: 10px; padding-top: 16px; }
  .btn-save { flex: 1; background: var(--accent); color: white; border: none; padding: 12px; font-family: var(--sans); font-size: 14px; font-weight: 500; border-radius: var(--radius); cursor: pointer; transition: opacity 0.15s; }
  .btn-save:hover { opacity: 0.85; }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-cancel { background: none; border: 1px solid var(--border); padding: 12px 20px; font-family: var(--sans); font-size: 14px; color: var(--text-soft); border-radius: var(--radius); cursor: pointer; }

  .public-header { padding: 32px 20px 20px; border-bottom: 1px solid var(--border); }
  .public-title { font-family: var(--serif); font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .public-subtitle { font-size: 13px; color: var(--text-soft); font-family: var(--sans); }

  .demo-banner { background: #fefce8; border-bottom: 1px solid #fde68a; padding: 10px 20px; font-size: 12px; color: #92400e; font-family: var(--sans); line-height: 1.5; }

  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--text); color: white; padding: 10px 18px; border-radius: 20px; font-size: 13px; font-family: var(--sans); z-index: 100; animation: toastIn 0.2s ease; pointer-events: none; }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 50; display: flex; align-items: flex-end; justify-content: center; padding: 20px; }
  .dialog { background: var(--surface); border-radius: 8px; padding: 24px; width: 100%; max-width: 400px; }
  .dialog h3 { font-family: var(--serif); font-size: 18px; margin-bottom: 8px; }
  .dialog p { font-size: 14px; color: var(--text-soft); margin-bottom: 20px; line-height: 1.5; }
  .dialog-btns { display: flex; gap: 10px; }
  .dialog-btns button { flex: 1; padding: 10px; font-family: var(--sans); font-size: 14px; border-radius: var(--radius); cursor: pointer; border: 1px solid var(--border); }
  .dialog-btns .btn-confirm-delete { background: var(--danger); color: white; border-color: var(--danger); font-weight: 500; }
`;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Toast({ msg }) {
  return msg ? <div className="toast">{msg}</div> : null;
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Are you sure?</h3>
        <p>{message}</p>
        <div className="dialog-btns">
          <button onClick={onCancel}>Cancel</button>
          <button className="btn-confirm-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function StoryCard({ story, onClick, showPublicBadge }) {
  return (
    <div className="story-card" onClick={onClick}>
      <div className="card-meta">
        {story.genre && <span className="genre-badge">{story.genre}</span>}
        {showPublicBadge && (
          <span className="public-badge">{story.is_public ? "Public" : "Private"}</span>
        )}
        <span className="card-date">{formatDate(story.created_at)}</span>
        <span className="dot">·</span>
        <span className="card-words">{story.word_count} words</span>
      </div>
      <div className="story-title">{story.title}</div>
      <div className="story-excerpt">{story.body}</div>
      {story.tags?.length > 0 && (
        <div className="card-tags">{story.tags.map((t) => <span key={t} className="tag">#{t}</span>)}</div>
      )}
    </div>
  );
}

function ReaderView({ story, onBack, onEdit, onDelete, readOnly }) {
  return (
    <div className="view">
      <div className="view-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        {!readOnly && (
          <div className="view-actions">
            <button className="btn-icon" onClick={onEdit}>Edit</button>
            <button className="btn-icon btn-danger" onClick={onDelete}>Delete</button>
          </div>
        )}
      </div>
      <div className="reader-content">
        {story.genre && <div className="reader-genre">{story.genre}</div>}
        <h1 className="reader-title">{story.title}</h1>
        <div className="reader-meta">
          <span>{formatDate(story.created_at)}</span>
          <span>·</span>
          <span>{story.word_count} words</span>
        </div>
        <div className="reader-body">{story.body}</div>
        {story.tags?.length > 0 && (
          <div className="reader-tags">{story.tags.map((t) => <span key={t} className="tag">#{t}</span>)}</div>
        )}
      </div>
    </div>
  );
}

function EditorView({ story, onBack, onSave, saving }) {
  const [title, setTitle] = useState(story?.title || "");
  const [body, setBody] = useState(story?.body || "");
  const [genre, setGenre] = useState(story?.genre || "");
  const [tagsRaw, setTagsRaw] = useState(story?.tags?.join(", ") || "");
  const [isPublic, setIsPublic] = useState(story?.is_public || false);
  const words = countWords(body);

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;
    const tags = tagsRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    onSave({ title: title.trim(), body: body.trim(), genre, tags, word_count: words, is_public: isPublic });
  };

  return (
    <div className="view">
      <div className="view-header">
        <button className="btn-back" onClick={onBack}>← Cancel</button>
        <span style={{ fontSize: 13, color: "var(--text-soft)", fontFamily: "var(--sans)" }}>
          {story?.id ? "Edit story" : "New story"}
        </span>
      </div>
      <div className="editor-content">
        <div className="field field-title">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Story title…" />
        </div>
        <div className="field">
          <label>Genre</label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">— select genre —</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your story here…" />
          <div className="word-count-bar">{words} words</div>
        </div>
        <div className="field">
          <label>Tags (comma-separated)</label>
          <input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="mystery, night, rain" />
        </div>
        <div className="publish-row">
          <div className="publish-label">
            Make public
            <span>Visible on your public reading page</span>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="save-row">
          <button className="btn-cancel" onClick={onBack}>Cancel</button>
          <button className="btn-save" onClick={handleSave} disabled={!title.trim() || !body.trim() || saving}>
            {saving ? "Saving…" : story?.id ? "Save changes" : "Save story"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PUBLIC PAGE ──────────────────────────────────────────────────────────────
function PublicPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const demo = !isConfigured();

  useEffect(() => {
    if (demo) {
      setStories(DEMO_STORIES.filter((s) => s.is_public));
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const db = await supabase.from("stories");
        const data = await db.select("*", "&is_public=eq.true");
        setStories(Array.isArray(data) ? data : []);
      } catch {
        setStories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = stories.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q) || s.tags?.some((t) => t.includes(q));
    const matchGenre = !genreFilter || s.genre === genreFilter;
    return matchSearch && matchGenre;
  });

  const usedGenres = [...new Set(stories.map((s) => s.genre).filter(Boolean))];

  if (selected) {
    return (
      <>
        <style>{styles}</style>
        <ReaderView story={selected} onBack={() => setSelected(null)} readOnly />
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="public-header">
          <div className="public-title">fic<span style={{ color: "var(--accent)" }}>.</span>archive</div>
          <div className="public-subtitle">A collection of short fiction</div>
        </div>
        <div className="header" style={{ paddingTop: 16 }}>
          <div className="search-row">
            <input className="search-input" type="text" placeholder="Search stories…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="genre-select" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
              <option value="">All genres</option>
              {usedGenres.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div className="stats-bar">
          {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "story" : "stories"}`}
        </div>
        <div className="story-list">
          {loading ? null : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✦</div>
              <div className="empty-title">{search || genreFilter ? "No stories found" : "Nothing published yet"}</div>
              <div className="empty-sub">{search || genreFilter ? "Try a different search." : "Check back soon."}</div>
            </div>
          ) : (
            filtered.map((s) => <StoryCard key={s.id} story={s} onClick={() => setSelected(s)} />)
          )}
        </div>
      </div>
    </>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  if (isPublicRoute()) return <PublicPage />;

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null);
  const demo = !isConfigured();

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2400); };

  useEffect(() => {
    if (demo) { setStories(DEMO_STORIES); setLoading(false); return; }
    (async () => {
      try {
        const db = await supabase.from("stories");
        const data = await db.select("*");
        setStories(Array.isArray(data) ? data : []);
      } catch { setStories([]); } finally { setLoading(false); }
    })();
  }, []);

  const filtered = stories.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q) || s.tags?.some((t) => t.includes(q));
    const matchGenre = !genreFilter || s.genre === genreFilter;
    return matchSearch && matchGenre;
  });

  const handleSave = async (data) => {
    setSaving(true);
    if (demo) {
      if (selected?.id) {
        const updated = { ...selected, ...data, updated_at: new Date().toISOString() };
        setStories((prev) => prev.map((s) => (s.id === selected.id ? updated : s)));
        setSelected(updated); showToast("Story updated ✓"); setView("read");
      } else {
        const newStory = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
        setStories((prev) => [newStory, ...prev]); showToast("Story saved ✓"); setView("list");
      }
      setSaving(false); return;
    }
    try {
      const db = await supabase.from("stories");
      if (selected?.id) {
        const result = await db.update(data, { id: selected.id });
        const updated = Array.isArray(result) ? result[0] : { ...selected, ...data };
        setStories((prev) => prev.map((s) => (s.id === selected.id ? updated : s)));
        setSelected(updated); showToast("Story updated ✓"); setView("read");
      } else {
        const result = await db.insert(data);
        const created = Array.isArray(result) ? result[0] : { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
        setStories((prev) => [created, ...prev]); showToast("Story saved ✓"); setView("list");
      }
    } catch { showToast("Error saving story"); } finally { setSaving(false); }
  };

  const handleDelete = () => {
    setConfirm({
      message: `"${selected.title}" will be permanently deleted.`,
      onConfirm: async () => {
        setConfirm(null);
        if (!demo) { const db = await supabase.from("stories"); await db.delete({ id: selected.id }); }
        setStories((prev) => prev.filter((s) => s.id !== selected.id));
        setView("list"); showToast("Story deleted");
      },
    });
  };

  const usedGenres = [...new Set(stories.map((s) => s.genre).filter(Boolean))];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {demo && <div className="demo-banner"><strong>Demo mode</strong> — add your Supabase credentials to persist stories.</div>}
        <header className="header">
          <div className="header-top">
            <div className="logo">fic<span>.</span>archive</div>
            <button className="btn-new" onClick={() => { setSelected(null); setView("write"); }}>+ New story</button>
          </div>
          <div className="search-row">
            <input className="search-input" type="text" placeholder="Search stories, tags…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="genre-select" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
              <option value="">All genres</option>
              {usedGenres.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </header>
        <div className="stats-bar">
          {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "story" : "stories"} · ${filtered.reduce((a, s) => a + (s.word_count || 0), 0).toLocaleString()} words total`}
        </div>
        <div className="story-list">
          {loading ? null : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✦</div>
              <div className="empty-title">{search || genreFilter ? "No stories found" : "Your archive is empty"}</div>
              <div className="empty-sub">{search || genreFilter ? "Try a different search or filter." : "Start writing your first story."}</div>
            </div>
          ) : (
            filtered.map((s) => (
              <StoryCard key={s.id} story={s} onClick={() => { setSelected(s); setView("read"); }} showPublicBadge />
            ))
          )}
        </div>
        {view === "read" && selected && <ReaderView story={selected} onBack={() => setView("list")} onEdit={() => setView("write")} onDelete={handleDelete} />}
        {view === "write" && <EditorView story={selected} onBack={() => setView(selected ? "read" : "list")} onSave={handleSave} saving={saving} />}
        {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
        <Toast msg={toast} />
      </div>
    </>
  );
}
