import { z } from 'zod';

// Shared by the API files and the pages. Lives outside `api/` because every `.ts` file there
// becomes an API route.

export const Product = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string().optional(),
});
export type Product = z.infer<typeof Product>;

export const ProductInput = Product.omit({ id: true });

// In-memory store for the example.
export const products: Product[] = [
  { id: 1, name: 'Widget', price: 9.99, description: 'A small widget' },
  { id: 2, name: 'Gadget', price: 24.99 },
  { id: 3, name: 'Gizmo', price: 14.99 },
];
