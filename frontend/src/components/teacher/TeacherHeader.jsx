import {
  Search,
  Bell,
  UserRound,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { teacherProfile } from "../../data/teacher";

export default function TeacherHeader() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[65px] items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Search */}
      <div className="relative w-[450px]">
        <Search
          className="absolute left-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-gray-400"
          strokeWidth={1.8}
        />

        <input
          type="text"
          placeholder="Search subjects, topics, notes..."
          className="h-[38px] w-full rounded-xl border border-gray-200 bg-[#f8fafc] pl-10 pr-4 text-[13px] text-gray-700 outline-none placeholder:text-[#94a3b8] focus:border-blue-300 focus:bg-white"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          type="button"
          className="relative flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
        >
          <Bell
            className="h-[17px] w-[17px]"
            strokeWidth={1.8}
          />

          <span className="absolute right-[7px] top-[6px] h-[7px] w-[7px] rounded-full bg-red-500" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((value) => !value)}
            className="flex h-[38px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 hover:bg-gray-50"
          >
            <div className="flex h-[28px] w-[28px] items-center justify-center rounded-lg bg-blue-600">
              <UserRound
                className="h-[15px] w-[15px] text-white"
                strokeWidth={1.8}
              />
            </div>

            <div className="text-left">
              <p className="text-[12px] font-semibold leading-[14px] text-[#17233c]">
                {teacherProfile.name}
              </p>

              <p className="text-[10px] leading-[12px] text-gray-500">
                Teacher
              </p>
            </div>

            <ChevronDown
              className="ml-1 h-[14px] w-[14px] text-gray-400"
              strokeWidth={1.8}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[46px] w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
              <button
                type="button"
                onClick={() => navigate("/teacher/profile")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                <UserRound className="h-4 w-4" />
                View Profile
              </button>

              <button
                type="button"
                onClick={() => navigate("/teacher/settings")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}