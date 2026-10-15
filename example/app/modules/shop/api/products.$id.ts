import { api, reply } from 'auto-types-api';
import { z } from 'zod';
import { Product, ProductInput, products } from '../schemas';

const params = z.object({ id: z.coerce.number<string | number>().int() });

// GET /api/shop/products/:id
const GET = api.get({ params, response: Product }, ({ params }) => {
  return products.find((product) => product.id === params.id) ?? reply(404, { error: 'NotFound' });
});

// PATCH /api/shop/products/:id  { name?, price?, description? }
const PATCH = api.patch(
  { params, body: ProductInput.partial(), response: Product },
  ({ params, body }) => {
    const product = products.find((p) => p.id === params.id);
    if (!product) return reply(404, { error: 'NotFound' });
    return Object.assign(product, body);
  },
);

// DELETE /api/shop/products/:id
const DELETE = api.delete({ params }, ({ params }) => {
  const index = products.findIndex((product) => product.id === params.id);
  if (index === -1) return reply(404, { error: 'NotFound' });
  products.splice(index, 1);
  return reply(204);
});

export const loader = api.serve({ GET, PATCH, DELETE });
export const action = loader;
