import AdminSidebar from './components/AdminSidebar';
import { getCurrentAdmin } from './actions';

export default async function AdminITLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch current admin data
  const admin = await getCurrentAdmin();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display antialiased">
      <AdminSidebar admin={admin} />
      {children}
    </div>
  );
}
