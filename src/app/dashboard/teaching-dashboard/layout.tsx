import TeachingSidebar from "./components/TeachingSidebar";
import { getCurrentTeacher } from "./actions";

export default async function TeachingDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch current teacher data
  const teacher = await getCurrentTeacher();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display antialiased">
      <TeachingSidebar teacher={teacher} />
      {children}
    </div>
  );
}
