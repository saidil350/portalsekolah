import StudentSidebar from "./components/StudentSidebar";
import { authorizeDashboard } from '@/lib/auth/authorization';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authorization check - only SISWA can access this dashboard
  const authResult = await authorizeDashboard('SISWA');

  if (!authResult) {
    // User is not authenticated or not authorized
    redirect('/unauthorized?role=SISWA');
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-display antialiased">
      <StudentSidebar />
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
