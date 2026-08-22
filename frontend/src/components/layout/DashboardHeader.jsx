import {
  Search,
  Bell,
  UserRound,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

const DashboardHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();

  // Get logged-in user information
  const userName = localStorage.getItem("userName") || "Student";
  const userRole = localStorage.getItem("userRole") || "student";

  // Convert role into display format
  const displayRole =
    userRole.charAt(0).toUpperCase() + userRole.slice(1);

  /* ===================================================== */
  /* LOGOUT                                                */
  /* ===================================================== */

  const handleLogout = () => {
    // Remove current user session information
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    // Remove old temporary session data if it exists
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Close dropdown
    setShowProfileMenu(false);

    // Go to login page
    navigate("/login");
  };

  return (
    <header className="fixed left-[290px] right-0 top-0 z-40 flex h-[68px] items-center justify-between border-b border-gray-200 bg-white px-6">

      {/* ================================================= */}
      {/* SEARCH                                            */}
      {/* ================================================= */}

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

      {/* ================================================= */}
      {/* RIGHT SIDE                                        */}
      {/* ================================================= */}

      <div className="ml-6 flex items-center gap-3">

        {/* ================================================= */}
        {/* NOTIFICATION                                      */}
        {/* ================================================= */}

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white"
        >

          <Bell
            size={19}
            className="text-gray-500"
          />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />

        </button>

        {/* ================================================= */}
        {/* USER PROFILE                                      */}
        {/* ================================================= */}

        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setShowProfileMenu(
                (previous) => !previous
              )
            }
            className="flex h-10 items-center gap-3 rounded-xl border border-gray-200 bg-white px-2.5 transition hover:bg-gray-50"
          >

            {/* Profile Icon */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">

              <UserRound
                size={17}
                className="text-white"
              />

            </div>

            {/* User Name */}
            <div className="text-left leading-tight">

              <p className="text-sm font-medium text-gray-900">
                {userName}
              </p>

              <span className="text-[11px] text-gray-400">
                {displayRole}
              </span>

            </div>

          </button>

          {/* ================================================= */}
          {/* PROFILE DROPDOWN                                  */}
          {/* ================================================= */}

          {showProfileMenu && (

            <div className="absolute right-0 top-[48px] z-[100] w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

              {/* View Profile */}
              <Link
                to="/student/profile"
                onClick={() =>
                  setShowProfileMenu(false)
                }
                className="block px-5 py-4 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                View Profile
              </Link>

              {/* Settings */}
              <Link
                to="/student/settings"
                onClick={() =>
                  setShowProfileMenu(false)
                }
                className="block px-5 py-4 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Settings
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-5 py-4 text-left text-sm text-red-500 transition hover:bg-red-50"
              >
                Logout
              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
};

export default DashboardHeader;