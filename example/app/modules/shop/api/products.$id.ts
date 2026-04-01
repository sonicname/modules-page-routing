import type { LoaderFunctionArgs } from 'react-router';

export async function loader({ params }: LoaderFunctionArgs) {
  const product = {
    id: params.id,
    name: 'Widget',
    price: 9.99,
    description: `Product detail for ID: ${params.id}`,
  };

  return Response.json(product);
}
