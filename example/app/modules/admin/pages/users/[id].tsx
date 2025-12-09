import { Link, useParams } from 'react-router';

export default function UserDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <Link
        to='/admin/users'
        style={{ color: '#3b82f6', marginBottom: 20, display: 'inline-block' }}
      >
        ← Back to Users
      </Link>

      <h1>👤 User Detail: #{id}</h1>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h3>📝 Example: Dynamic Route [id]</h3>
        <code>modules/admin/pages/users/[id].tsx</code>
        <p style={{ marginTop: 10, color: '#6b7280' }}>
          This file creates the route: <strong>/admin/users/:id</strong>
        </p>
        <p style={{ marginTop: 10 }}>
          Current ID from URL params:{' '}
          <strong style={{ color: '#3b82f6' }}>{id}</strong>
        </p>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 8,
        }}
      >
        <h3>User Information</h3>
        <p>
          <strong>ID:</strong> {id}
        </p>
        <p>
          <strong>Name:</strong> User {id}
        </p>
        <p>
          <strong>Email:</strong> user{id}@example.com
        </p>
        <p>
          <strong>Status:</strong> Active
        </p>
      </div>
    </div>
  );
}
