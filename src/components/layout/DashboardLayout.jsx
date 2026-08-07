import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;