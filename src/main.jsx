import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', color: '#dc2626', background: '#fee2e2', borderRadius: '12px', margin: '30px' }}>
          <h2>⚠️ Application Rendering Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '15px', borderRadius: '8px', color: '#111', fontSize: '13px' }}>
            {this.state.error?.toString()}
            {'\n'}
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '15px', padding: '10px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Reset Local Storage & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global unhandled error trap
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root && root.innerHTML.trim() === '') {
    root.innerHTML = `
      <div style="padding: 30px; font-family: sans-serif; color: #dc2626; background: #fee2e2; border-radius: 12px; margin: 30px;">
        <h2>⚠️ JavaScript Error</h2>
        <pre style="white-space: pre-wrap; background: #fff; padding: 15px; border-radius: 8px; color: #111; font-size: 13px;">${event.message}\n${event.filename}:${event.lineno}:${event.colno}</pre>
        <button onclick="localStorage.clear(); window.location.reload();" style="margin-top: 15px; padding: 10px 18px; background: #dc2626; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
          Clear Cache & Reload
        </button>
      </div>
    `;
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
