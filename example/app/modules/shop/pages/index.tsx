import { Link } from 'react-router';

export default function ShopIndex() {
  return (
    <div style={{ padding: 30 }}>
      <h1>Shop</h1>
      <p style={{ color: '#6b7280' }}>
        This module demonstrates module-scoped API routes.
      </p>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h3>Module-scoped API Routes</h3>
        <ul style={{ lineHeight: 2 }}>
          <li>
            <code>modules/shop/api/products.ts</code> &rarr;{' '}
            <code>/api/shop/products</code>
          </li>
          <li>
            <code>modules/shop/api/products.$id.ts</code> &rarr;{' '}
            <code>/api/shop/products/:id</code>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link to="/" style={{ color: '#3b82f6' }}>
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
