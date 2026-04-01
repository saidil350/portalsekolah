import TeachingSidebar from "./components/TeachingSidebar";
import { getCurrentTeacher } from "./actions";
import { authorizeDashboard } from '@/lib/auth/authorization';
import { redirect } from 'next/navigation';

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
    <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display antialiased">
      <TeachingSidebar teacher={user} />
      {children}
    </div>
  );
}
