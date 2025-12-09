import { Link, Outlet } from 'react-router';

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 250,
          backgroundColor: '#1a1a2e',
          color: 'white',
          padding: 20,
        }}
      >
        <h2 style={{ marginBottom: 20 }}>🛠️ Admin Panel</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: 10 }}>
              <Link to='/admin' style={{ color: '#a5b4fc' }}>
                Dashboard
              </Link>
            </li>
            <li style={{ marginBottom: 10 }}>
              <Link to='/admin/users' style={{ color: '#a5b4fc' }}>
                Users
              </Link>
            </li>
            <li style={{ marginBottom: 10 }}>
              <Link to='/admin/settings' style={{ color: '#a5b4fc' }}>
                Settings
              </Link>
            </li>
            <li style={{ marginBottom: 10 }}>
              <Link to='/admin/reports' style={{ color: '#a5b4fc' }}>
                Reports
              </Link>
            </li>
          </ul>
        </nav>
        <hr style={{ margin: '20px 0', borderColor: '#374151' }} />
        <p style={{ fontSize: 12, color: '#9ca3af' }}>
          This layout wraps all /admin/* routes
        </p>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 30, backgroundColor: '#f3f4f6' }}>
        <Outlet />
      </main>
    </div>
  );
}
