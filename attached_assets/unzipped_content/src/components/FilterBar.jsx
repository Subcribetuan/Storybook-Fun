import { useStore } from '../hooks/useStore';
import { categories } from '../data/stories';

export default function FilterBar() {
  const { filter, setFilter } = useStore();

  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8,
      marginBottom: 24, WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none', animation: 'fadeUp 0.5s ease 0.1s both'
    }}>
      {Object.entries(categories).map(([key, val]) => (
        <button
          key={key}
          className="filter-btn"
          onClick={() => setFilter(key)}
          style={{
            border: '1px solid',
            borderColor: filter === key ? 'var(--border-hover)' : 'var(--border)',
            background: filter === key ? 'var(--bg-card-hover)' : 'var(--bg-card)',
            color: filter === key ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          <span>{val.icon}</span> {val.label}
        </button>
      ))}
    </div>
  );
}
