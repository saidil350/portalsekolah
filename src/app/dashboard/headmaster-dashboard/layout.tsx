import HeadmasterSidebar from "./components/HeadmasterSidebar";
import { getCurrentHeadmaster } from "./actions";
import { authorizeDashboard } from '@/lib/auth/authorization';
import { redirect } from 'next/navigation';

export default async function HeadmasterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authorization check - only KEPALA_SEKOLAH can access this dashboard
  const authResult = await authorizeDashboard('KEPALA_SEKOLAH');

  if (!authResult) {
    // User is not authenticated or not authorized
    redirect('/unauthorized?role=KEPALA_SEKOLAH');
  }

  const { user } = authResult;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display antialiased">
      <HeadmasterSidebar headmaster={user} />
      {children}
    </div>
  );
}
