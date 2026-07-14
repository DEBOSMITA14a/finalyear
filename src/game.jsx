import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function GamePage() {
  const handleGameComplete = () => {
    // 1. Mark the game as complete in sessionStorage
    const stored = window.sessionStorage.getItem('neurovice_completed_steps');
    let completedSteps = stored ? JSON.parse(stored) : [];
    
    if (!completedSteps.includes('game-one')) {
      completedSteps.push('game-one');
      window.sessionStorage.setItem('neurovice_completed_steps', JSON.stringify(completedSteps));
    }
    
    // 2. Return directly to the dashboard
    window.location.href = '/dashboard.html';
  };

  useEffect(() => {
    // Listen for automatic completion from GDevelop, just in case
    const handleMessage = (event) => {
      const data = event.data;
      if (data === 'GAME_COMPLETED' || data?.type === 'GAME_COMPLETE' || data?.type === 'gameComplete') {
        handleGameComplete();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#11100f', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <nav style={{ padding: '16px 24px', background: '#1a1715', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(247, 247, 242, 0.12)' }}>
        <a href="/dashboard.html" style={{ color: '#f7f7f2', textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>
          ← Back to Dashboard
        </a>
        <span style={{ color: '#9ff0d1', fontWeight: '600', fontFamily: "'Libre Franklin', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
          Eagle vs Cloud
        </span>
      </nav>
      
      {/* Centered wrapper to respect the 720x1300 aspect ratio */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', padding: '20px' }}>
        <iframe 
          src="https://itch.io/embed-upload/17591024?color=333333" 
          style={{ width: '100%', maxWidth: '720px', aspectRatio: '720/1300', border: 'none' }}
          allowFullScreen
          title="Attention Sky Game"
        ></iframe>
      </div>

      {/* Manual Complete Game button in bottom right */}
      <button
        onClick={handleGameComplete}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          border: 'none',
          cursor: 'pointer',
          zIndex: 50,
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}
      >
        Complete Game
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<GamePage />);