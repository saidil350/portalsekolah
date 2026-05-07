import TeachingSidebar from "./components/TeachingSidebar";
import { getCurrentTeacher } from "./actions";
import { authorizeDashboard } from '@/lib/auth/authorization';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function TeachingDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authorization check - only GURU can access this dashboard
  const authResult = await authorizeDashboard('GURU');

  if (!authResult) {
    // User is not authenticated or not authorized
    redirect('/unauthorized?role=GURU');
  }

  const { user } = authResult;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-display antialiased">
      <TeachingSidebar teacher={user as any} />
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
