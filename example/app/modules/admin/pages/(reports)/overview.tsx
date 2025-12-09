import { Link } from 'react-router';

export default function ReportsOverview() {
  return (
    <div>
      <h1>📈 Reports - Overview</h1>

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
        <code>modules/admin/pages/(reports)/overview.tsx</code>
        <p style={{ marginTop: 10, color: '#6b7280' }}>
          This file creates the route: <strong>/admin/overview</strong>
        </p>
        <p style={{ color: '#6b7280' }}>
          ℹ️ The <code>(reports)</code> folder is a <strong>route group</strong>{' '}
          - it's used for organization only and does NOT appear in the URL!
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginTop: 20,
        }}
      >
        <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8 }}>
          <h3>📊 Total Users</h3>
          <p style={{ fontSize: 32, fontWeight: 'bold', color: '#3b82f6' }}>
            1,234
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8 }}>
          <h3>💰 Revenue</h3>
          <p style={{ fontSize: 32, fontWeight: 'bold', color: '#10b981' }}>
            $45,678
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8 }}>
          <h3>📦 Orders</h3>
          <p style={{ fontSize: 32, fontWeight: 'bold', color: '#f59e0b' }}>
            567
          </p>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link to='/admin/analytics' style={{ color: '#3b82f6' }}>
          View Analytics →
        </Link>
      </div>
    </div>
  );
}
