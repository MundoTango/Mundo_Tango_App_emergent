
import React from 'react';

const MemoriesDebug: React.FC = () => {
  const componentInfo = {
    timestamp: Date.now(),
    buildTime: import.meta.env.VITE_BUILD_TIME || 'Unknown',
    environment: import.meta.env.MODE,
    currentPath: window.location.pathname,
    currentComponent: 'MemoriesDebug',
    serviceWorkerActive: 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null,
    cacheAPI: 'caches' in window,
    userAgent: navigator.userAgent,
    lastModified: document.lastModified,
  };

  const checkComponents = async () => {
    const components = {
      ModernMemoriesPage: false,
      EnhancedMemoriesRealtime: false,
      PostCreator: false,
      EnhancedMemoriesUI: false,
    };

    // Check if components can be dynamically imported
    try {
      await import('./ModernMemoriesPage');
      components.ModernMemoriesPage = true;
    } catch (e) {
      console.error('ModernMemoriesPage import failed:', e);
    }

    try {
      await import('../../components/memories/EnhancedMemoriesRealtime');
      components.EnhancedMemoriesRealtime = true;
    } catch (e) {
      console.error('EnhancedMemoriesRealtime import failed:', e);
    }

    try {
      await import('../../components/universal/PostCreator');
      components.PostCreator = true;
    } catch (e) {
      console.error('PostCreator import failed:', e);
    }

    try {
      await import('../../components/memories/EnhancedMemoriesUI');
      components.EnhancedMemoriesUI = true;
    } catch (e) {
      console.error('EnhancedMemoriesUI import failed:', e);
    }

    return components;
  };

  const [componentStatus, setComponentStatus] = React.useState<any>(null);

  React.useEffect(() => {
    checkComponents().then(setComponentStatus);
  }, []);

  const clearCaches = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✅ Cleared all caches:', cacheNames);
    }
    
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('✅ Unregistered service workers');
    }
    
    // Force reload
    window.location.reload();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px', 
      fontFamily: 'monospace',
      background: 'linear-gradient(135deg, #5EEAD4 0%, #155E75 100%)',
      color: 'white'
    }}>
      <div style={{ 
        background: 'rgba(0,0,0,0.8)', 
        padding: '20px', 
        borderRadius: '10px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1>🔍 Memories Page Debug Console</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <h2>📊 System Information</h2>
          <pre style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(componentInfo, null, 2)}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>🧩 Component Status</h2>
          {componentStatus ? (
            <div>
              {Object.entries(componentStatus).map(([name, available]) => (
                <div key={name} style={{ margin: '5px 0' }}>
                  {available ? '✅' : '❌'} {name}
                </div>
              ))}
            </div>
          ) : (
            <div>Loading component status...</div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>🧹 Cache Control</h2>
          <button data-testid="button-clear-all-caches-r" 
            onClick={clearCaches}
            style={{
              background: '#DC2626',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Clear All Caches & Reload
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>🎯 Expected vs Actual</h2>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '5px' }}>
            <div><strong>Expected Title:</strong> "Memories" (Pierre Dubois Interface)</div>
            <div><strong>Expected Layout:</strong> Three-column with community stats</div>
            <div><strong>Expected Stats:</strong> 3.2K, 945, 6.8K, 184</div>
            <div><strong>Current Route:</strong> {window.location.pathname}</div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>🔗 Quick Actions</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a data-testid="a-go-to-memories" 
              href="/memories" 
              style={{ 
                background: '#5EEAD4', 
                color: '#155E75', 
                padding: '10px 15px', 
                textDecoration: 'none', 
                borderRadius: '5px',
                fontWeight: 'bold'
              }}
            >
              Go to /memories
            </a>
            <a data-testid="a-go-to-timeline-red" 
              href="/timeline" 
              style={{ 
                background: '#14B8A6', 
                color: 'white', 
                padding: '10px 15px', 
                textDecoration: 'none', 
                borderRadius: '5px'
              }}
            >
              Go to /timeline (redirect test)
            </a>
            <button data-testid="button-hard-reload" 
              onClick={() => window.location.reload()}
              style={{
                background: '#0F766E',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Hard Reload
            </button>
          </div>
        </div>

        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '20px' }}>
          This diagnostic page will help identify caching issues. Remove after debugging.
        </div>
      </div>
    </div>
  );
};

export default MemoriesDebug;
