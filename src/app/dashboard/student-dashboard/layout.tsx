import StudentSidebar from "./components/StudentSidebar";
import { authorizeDashboard } from '@/lib/auth/authorization';
import { redirect } from 'next/navigation';

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
    <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display antialiased">
      <StudentSidebar />
      {children}
    </div>
  );
}
