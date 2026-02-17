import { useState, useEffect, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import { useSwipe } from '../hooks/useSwipe';

/**
 * Classifies a paragraph for styling:
 * - 'loud': CAPS sound effects (VROOM, BOOM, etc.)
 * - 'dialogue': contains quotation marks
 * - 'fading': trailing off dialogue (contains "..." inside quotes)
 * - 'narration': everything else
 */
function classifyParagraph(text) {
  const trimmed = text.trim();
  if (/^[A-Z]{3,}|VROOM|BOOM|SPLASH|BOING|SPLAT|BONK|WHEEE|AWOO/.test(trimmed)) return 'loud';
  if (trimmed.includes('...') && (trimmed.includes('"') || trimmed.includes('\u201c'))) return 'fading';
  if (trimmed.includes('"') || trimmed.includes('\u201c')) return 'dialogue';
  return 'narration';
}

function Paragraph({ text, type, color, delay }) {
  const styles = {
    loud: {
      fontSize: 19, fontWeight: 800, color, letterSpacing: 1.5, textAlign: 'center'
    },
    dialogue: {
      fontSize: 16, fontWeight: 500, color: '#f1f5f9'
    },
    fading: {
      fontSize: 16, fontWeight: 500, color: '#f1f5f9', fontStyle: 'italic'
    },
    narration: {
      fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.6)'
    }
  };

  return (
    <p style={{
      fontFamily: 'var(--font-display)',
      lineHeight: 1.8,
      margin: '0 0 14px',
      animation: `fadeUp 0.4s ease ${delay}s both`,
      ...styles[type]
    }}>
      {text}
    </p>
  );
}

export default function ReadingView() {
  const { activeStory: story, closeReader, progress, setPageForStory } = useStore();
  const [page, setPage] = useState(progress[story?.id] || 0);
  const [animKey, setAnimKey] = useState(0);
  const contentRef = useRef(null);
  const total = story?.pages.length || 0;
  const pct = ((page + 1) / total) * 100;

  const goTo = (p) => {
    setAnimKey((k) => k + 1);
    setPage(p);
    setPageForStory(story.id, p);
  };

  const nextPage = () => { if (page < total - 1) goTo(page + 1); };
  const prevPage = () => { if (page > 0) goTo(page - 1); };

  const { onTouchStart, onTouchEnd } = useSwipe({
    onSwipeLeft: nextPage,
    onSwipeRight: prevPage
  });

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [page]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'Escape') closeReader();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [page]);

  if (!story) return null;

  const paragraphs = story.pages[page].text.split('\n').filter(Boolean);

  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 8px', position: 'sticky', top: 0, zIndex: 10,
        background: 'linear-gradient(to bottom, var(--bg) 70%, transparent)'
      }}>
        <button
          onClick={closeReader}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', borderRadius: 12, padding: '8px 14px',
            cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)'
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          {page + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 3, background: 'var(--border)', margin: '0 20px',
        borderRadius: 4, overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 4,
          background: story.color, transition: 'width 0.4s ease'
        }} />
      </div>

      {/* Content */}
      <div ref={contentRef} style={{
        flex: 1, padding: '28px 22px 140px',
        maxWidth: 600, margin: '0 auto', width: '100%'
      }}>
        {page === 0 && (
          <div style={{ textAlign: 'center', marginBottom: 28, animation: 'fadeUp 0.5s ease both' }}>
            <span style={{ fontSize: 44 }}>{story.emoji}</span>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
              color: 'var(--text-primary)', lineHeight: 1.25, margin: '12px 0 0'
            }}>
              {story.title}
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 13,
              color: 'var(--text-muted)', marginTop: 6
            }}>
              A bedtime story for Christopher and Benjamin
            </p>
          </div>
        )}

        <div key={animKey} style={{ animation: 'fadeIn 0.35s ease both' }}>
          {paragraphs.map((text, i) => (
            <Paragraph
              key={i}
              text={text}
              type={classifyParagraph(text)}
              color={story.color}
              delay={i * 0.06}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '20px 20px', paddingBottom: 'var(--safe-bottom)',
        display: 'flex', gap: 10, justifyContent: 'center',
        background: 'linear-gradient(to top, var(--bg) 65%, transparent)', zIndex: 10
      }}>
        <button
          className="nav-btn"
          disabled={page === 0}
          onClick={prevPage}
          style={{
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: page === 0 ? 'rgba(255,255,255,0.15)' : 'var(--text-secondary)',
            cursor: page === 0 ? 'default' : 'pointer'
          }}
        >
          ← Back
        </button>
        <button
          className="nav-btn"
          onClick={() => page < total - 1 ? nextPage() : closeReader()}
          style={{
            border: 'none', color: '#fff',
            background: story.color,
            boxShadow: `0 4px 20px ${story.color}44`
          }}
        >
          {page < total - 1 ? 'Next →' : '✓ Done'}
        </button>
      </div>
    </div>
  );
}
