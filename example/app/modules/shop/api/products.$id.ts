import { api, reply } from 'auto-types-api';
import { z } from 'zod';
import { Problem, Product, ProductInput, products } from '../schemas';

const params = z.object({ id: z.coerce.number<string | number>().int() });
const notFound = (id: number) => ({ message: `No product with id ${id}` });

// GET /api/shop/products/:id
const GET = api.get(
  { params, response: Product, errors: { 404: Problem } },
  ({ params, error }) =>
    products.find((product) => product.id === params.id) ?? error(404, notFound(params.id)),
);

// PATCH /api/shop/products/:id  { name?, price?, description? }
const PATCH = api.patch(
  { params, body: ProductInput.partial(), response: Product, errors: { 404: Problem } },
  ({ params, body, error }) => {
    const product = products.find((p) => p.id === params.id);
    if (!product) return error(404, notFound(params.id));
    return Object.assign(product, body);
  },
);

// Only admins may delete. A real app would read a session cookie here.
const admin = api.use(({ request }) => {
  if (request.headers.get('x-role') !== 'admin') return reply(403, { message: 'Admins only' });
  return { role: 'admin' as const };
});

// DELETE /api/shop/products/:id
const DELETE = admin.delete(
  { params, errors: { 404: Problem } },
  ({ params, error }) => {
    const index = products.findIndex((product) => product.id === params.id);
    if (index === -1) return error(404, notFound(params.id));
    products.splice(index, 1);
    return reply(204);
  },
);

export const loader = api.serve({ GET, PATCH, DELETE });
export const action = loader;
