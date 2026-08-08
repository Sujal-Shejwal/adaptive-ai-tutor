import WelcomeSection from "../../components/sections/WelcomeSection";
import StatisticsCards from "../../components/sections/StatisticsCards";
import SubjectsSection from "../../components/sections/SubjectsSection";
import RecentActivity from "../../components/sections/RecentActivity";
import QuickActions from "../../components/sections/QuickActions";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-8 py-7 pt-[96px]">

      <WelcomeSection />

      <StatisticsCards />

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">

        {/* Left */}
        <div>
          <SubjectsSection />
        </div>

        {/* Right */}
        <div className="space-y-6">
          <RecentActivity />
          <QuickActions />
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;