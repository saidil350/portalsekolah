import HeadmasterSidebar from "./components/HeadmasterSidebar";
import { getCurrentHeadmaster } from "./actions";

export default async function HeadmasterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch current headmaster data
  const headmaster = await getCurrentHeadmaster();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display antialiased">
      <HeadmasterSidebar headmaster={headmaster} />
      {children}
    </div>
  );
}
