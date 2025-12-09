import { Link } from 'react-router';

export default function UsersListPage() {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com' },
  ];

  return (
    <div>
      <h1>👥 Users Management</h1>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h3>📝 Example: Nested Index Route</h3>
        <code>modules/admin/pages/users/index.tsx</code>
        <p style={{ marginTop: 10, color: '#6b7280' }}>
          This file creates the route: <strong>/admin/users</strong>
        </p>
      </div>

      <table
        style={{
          width: '100%',
          marginTop: 20,
          backgroundColor: 'white',
          borderCollapse: 'collapse',
          borderRadius: 8,
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
              ID
            </th>
            <th
              style={{
                padding: 12,
                textAlign: 'left',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              Name
            </th>
            <th
              style={{
                padding: 12,
                textAlign: 'left',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              Email
            </th>
            <th
              style={{
                padding: 12,
                textAlign: 'left',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {mockUsers.map((user) => (
            <tr key={user.id}>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                {user.id}
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                {user.name}
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                {user.email}
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                <Link
                  to={`/admin/users/${user.id}`}
                  style={{ color: '#3b82f6' }}
                >
                  View Details →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
