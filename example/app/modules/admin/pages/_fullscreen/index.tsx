import { Link } from 'react-router';

export default function FullscreenEditor() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1f2937',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '10px 20px',
          backgroundColor: '#111827',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0 }}>📝 Fullscreen Editor</h2>
        <Link
          to='/admin'
          style={{
            color: 'white',
            backgroundColor: '#ef4444',
            padding: '8px 16px',
            borderRadius: 6,
            textDecoration: 'none',
          }}
        >
          ✕ Close
        </Link>
      </header>

      {/* Editor Content */}
      <main
        style={{
          flex: 1,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            backgroundColor: '#374151',
            borderRadius: 8,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <h3 style={{ color: '#fbbf24', marginTop: 0 }}>
            📝 Example: Parentless Route (_folder)
          </h3>
          <code style={{ color: '#a5b4fc' }}>
            modules/admin/pages/_fullscreen/index.tsx
          </code>
          <p style={{ marginTop: 10, color: '#9ca3af' }}>
            This file creates the route: <strong>/admin/fullscreen</strong>
          </p>
          <p style={{ color: '#9ca3af' }}>
            ⚠️ <strong>NOTICE:</strong> This page does NOT have the admin
            sidebar layout!
            <br />
            The <code>_</code> prefix makes it a "parentless" route that escapes
            from parent layouts.
          </p>
        </div>

        <textarea
          style={{
            flex: 1,
            backgroundColor: '#0d1117',
            color: '#c9d1d9',
            border: 'none',
            borderRadius: 8,
            padding: 20,
            fontFamily: 'monospace',
            fontSize: 14,
            resize: 'none',
          }}
          placeholder="// Start typing your code here...
// This is a fullscreen editor without the admin sidebar layout
// because it uses a parentless route (_fullscreen folder)

function hello() {
  console.log('Hello, World!');
}"
        />
      </main>
    </div>
  );
}
