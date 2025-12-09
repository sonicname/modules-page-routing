export default function AdminDashboard() {
  return (
    <div>
      <h1>📊 Admin Dashboard</h1>
      <p>Welcome to the admin panel!</p>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h3>📝 Example: Index Route</h3>
        <code>modules/admin/pages/index.tsx</code>
        <p style={{ marginTop: 10, color: '#6b7280' }}>
          This file creates the route: <strong>/admin</strong>
        </p>
      </div>
    </div>
  );
}
