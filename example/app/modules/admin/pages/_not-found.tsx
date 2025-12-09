import { Link } from 'react-router';

export default function AdminNotFound() {
  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h1 style={{ fontSize: 64, margin: 0 }}>🔍</h1>
      <h2>404 - Admin Page Not Found</h2>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'inline-block',
        }}
      >
        <h3>📝 Example: Not Found Route</h3>
        <code>modules/admin/pages/_not-found.tsx</code>
        <p style={{ marginTop: 10, color: '#6b7280' }}>
          This file catches all unmatched routes under:{' '}
          <strong>/admin/*</strong>
        </p>
      </div>

      <p style={{ marginTop: 20 }}>
        The page you're looking for doesn't exist in the admin panel.
      </p>
      <Link
        to='/admin'
        style={{
          color: 'white',
          backgroundColor: '#3b82f6',
          padding: '10px 20px',
          borderRadius: 6,
          textDecoration: 'none',
          display: 'inline-block',
          marginTop: 10,
        }}
      >
        Go to Admin Dashboard
      </Link>
    </div>
  );
}
