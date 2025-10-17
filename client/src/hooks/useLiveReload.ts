/**
 * LIVE RELOAD HOOK - WebSocket Client
 * MB.MD Track 4: Auto-refresh on file changes
 */

import { useEffect, useState } from 'react';

const WEBSOCKET_URL = 'ws://localhost:8080';

export function useLiveReload() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastChange, setLastChange] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(WEBSOCKET_URL);

        ws.onopen = () => {
          console.log('🔄 Live Reload connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'file-change') {
              console.log(`📝 File changed: ${data.file}`);
              setLastChange(data.file);

              // Auto-reload for CSS changes (hot reload)
              if (data.file.endsWith('.css') || data.file.endsWith('.scss')) {
                // Reload stylesheets
                const links = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
                links.forEach(link => {
                  const href = link.href.split('?')[0];
                  link.href = `${href}?reload=${Date.now()}`;
                });
              } else {
                // Full page reload for other files
                window.location.reload();
              }
            }
          } catch (error) {
            console.error('Live reload message error:', error);
          }
        };

        ws.onclose = () => {
          console.log('❌ Live Reload disconnected');
          setIsConnected(false);
          
          // Reconnect after 2 seconds
          setTimeout(connect, 2000);
        };

        ws.onerror = (error) => {
          console.error('Live reload error:', error);
        };
      } catch (error) {
        console.error('Failed to connect to live reload server:', error);
      }
    };

    connect();

    return () => {
      ws?.close();
    };
  }, []);

  return { isConnected, lastChange };
}
