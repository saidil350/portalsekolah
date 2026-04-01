import AdminSidebar from './components/AdminSidebar';
import { getCurrentAdmin } from './actions';
import { authorizeDashboard } from '@/lib/auth/authorization';
import { redirect } from 'next/navigation';

export default async function AdminITLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authorization check - only ADMIN_IT can access this dashboard
  const authResult = await authorizeDashboard('ADMIN_IT');

  if (!authResult) {
    // User is not authenticated or not authorized
    redirect('/unauthorized?role=ADMIN_IT');
  }

  const { user } = authResult;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display antialiased">
      <AdminSidebar admin={user as any} />
      {children}
    </div>
  );
}
