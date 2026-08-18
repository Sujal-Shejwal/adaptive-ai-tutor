import {
  LayoutDashboard,
  FileUp,
  User,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/teacher/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Upload Notes",
    path: "/teacher/upload-notes",
    icon: FileUp,
  },
  {
    label: "Profile",
    path: "/teacher/profile",
    icon: User,
  },
  {
    label: "Settings",
    path: "/teacher/settings",
    icon: Settings,
  },
];

export default function TeacherSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="flex h-[80px] shrink-0 items-center border-b border-gray-200 px-5">
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-3 text-left"
          aria-label="Go to Adaptive AI home"
        >
          {/* Logo */}
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-blue-600">
            <GraduationCap
              className="h-[17px] w-[17px] text-white"
              strokeWidth={1.8}
            />
          </div>

          {/* Brand Text */}
          <div>
            <h1 className="text-[15px] font-bold leading-[18px] text-[#17233c]">
              Adaptive AI
            </h1>

            <p className="mt-[2px] text-[11px] leading-[14px] text-gray-500">
              Tutor Platform
            </p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-[18px]">
        <p className="mb-3 px-2 text-[10px] font-medium uppercase tracking-[0.04em] text-gray-400">
          Teacher Menu
        </p>

        <div className="space-y-[3px]">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex h-[40px] items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#dbeafe] text-[#2563eb]"
                      : "text-[#475569] hover:bg-gray-50 hover:text-[#17233c]"
                  }`
                }
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.8}
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-gray-200">
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-[72px] w-full items-center gap-3 px-6 text-[14px] font-medium text-red-500 transition hover:bg-red-50"
        >
          <LogOut
            className="h-[18px] w-[18px]"
            strokeWidth={1.8}
          />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}