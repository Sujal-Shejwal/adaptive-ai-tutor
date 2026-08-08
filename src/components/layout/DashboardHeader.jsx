import { Search, Bell, UserRound } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="fixed left-[290px] right-0 top-0 z-40 flex h-[68px] items-center justify-between border-b border-gray-200 bg-white px-6">

      {/* Search */}
      <div className="w-full max-w-[478px]">
        <div className="flex h-10 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3">
          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Search subjects, topics, notes..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="ml-6 flex items-center gap-3">

        {/* Notification */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <Bell
            size={19}
            className="text-gray-500"
          />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* User profile */}
        <div className="flex h-10 items-center gap-3 rounded-xl border border-gray-200 bg-white px-2.5">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <UserRound
              size={17}
              className="text-white"
            />
          </div>

          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-900">
              Sujal Shejwal
            </p>

            <span className="text-[11px] text-gray-400">
              Student
            </span>
          </div>

        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;