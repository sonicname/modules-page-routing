import { Link, Outlet } from 'react-router';

export default function DocsLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Docs Sidebar */}
      <aside
        style={{
          width: 280,
          backgroundColor: '#fefce8',
          borderRight: '1px solid #fef08a',
          padding: 20,
        }}
      >
        <h2 style={{ marginBottom: 20 }}>📚 Documentation</h2>
        <nav>
          <h4 style={{ color: '#854d0e', marginBottom: 10 }}>
            Getting Started
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20 }}>
            <li style={{ marginBottom: 8 }}>
              <Link to='/docs/introduction' style={{ color: '#ca8a04' }}>
                Introduction
              </Link>
            </li>
            <li style={{ marginBottom: 8 }}>
              <Link to='/docs/installation' style={{ color: '#ca8a04' }}>
                Installation
              </Link>
            </li>
            <li style={{ marginBottom: 8 }}>
              <Link to='/docs/quick-start' style={{ color: '#ca8a04' }}>
                Quick Start
              </Link>
            </li>
          </ul>

          <h4 style={{ color: '#854d0e', marginBottom: 10 }}>Advanced</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: 8 }}>
              <Link to='/docs/api/routes' style={{ color: '#ca8a04' }}>
                API Routes
              </Link>
            </li>
            <li style={{ marginBottom: 8 }}>
              <Link to='/docs/guides/layouts' style={{ color: '#ca8a04' }}>
                Layout Guide
              </Link>
            </li>
            <li style={{ marginBottom: 8 }}>
              <Link
                to='/docs/deep/nested/path/example'
                style={{ color: '#ca8a04' }}
              >
                Deep Nested
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Docs Content */}
      <main style={{ flex: 1, padding: 30, backgroundColor: 'white' }}>
        <Outlet />
      </main>
    </div>
  );
}
