import { Link } from 'react-router';

export default function AnalyticsPage() {
  return (
    <div>
      <h1>📊 Reports - Analytics</h1>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: '#ecfdf5',
          borderRadius: 8,
          border: '1px solid #6ee7b7',
        }}
      >
        <h3 style={{ color: '#059669' }}>
          📝 Example: Route Group - (reports)
        </h3>
        <code>modules/admin/pages/(reports)/analytics.tsx</code>
        <p style={{ marginTop: 10, color: '#6b7280' }}>
          This file creates the route: <strong>/admin/analytics</strong>
        </p>
        <p style={{ color: '#6b7280' }}>
          ℹ️ Both <code>overview.tsx</code> and <code>analytics.tsx</code> are
          in the same
          <code>(reports)</code> route group for organization, but the group
          name doesn't appear in URLs.
        </p>
      </div>

      <div
        style={{
          marginTop: 20,
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 8,
        }}
      >
        <h3>Traffic Overview</h3>
        <div
          style={{
            height: 200,
            backgroundColor: '#f3f4f6',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
          }}
        >
          📈 Chart placeholder
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link to='/admin/overview' style={{ color: '#3b82f6' }}>
          ← Back to Overview
        </Link>
      </div>
    </div>
  );
}
