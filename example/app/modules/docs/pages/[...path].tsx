import { Link, useParams } from 'react-router';

export default function DocsCatchAll() {
  const params = useParams();
  const path = params['*'] || '';
  const segments = path.split('/').filter(Boolean);

  return (
    <div>
      <Link
        to='/docs'
        style={{ color: '#ca8a04', marginBottom: 20, display: 'inline-block' }}
      >
        ← Back to Docs Home
      </Link>

      <h1>📄 {segments[segments.length - 1] || 'Documentation'}</h1>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: '#fef3c7',
          borderRadius: 8,
          border: '1px solid #fcd34d',
        }}
      >
        <h3 style={{ color: '#b45309' }}>
          📝 Example: Catch-All Route [...path]
        </h3>
        <code>modules/docs/pages/[...path].tsx</code>
        <p style={{ marginTop: 10, color: '#6b7280' }}>
          This file creates the route: <strong>/docs/*</strong>
        </p>
        <p style={{ color: '#6b7280' }}>
          It catches ALL paths under /docs/ that don't match specific routes.
        </p>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
        }}
      >
        <h3>Current Path Information</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td
                style={{
                  padding: 8,
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 'bold',
                }}
              >
                Full Path
              </td>
              <td style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>
                <code
                  style={{
                    backgroundColor: '#f3f4f6',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  /docs/{path}
                </code>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: 8,
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 'bold',
                }}
              >
                Captured Value
              </td>
              <td style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>
                <code
                  style={{
                    backgroundColor: '#f3f4f6',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  {path || '(empty)'}
                </code>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: 8,
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 'bold',
                }}
              >
                Segments
              </td>
              <td style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>
                {segments.length > 0 ? (
                  segments.map((seg, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '2px 8px',
                        borderRadius: 4,
                        marginRight: 8,
                      }}
                    >
                      {seg}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#9ca3af' }}>(none)</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: '#f9fafb',
          borderRadius: 8,
        }}
      >
        <h3>Sample Content for: {path || 'index'}</h3>
        <p>
          This is dynamically generated content based on the URL path. In a real
          application, you would fetch the actual documentation content here.
        </p>

        <h4 style={{ marginTop: 20 }}>Try these paths:</h4>
        <ul>
          <li>
            <Link to='/docs/introduction' style={{ color: '#ca8a04' }}>
              /docs/introduction
            </Link>
          </li>
          <li>
            <Link to='/docs/api/routes' style={{ color: '#ca8a04' }}>
              /docs/api/routes
            </Link>
          </li>
          <li>
            <Link to='/docs/guides/layouts' style={{ color: '#ca8a04' }}>
              /docs/guides/layouts
            </Link>
          </li>
          <li>
            <Link
              to='/docs/deep/nested/path/example'
              style={{ color: '#ca8a04' }}
            >
              /docs/deep/nested/path/example
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
