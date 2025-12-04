import { Outlet } from 'react-router';

export default function RootLayout() {
  return (
    <div className='root-layout'>
      <Outlet />
    </div>
  );
}
