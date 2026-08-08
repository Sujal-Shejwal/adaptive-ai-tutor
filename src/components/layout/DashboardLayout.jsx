import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="ml-[290px]">

        {/* Fixed Header */}
        <DashboardHeader />

        {/* Dashboard Content */}
        <main>
          {children}
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;