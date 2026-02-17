import { useState, useEffect } from 'react';

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setVisible(false);
    setPrompt(null);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: 16, right: 16,
      background: 'rgba(99, 102, 241, 0.95)', backdropFilter: 'blur(20px)',
      borderRadius: 20, padding: 20, zIndex: 100,
      display: 'flex', alignItems: 'center', gap: 16,
      animation: 'slideUp 0.5s ease both',
      boxShadow: '0 8px 40px rgba(0,0,0,0.4)'
    }}>
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 15,
          fontWeight: 700, color: '#fff', margin: 0
        }}>
          Add to Home Screen
        </p>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 12,
          color: 'rgba(255,255,255,0.7)', margin: '4px 0 0'
        }}>
          Read stories offline — no internet needed
        </p>
      </div>
      <button
        onClick={install}
        style={{
          background: '#fff', color: '#4f46e5', border: 'none',
          borderRadius: 12, padding: '10px 20px',
          fontFamily: 'var(--font-display)', fontSize: 14,
          fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
        }}
      >
        Install
      </button>
      <button
        onClick={() => setVisible(false)}
        style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', fontSize: 20,
          cursor: 'pointer', padding: '0 4px'
        }}
      >
        ×
      </button>
    </div>
  );
}
