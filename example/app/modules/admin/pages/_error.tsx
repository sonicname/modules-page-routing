import { Link, useRouteError } from 'react-router';

export default function AdminError() {
  const error = useRouteError();
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred';

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h1 style={{ fontSize: 64, margin: 0 }}>&#x26A0;&#xFE0F;</h1>
      <h2>Admin Error</h2>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: '#fef2f2',
          borderRadius: 8,
          border: '1px solid #fecaca',
          display: 'inline-block',
          maxWidth: 500,
        }}
      >
        <h3>Example: Error Boundary</h3>
        <code>modules/admin/pages/_error.tsx</code>
        <p style={{ marginTop: 10, color: '#991b1b' }}>{message}</p>
      </div>

      <p style={{ marginTop: 20, color: '#6b7280' }}>
        This error boundary catches all errors in <strong>/admin/*</strong>{' '}
        routes.
      </p>
      <Link
        to="/admin"
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
