import { Link } from 'react-router';

export default function DocsIndex() {
  return (
    <div>
      <h1>📚 Documentation Home</h1>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: '#fefce8',
          borderRadius: 8,
          border: '1px solid #fef08a',
        }}
      >
        <h3>📝 Example: Module Index</h3>
        <code>modules/docs/pages/index.tsx</code>
        <p style={{ marginTop: 10, color: '#6b7280' }}>
          This file creates the route: <strong>/docs</strong>
        </p>
      </div>

      <p style={{ marginTop: 20 }}>
        Welcome to the documentation! Click on any link in the sidebar to
        navigate.
      </p>

      <div style={{ marginTop: 20 }}>
        <Link
          to='/docs/introduction'
          style={{
            backgroundColor: '#eab308',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 6,
            textDecoration: 'none',
          }}
        >
          Get Started →
        </Link>
      </div>
    </div>
  );
}
