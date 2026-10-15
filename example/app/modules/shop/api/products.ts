import { api } from 'auto-types-api';
import { z } from 'zod';
import { Product, ProductInput, products } from '../schemas';

// GET /api/shop/products?q=wid&limit=2
const GET = api.get(
  {
    query: z.object({
      q: z.string().optional(),
      limit: z.number().int().positive().optional(),
    }),
  },
  ({ query }) => {
    const term = query.q?.toLowerCase();
    const matches = term
      ? products.filter((product) => product.name.toLowerCase().includes(term))
      : products;
    return matches.slice(0, query.limit ?? matches.length);
  },
);

// POST /api/shop/products  { name, price, description? }
const POST = api.post({ body: ProductInput, response: Product }, ({ body }) => {
  const product = { id: Math.max(0, ...products.map((p) => p.id)) + 1, ...body };
  products.push(product);
  return product;
});

// One handler for every method. Endpoints stay unexported: React Router strips `loader` and
// `action` from the client bundle along with everything only they use (handlers, schemas).
export const loader = api.serve({ GET, POST });
export const action = loader;
