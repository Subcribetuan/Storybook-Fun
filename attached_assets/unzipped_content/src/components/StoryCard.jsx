import { useStore } from '../hooks/useStore';

export default function StoryCard({ story, delay = 0 }) {
  const { openStory, favorites, toggleFavorite } = useStore();
  const isFav = favorites.includes(story.id);

  return (
    <div
      className="card"
      onClick={() => openStory(story)}
      style={{ animation: `fadeUp 0.4s ease ${delay}s both` }}
    >
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
      </div>
      <div style={{
        position: 'absolute', bottom: -20, right: -20, width: 70, height: 70,
        borderRadius: '50%', background: `${story.color}12`, filter: 'blur(20px)'
      }} />
    </div>
  );
}
