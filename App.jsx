import { useState, useEffect } from "react";

const SUPABASE_URL = "https://lquxeqmqziqqkwwxbqdy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rcHNUAvoXbrGHBcW4S4GuA_l0YxNpCM";

const supabase = {
  async from(table) {
    return {
      select: async (cols = "*", filters = "") => {
        const url = `${SUPABASE_URL}/rest/v1/${table}?select=${cols}${filters}&order=created_at.desc`;
        const res = await fetch(url, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
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

const DEMO_STORIES = [
  { id: "1", title: "The Last Lighthouse", body: "She hadn't expected the light to still be on. Three years since the storms took everyone, and yet the beam cut through the fog every thirty seconds, faithful as a heartbeat.\n\nShe pulled the rowboat ashore and climbed the rocks. The door was unlocked. Inside, the mechanism turned and turned — gears older than her grandmother, oil she hadn't put there.", genre: "Mystery", tags: ["atmospheric", "mystery"], word_count: 68, is_public: true, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "2", title: "Tuesday's Fault", body: "The argument had started over toast. Which was, Mira thought, the most honest way arguments ever started — not over the thing itself, but over what the thing meant.\n\nHe had made her toast without asking. She had eaten it without thanking him. And now they sat on opposite ends of the couch like continents that had drifted too far to remember touching.", genre: "Literary", tags: ["relationships", "quiet"], word_count: 72, is_public: false, created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: "3", title: "Cartography of Forgetting", body: "By forty-two, my mother had mapped every road she'd ever traveled. Not on paper — in her body. The highway to her childhood home lived in her shoulders. The street where my father left was a knot behind her left ear.\n\nWhen the dementia came, it came like a cartographer with an eraser. It took the roads first. Then the knots.", genre: "Literary", tags: ["memory", "family"], word_count: 71, is_public: true, created_at: new Date(Date.now() - 86400000 * 14).toISOString() },
];

const GENRES = ["Literary", "Mystery", "Sci-Fi", "Fantasy", "Horror", "Romance", "Thriller", "Other"];

// Genre gradients
const GENRE_GRADIENTS = {
  "Romance":   "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",
  "Mystery":   "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "Literary":  "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
  "Sci-Fi":    "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  "Fantasy":   "linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)",
  "Horror":    "linear-gradient(135deg, #0d0d0d 0%, #3d0000 100%)",
  "Thriller":  "linear-gradient(135deg, #232526 0%, #414345 100%)",
  "Other":     "linear-gradient(135deg, #544a7d 0%, #ffd452 100%)",
  "default":   "linear-gradient(135deg, #2d5a3d 0%, #1a3a2a 100%)",
};

const getGradient = (genre) => GENRE_GRADIENTS[genre] || GENRE_GRADIENTS["default"];

const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const readTime = (words) => Math.max(1, Math.ceil(words / 200));
const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const isConfigured = () => SUPABASE_URL !== "https://YOUR_PROJECT.supabase.co";
const isPublicRoute = () => window.location.pathname === "/public";

const getStyles = (dark) => `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: ${dark ? "#0f0f0f" : "#f9f7f4"};
    --bg2: ${dark ? "#1a1a1a" : "#ffffff"};
    --surface: ${dark ? "#222222" : "#ffffff"};
    --border: ${dark ? "#2e2e2e" : "#e8e3dc"};
    --text: ${dark ? "#f0ede8" : "#1a1714"};
    --text-soft: ${dark ? "#888" : "#7a7269"};
    --accent: ${dark ? "#4ade80" : "#2d5a3d"};
    --accent-light: ${dark ? "#1a2e1f" : "#e8f0eb"};
    --tag-bg: ${dark ? "#2a2a2a" : "#f0ede8"};
    --danger: #e05555;
    --serif: 'Libre Baskerville', Georgia, serif;
    --sans: 'DM Sans', sans-serif;
    --radius: 6px;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--sans); -webkit-font-smoothing: antialiased; transition: background 0.3s, color 0.3s; }
  .app { max-width: 680px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }

  /* HEADER */
  .header { padding: 20px 20px 16px; border-bottom: 1px solid var(--border); background: var(--bg); position: sticky; top: 0; z-index: 10; backdrop-filter: blur(12px); }
  .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .logo { font-family: var(--serif); font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: var(--text); }
  .logo span { color: var(--accent); }
  .header-actions { display: flex; gap: 8px; align-items: center; }
  .btn-new { background: var(--accent); color: ${dark ? "#000" : "#fff"}; border: none; font-family: var(--sans); font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: var(--radius); cursor: pointer; transition: opacity 0.15s; }
  .btn-new:hover { opacity: 0.85; }
  .btn-mode { background: none; border: 1px solid var(--border); border-radius: var(--radius); padding: 7px 10px; font-size: 14px; cursor: pointer; color: var(--text-soft); transition: all 0.15s; }
  .btn-mode:hover { border-color: var(--accent); color: var(--accent); }

  /* SEARCH */
  .search-row { display: flex; gap: 8px; }
  .search-input { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 9px 12px; font-family: var(--sans); font-size: 14px; color: var(--text); outline: none; transition: border-color 0.15s; }
  .search-input:focus { border-color: var(--accent); }
  .search-input::placeholder { color: var(--text-soft); }
  .genre-select { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 9px 10px; font-family: var(--sans); font-size: 13px; color: var(--text-soft); outline: none; cursor: pointer; }

  /* STATS */
  .stats-bar { padding: 10px 20px; font-size: 12px; color: var(--text-soft); border-bottom: 1px solid var(--border); font-family: var(--sans); letter-spacing: 0.2px; }

  /* STORY LIST */
  .story-list { flex: 1; padding: 0 16px 80px; }
  .story-card { padding: 16px 0; border-bottom: 1px solid var(--border); cursor: pointer; animation: fadeIn 0.2s ease; }
  .story-card:active { opacity: 0.7; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  /* CARD COVER */
  .card-cover { height: 6px; border-radius: 3px; margin-bottom: 14px; }

  .card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
  .genre-badge { font-size: 10px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--accent); background: var(--accent-light); padding: 3px 8px; border-radius: 20px; font-family: var(--sans); }
  .public-badge { font-size: 10px; font-weight: 500; color: var(--text-soft); background: var(--tag-bg); padding: 3px 8px; border-radius: 20px; font-family: var(--sans); }
  .card-date { font-size: 12px; color: var(--text-soft); font-family: var(--sans); }
  .dot { color: var(--border); }
  .card-words { font-size: 12px; color: var(--text-soft); font-family: var(--sans); }
  .story-title { font-family: var(--serif); font-size: 18px; font-weight: 700; line-height: 1.3; color: var(--text); margin-bottom: 6px; }
  .story-excerpt { font-family: var(--sans); font-size: 13px; color: var(--text-soft); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .card-tags { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
  .tag { font-size: 11px; color: var(--text-soft); background: var(--tag-bg); padding: 3px 10px; border-radius: 20px; font-family: var(--sans); }

  /* EMPTY */
  .empty { text-align: center; padding: 80px 20px; }
  .empty-icon { font-size: 36px; margin-bottom: 16px; opacity: 0.3; }
  .empty-title { font-family: var(--serif); font-size: 20px; margin-bottom: 8px; }
  .empty-sub { font-size: 14px; color: var(--text-soft); line-height: 1.6; }

  /* VIEWS */
  .view { position: fixed; inset: 0; background: var(--bg); z-index: 20; overflow-y: auto; animation: slideUp 0.25s cubic-bezier(0.16,1,0.3,1); }
  @keyframes slideUp { from { transform: translateY(28px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* STORY COVER HERO */
  .story-hero { height: 220px; position: relative; display: flex; flex-direction: column; justify-content: flex-end; padding: 24px 20px 20px; }
  .story-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%); }
  .story-hero-genre { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.8); margin-bottom: 8px; position: relative; z-index: 1; font-family: var(--sans); }
  .story-hero-title { font-family: var(--serif); font-size: 26px; font-weight: 700; color: white; line-height: 1.2; position: relative; z-index: 1; text-shadow: 0 2px 8px rgba(0,0,0,0.4); }

  .view-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg); z-index: 5; }
  .btn-back { background: none; border: none; font-family: var(--sans); font-size: 13px; color: var(--text-soft); cursor: pointer; padding: 6px 0; display: flex; align-items: center; gap: 4px; }
  .btn-back:hover { color: var(--text); }
  .view-actions { display: flex; gap: 8px; }
  .btn-icon { background: none; border: 1px solid var(--border); border-radius: var(--radius); padding: 6px 12px; font-size: 12px; font-family: var(--sans); cursor: pointer; color: var(--text-soft); transition: all 0.15s; }
  .btn-icon:hover { border-color: var(--text); color: var(--text); }
  .btn-danger { color: var(--danger); border-color: rgba(224,85,85,0.3); }
  .btn-danger:hover { border-color: var(--danger); background: rgba(224,85,85,0.08); }

  /* READER */
  .reader-content { max-width: 620px; margin: 0 auto; padding: 28px 24px 80px; }
  .reader-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-soft); margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid var(--border); font-family: var(--sans); flex-wrap: wrap; }
  .reader-body { font-family: var(--serif); font-size: 17px; line-height: 1.9; color: var(--text); white-space: pre-wrap; }
  .reader-body p { margin-bottom: 1.4em; }
  .reader-tags { margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border); display: flex; gap: 6px; flex-wrap: wrap; }

  /* EDITOR */
  .editor-content { max-width: 620px; margin: 0 auto; padding: 24px 20px 80px; }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; color: var(--text-soft); margin-bottom: 6px; font-family: var(--sans); }
  .field input, .field select, .field textarea { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 11px 14px; font-family: var(--sans); font-size: 14px; color: var(--text); outline: none; transition: border-color 0.15s; }
  .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--accent); }
  .field textarea { font-family: var(--serif); font-size: 15px; line-height: 1.8; resize: vertical; min-height: 320px; }
  .field-title input { font-family: var(--serif); font-size: 20px; font-weight: 700; }
  .word-count-bar { display: flex; justify-content: flex-end; font-size: 11px; color: var(--text-soft); margin-top: 4px; }

  /* GENRE PREVIEW */
  .genre-preview { height: 40px; border-radius: var(--radius); margin-top: 8px; transition: all 0.3s; }

  /* PUBLISH TOGGLE */
  .publish-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-top: 1px solid var(--border); margin-top: 8px; }
  .publish-label { font-size: 14px; font-family: var(--sans); color: var(--text); font-weight: 500; }
  .publish-label span { display: block; font-size: 11px; color: var(--text-soft); margin-top: 2px; font-weight: 400; }
  .toggle { position: relative; width: 46px; height: 26px; flex-shrink: 0; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .toggle-slider { position: absolute; inset: 0; background: var(--border); border-radius: 26px; cursor: pointer; transition: background 0.2s; }
  .toggle-slider:before { content: ""; position: absolute; width: 20px; height: 20px; left: 3px; top: 3px; background: white; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .toggle input:checked + .toggle-slider { background: var(--accent); }
  .toggle input:checked + .toggle-slider:before { transform: translateX(20px); }

  .save-row { display: flex; gap: 10px; padding-top: 16px; }
  .btn-save { flex: 1; background: var(--accent); color: ${dark ? "#000" : "#fff"}; border: none; padding: 13px; font-family: var(--sans); font-size: 14px; font-weight: 600; border-radius: var(--radius); cursor: pointer; transition: opacity 0.15s; }
  .btn-save:hover { opacity: 0.85; }
  .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-cancel { background: none; border: 1px solid var(--border); padding: 13px 20px; font-family: var(--sans); font-size: 14px; color: var(--text-soft); border-radius: var(--radius); cursor: pointer; }

  /* PUBLIC PAGE */
  .public-header { padding: 32px 20px 20px; border-bottom: 1px solid var(--border); }
  .public-title { font-family: var(--serif); font-size: 26px; font-weight: 700; margin-bottom: 4px; }
  .public-subtitle { font-size: 13px; color: var(--text-soft); font-family: var(--sans); }

  /* TOAST */
  .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: var(--text); color: var(--bg); padding: 10px 20px; border-radius: 20px; font-size: 13px; font-family: var(--sans); z-index: 100; animation: toastIn 0.2s ease; pointer-events: none; font-weight: 500; }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  /* CONFIRM */
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: flex-end; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .dialog { background: var(--surface); border-radius: 12px; padding: 24px; width: 100%; max-width: 420px; }
  .dialog h3 { font-family: var(--serif); font-size: 18px; margin-bottom: 8px; }
  .dialog p { font-size: 14px; color: var(--text-soft); margin-bottom: 20px; line-height: 1.5; }
  .dialog-btns { display: flex; gap: 10px; }
  .dialog-btns button { flex: 1; padding: 11px; font-family: var(--sans); font-size: 14px; border-radius: var(--radius); cursor: pointer; border: 1px solid var(--border); color: var(--text); background: var(--bg); }
  .dialog-btns .btn-confirm-delete { background: var(--danger); color: white; border-color: var(--danger); font-weight: 600; }

  .demo-banner { background: ${dark ? "#2a2000" : "#fefce8"}; border-bottom: 1px solid ${dark ? "#4a3800" : "#fde68a"}; padding: 10px 20px; font-size: 12px; color: ${dark ? "#fbbf24" : "#92400e"}; font-family: var(--sans); }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

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
  const gradient = getGradient(story.genre);
  return (
    <div className="story-card" onClick={onClick}>
      <div className="card-cover" style={{ background: gradient }} />
      <div className="card-meta">
        {story.genre && <span className="genre-badge">{story.genre}</span>}
        {showPublicBadge && <span className="public-badge">{story.is_public ? "Public" : "Private"}</span>}
        <span className="card-date">{formatDate(story.created_at)}</span>
        <span className="dot">·</span>
        <span className="card-words">{story.word_count} words · {readTime(story.word_count)} min read</span>
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
  const gradient = getGradient(story.genre);
  return (
    <div className="view">
      {/* Hero cover */}
      <div className="story-hero" style={{ background: gradient }}>
        <div className="story-hero-overlay" />
        {story.genre && <div className="story-hero-genre">{story.genre}</div>}
        <h1 className="story-hero-title">{story.title}</h1>
      </div>

      {/* Sticky action bar */}
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
        <div className="reader-meta">
          <span>{formatDate(story.created_at)}</span>
          <span>·</span>
          <span>{story.word_count} words</span>
          <span>·</span>
          <span>{readTime(story.word_count)} min read</span>
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
          {genre && <div className="genre-preview" style={{ background: getGradient(genre) }} />}
        </div>
        <div className="field">
          <label>Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your story here…" />
          <div className="word-count-bar">{words} words · {readTime(words)} min read</div>
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
function PublicPage({ dark, toggleDark }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const demo = !isConfigured();

  useEffect(() => {
    if (demo) { setStories(DEMO_STORIES.filter((s) => s.is_public)); setLoading(false); return; }
    (async () => {
      try {
        const db = await supabase.from("stories");
        const data = await db.select("*", "&is_public=eq.true");
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

  const usedGenres = [...new Set(stories.map((s) => s.genre).filter(Boolean))];

  if (selected) {
    return (
      <>
        <style>{getStyles(dark)}</style>
        <ReaderView story={selected} onBack={() => setSelected(null)} readOnly />
      </>
    );
  }

  return (
    <>
      <style>{getStyles(dark)}</style>
      <div className="app">
        <div className="public-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="public-title">fic<span style={{ color: "var(--accent)" }}>.</span>archive</div>
              <div className="public-subtitle">A collection of short fiction</div>
            </div>
            <button className="btn-mode" onClick={toggleDark}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
        <div className="header" style={{ paddingTop: 14 }}>
          <div className="search-row">
            <input className="search-input" type="text" placeholder="Search stories…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="genre-select" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
              <option value="">All genres</option>
              {usedGenres.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div className="stats-bar">{loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "story" : "stories"}`}</div>
        <div className="story-list">
          {loading ? null : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✦</div>
              <div className="empty-title">{search || genreFilter ? "No stories found" : "Nothing published yet"}</div>
              <div className="empty-sub">{search || genreFilter ? "Try a different search." : "Check back soon."}</div>
            </div>
          ) : filtered.map((s) => <StoryCard key={s.id} story={s} onClick={() => setSelected(s)} />)}
        </div>
      </div>
    </>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const toggleDark = () => setDark((d) => !d);

  if (isPublicRoute()) return <PublicPage dark={dark} toggleDark={toggleDark} />;

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
      <style>{getStyles(dark)}</style>
      <div className="app">
        {demo && <div className="demo-banner"><strong>Demo mode</strong> — add your Supabase credentials to persist stories.</div>}
        <header className="header">
          <div className="header-top">
            <div className="logo">fic<span>.</span>archive</div>
            <div className="header-actions">
              <button className="btn-mode" onClick={toggleDark}>{dark ? "☀️" : "🌙"}</button>
              <button className="btn-new" onClick={() => { setSelected(null); setView("write"); }}>+ New</button>
            </div>
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
          ) : filtered.map((s) => (
            <StoryCard key={s.id} story={s} onClick={() => { setSelected(s); setView("read"); }} showPublicBadge />
          ))}
        </div>
        {view === "read" && selected && <ReaderView story={selected} onBack={() => setView("list")} onEdit={() => setView("write")} onDelete={handleDelete} />}
        {view === "write" && <EditorView story={selected} onBack={() => setView(selected ? "read" : "list")} onSave={handleSave} saving={saving} />}
        {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
        <Toast msg={toast} />
      </div>
    </>
  );
}
