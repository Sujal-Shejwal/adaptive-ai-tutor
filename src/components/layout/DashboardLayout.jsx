import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";


function DashboardLayout({ children }) {

    return (
        <div className="min-h-screen bg-slate-50">

            <Sidebar />

            <div className="ml-[290px]">

                <DashboardHeader />

                <main>
                    {children}
                </main>

            </div>

        </div>
    );
}


export default DashboardLayout;