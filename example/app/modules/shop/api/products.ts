import type { LoaderFunctionArgs } from 'react-router';

export async function loader(_args: LoaderFunctionArgs) {
  const products = [
    { id: 1, name: 'Widget', price: 9.99 },
    { id: 2, name: 'Gadget', price: 24.99 },
    { id: 3, name: 'Gizmo', price: 14.99 },
  ];

  return Response.json(products);
}
