/**
 * SHELL TAB - ACTIVATED
 * MB.MD Track 1: Full terminal with xterm.js
 * 
 * This file activates once terminal packages are installed:
 * npm install xterm xterm-addon-fit xterm-addon-web-links node-pty
 */

import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { AlertCircle } from 'lucide-react';

export default function ShellTabActivated() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    try {
      // Create terminal
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#cccccc',
          cursor: '#ffffff',
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#e5e5e5'
        }
      });

      // Add addons
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      
      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);
      
      // Open terminal
      term.open(terminalRef.current);
      fitAddon.fit();
      
      xtermRef.current = term;

      // Connect to PTY WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/terminal-socket`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Terminal WebSocket connected');
        term.writeln('Welcome to MB.MD Visual Editor Terminal!');
        term.writeln('Connected to server shell...\r\n');
      };

      ws.onmessage = (event) => {
        term.write(event.data);
      };

      ws.onerror = (error) => {
        console.error('Terminal WebSocket error:', error);
        setError('Failed to connect to terminal server');
      };

      ws.onclose = () => {
        term.writeln('\r\n\r\nTerminal connection closed.');
      };

      // Send input to server
      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });

      // Handle resize
      const handleResize = () => {
        fitAddon.fit();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'resize',
            cols: term.cols,
            rows: term.rows
          }));
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        ws.close();
        term.dispose();
      };
    } catch (err) {
      console.error('Terminal initialization error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <p className="text-red-500 mb-2">Terminal Error</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={terminalRef} className="h-full w-full bg-[#1e1e1e]" data-testid="terminal-shell" />
  );
}
