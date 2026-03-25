import StudentSidebar from "./components/StudentSidebar";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display antialiased">
      <StudentSidebar />
      {children}
    </div>
  );
}
