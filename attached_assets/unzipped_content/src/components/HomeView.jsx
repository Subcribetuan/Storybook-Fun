import { useStore } from '../hooks/useStore';
import { stories } from '../data/stories';
import StoryCard from './StoryCard';
import FilterBar from './FilterBar';

export default function HomeView() {
  const { filter } = useStore();
  const filtered = filter === 'all' ? stories : stories.filter((s) => s.category === filter);

  return (
    <div style={{
      position: 'relative', zIndex: 1,
      padding: '40px 18px 32px', maxWidth: 800, margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeUp 0.5s ease both' }}>
        <div style={{ fontSize: 48, marginBottom: 12, animation: 'float 4s ease-in-out infinite' }}>
          🌙
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
          background: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1.25
        }}>
          Christopher &amp; Benjamin's
          <br />
          Storybook
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14,
          color: 'var(--text-muted)', marginTop: 8
        }}>
          {stories.length} stories for two brave brothers
        </p>
      </div>

      <FilterBar />

      {/* Story Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 14
      }}>
        {filtered.map((story, i) => (
          <StoryCard key={story.id} story={story} delay={i * 0.05} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>
            No stories in this category yet
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center', marginTop: 48, padding: '20px 0',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 13,
          color: 'var(--text-faint)', fontStyle: 'italic'
        }}>
          You just get there first. Mommy and Daddy will be right behind you.
        </p>
      </div>
    </div>
  );
}
