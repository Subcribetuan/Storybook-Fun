import { useStore } from '../hooks/useStore';

function isNewStory(dateAdded) {
  if (!dateAdded) return false;
  const added = new Date(dateAdded);
  const now = new Date();
  const diffDays = (now - added) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

function formatDate(dateAdded) {
  if (!dateAdded) return '';
  const d = new Date(dateAdded);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StoryCard({ story, delay = 0 }) {
  const { openStory, favorites, toggleFavorite } = useStore();
  const isFav = favorites.includes(story.id);
  const isNew = isNewStory(story.dateAdded);

  return (
    <div
      className="card"
      onClick={() => openStory(story)}
      style={{ animation: `fadeUp 0.4s ease ${delay}s both`, position: 'relative' }}
    >
      {isNew && (
        <span style={{
          position: 'absolute', top: -6, left: -6,
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          color: '#fff', fontSize: 10, fontWeight: 700,
          fontFamily: 'var(--font-body)',
          padding: '3px 8px', borderRadius: 8,
          textTransform: 'uppercase', letterSpacing: 0.5,
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
          zIndex: 2
        }}>
          New
        </span>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 32 }}>{story.emoji}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(story.id); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 18, opacity: isFav ? 1 : 0.3, transition: 'opacity 0.2s',
              padding: 4
            }}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFav ? '❤️' : '🤍'}
          </button>
          <span style={{
            fontSize: 11, color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.06)', padding: '4px 10px',
            borderRadius: 20, fontFamily: 'var(--font-body)'
          }}>
            {story.readTime}
          </span>
        </div>
      </div>
      <div>
        <h3 style={{
          fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)', lineHeight: 1.35, margin: 0
        }}>
          {story.title}
        </h3>
        <p style={{
          fontSize: 12, color: 'var(--text-muted)', margin: '5px 0 0',
          fontFamily: 'var(--font-body)', textTransform: 'capitalize'
        }}>
          {story.category} · {story.pages.length} pages
        </p>
        {story.dateAdded && (
          <p style={{
            fontSize: 11, color: 'var(--text-faint, var(--text-muted))', margin: '4px 0 0',
            fontFamily: 'var(--font-body)', opacity: 0.6
          }}>
            Added {formatDate(story.dateAdded)}
          </p>
        )}
      </div>
      <div style={{
        position: 'absolute', bottom: -20, right: -20, width: 70, height: 70,
        borderRadius: '50%', background: `${story.color}12`, filter: 'blur(20px)'
      }} />
    </div>
  );
}
