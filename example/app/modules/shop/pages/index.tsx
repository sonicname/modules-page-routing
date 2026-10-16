import { Link, useLoaderData } from 'react-router';
import { serverApi } from '~/lib/api.server';
import type { Route } from './+types/index';

// Server-side: calls the module's API in-process through the typed endpoint-kit client.
// In the browser, the same routes work with `createRepository({ baseUrl: '' })`.
export async function loader({ request, context }: Route.LoaderArgs) {
  return serverApi({ request, context }).getShopProducts.orThrow({ query: { limit: 10 } });
}

export default function ShopIndex() {
  // Product[], typed from modules/shop/api/products.ts
  const products = useLoaderData<typeof loader>();

  return (
    <div style={{ padding: 30 }}>
      <h1>Shop</h1>
      <p style={{ color: '#6b7280' }}>
        This module demonstrates module-scoped API routes, typed end to end with auto-types-api.
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
        <h3>Products</h3>
        <ul style={{ lineHeight: 2 }}>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} &mdash; ${product.price.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

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
            <code>modules/shop/api/products.ts</code> &rarr; <code>GET, POST /api/shop/products</code>
          </li>
          <li>
            <code>modules/shop/api/products.$id.ts</code> &rarr;{' '}
            <code>GET, PATCH, DELETE /api/shop/products/:id</code>
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
