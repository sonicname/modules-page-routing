import { Link } from 'react-router';

export default function Homepage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>🚀 modules-page-routing Examples</h1>
      <p style={{ color: '#6b7280', marginBottom: 40 }}>
        Comprehensive examples demonstrating all routing features
      </p>

      {/* Feature Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 20,
        }}
      >
        {/* Layout Example */}
        <div
          style={{
            backgroundColor: '#f0f9ff',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #bae6fd',
          }}
        >
          <h3 style={{ color: '#0369a1', marginBottom: 10 }}>📁 _layout.tsx</h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Wrap child routes with shared layouts (sidebar, header, etc.)
          </p>
          <Link to='/admin' style={{ color: '#0284c7' }}>
            View Admin Layout →
          </Link>
        </div>

        {/* Index Route */}
        <div
          style={{
            backgroundColor: '#f0fdf4',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #bbf7d0',
          }}
        >
          <h3 style={{ color: '#15803d', marginBottom: 10 }}>📄 index.tsx</h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Index routes for folder root paths
          </p>
          <Link to='/admin' style={{ color: '#16a34a' }}>
            /admin (index) →
          </Link>
        </div>

        {/* Dynamic Routes */}
        <div
          style={{
            backgroundColor: '#fef3c7',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #fde68a',
          }}
        >
          <h3 style={{ color: '#b45309', marginBottom: 10 }}>🔗 [id].tsx</h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Dynamic route parameters
          </p>
          <Link to='/admin/users/123' style={{ color: '#d97706' }}>
            /admin/users/123 →
          </Link>
        </div>

        {/* Catch-All Routes */}
        <div
          style={{
            backgroundColor: '#fce7f3',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #fbcfe8',
          }}
        >
          <h3 style={{ color: '#be185d', marginBottom: 10 }}>
            🌐 [...path].tsx
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Catch-all routes for any depth paths
          </p>
          <Link to='/docs/guides/advanced/routing' style={{ color: '#db2777' }}>
            /docs/guides/advanced/routing →
          </Link>
        </div>

        {/* Not Found */}
        <div
          style={{
            backgroundColor: '#fef2f2',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #fecaca',
          }}
        >
          <h3 style={{ color: '#b91c1c', marginBottom: 10 }}>
            🔍 _not-found.tsx
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Custom 404 pages per module
          </p>
          <Link
            to='/admin/this-page-does-not-exist'
            style={{ color: '#dc2626' }}
          >
            /admin/non-existent →
          </Link>
        </div>

        {/* Parentless Routes */}
        <div
          style={{
            backgroundColor: '#f5f3ff',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #ddd6fe',
          }}
        >
          <h3 style={{ color: '#6d28d9', marginBottom: 10 }}>
            🚪 _folder (Parentless)
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Escape from parent layouts
          </p>
          <Link to='/admin/fullscreen' style={{ color: '#7c3aed' }}>
            /admin/fullscreen (no sidebar!) →
          </Link>
        </div>

        {/* Route Groups */}
        <div
          style={{
            backgroundColor: '#ecfdf5',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #a7f3d0',
          }}
        >
          <h3 style={{ color: '#047857', marginBottom: 10 }}>📂 (group)</h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Organizational folders (no URL segment)
          </p>
          <div>
            <Link
              to='/admin/overview'
              style={{ color: '#059669', marginRight: 10 }}
            >
              /admin/overview →
            </Link>
            <Link to='/admin/analytics' style={{ color: '#059669' }}>
              /admin/analytics →
            </Link>
          </div>
        </div>

        {/* Auth Module */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ color: '#475569', marginBottom: 10 }}>🔐 Auth Module</h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Basic module with layout
          </p>
          <div>
            <Link
              to='/auth/sign-in'
              style={{ color: '#64748b', marginRight: 10 }}
            >
              Sign In →
            </Link>
            <Link to='/auth/sign-up' style={{ color: '#64748b' }}>
              Sign Up →
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div style={{ marginTop: 40 }}>
        <h2>📋 File Naming Conventions</h2>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: 20,
            backgroundColor: 'white',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th
                style={{
                  padding: 12,
                  textAlign: 'left',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                File/Folder
              </th>
              <th
                style={{
                  padding: 12,
                  textAlign: 'left',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                URL Result
              </th>
              <th
                style={{
                  padding: 12,
                  textAlign: 'left',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                <code>index.tsx</code>
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                /module
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                Index route
              </td>
            </tr>
            <tr>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                <code>_layout.tsx</code>
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                -
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                Layout wrapper
              </td>
            </tr>
            <tr>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                <code>[id].tsx</code>
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                /:id
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                Dynamic param
              </td>
            </tr>
            <tr>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                <code>[...path].tsx</code>
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                /*
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                Catch-all
              </td>
            </tr>
            <tr>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                <code>_not-found.tsx</code>
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                /*
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                404 page
              </td>
            </tr>
            <tr>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                <code>_folder/</code>
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                /folder
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                Parentless (no layout)
              </td>
            </tr>
            <tr>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                <code>(group)/</code>
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                -
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                Org only
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
