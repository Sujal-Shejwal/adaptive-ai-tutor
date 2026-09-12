import {
  Search,
  Bell,
  UserRound,
  Check,
  CheckCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

const DashboardHeader = () => {

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const navigate = useNavigate();

  // =====================================================
  // LOGGED-IN USER
  // =====================================================

  const userId =
    localStorage.getItem("userId");

  const userName =
    localStorage.getItem("userName") ||
    "Student";

  const userRole =
    localStorage.getItem("userRole") ||
    "student";

  const displayRole =
    userRole.charAt(0).toUpperCase() +
    userRole.slice(1);

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = async () => {

    if (!userId) {
      return;
    }

    try {

      const response =
        await fetch(
          `http://localhost:8080/api/notifications/user/${userId}`
        );

      if (!response.ok) {
        return;
      }

      const data =
        await response.json();

      setNotifications(
        Array.isArray(data)
          ? data
          : []
      );

      const unread =
        Array.isArray(data)
          ? data.filter(
              (notification) =>
                !notification.read
            ).length
          : 0;

      setUnreadCount(unread);

    } catch (error) {

      console.error(
        "Failed to load notifications:",
        error
      );
    }
  };

  // =====================================================
  // LOAD NOTIFICATIONS ON PAGE LOAD
  // =====================================================

  useEffect(() => {

    loadNotifications();

  }, [userId]);

  // =====================================================
  // OPEN / CLOSE NOTIFICATION PANEL
  // =====================================================

  const handleNotificationClick = () => {

    setShowNotifications(
      (previous) => !previous
    );

    setShowProfileMenu(false);

    loadNotifications();
  };

  // =====================================================
  // MARK ONE NOTIFICATION AS READ
  // =====================================================

  const markNotificationAsRead =
    async (notificationId) => {

      try {

        const response =
          await fetch(
            `http://localhost:8080/api/notifications/${notificationId}/read`,
            {
              method: "POST",
            }
          );

        if (!response.ok) {
          return;
        }

        setNotifications(
          (previous) =>
            previous.map(
              (notification) =>
                notification.id === notificationId
                  ? {
                      ...notification,
                      read: true,
                    }
                  : notification
            )
        );

        setUnreadCount(
          (previous) =>
            Math.max(0, previous - 1)
        );

      } catch (error) {

        console.error(
          "Failed to mark notification as read:",
          error
        );
      }
    };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {

    if (!userId) {
      return;
    }

    try {

      const response =
        await fetch(
          `http://localhost:8080/api/notifications/user/${userId}/read-all`,
          {
            method: "POST",
          }
        );

      if (!response.ok) {
        return;
      }

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              read: true,
            })
          )
      );

      setUnreadCount(0);

    } catch (error) {

      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setShowProfileMenu(false);
    setShowNotifications(false);

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
        {/* NOTIFICATIONS                                     */}
        {/* ================================================= */}

        <div className="relative">

          <button
            type="button"
            onClick={
              handleNotificationClick
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-50"
          >

            <Bell
              size={19}
              className="text-gray-500"
            />

            {/* Unread indicator */}

            {unreadCount > 0 && (

              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">

                {unreadCount > 9
                  ? "9+"
                  : unreadCount}

              </span>

            )}

          </button>

          {/* ================================================= */}
          {/* NOTIFICATION DROPDOWN                             */}
          {/* ================================================= */}

          {showNotifications && (

            <div className="absolute right-0 top-[48px] z-[100] w-[380px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                <div>

                  <h3 className="text-sm font-semibold text-gray-900">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-400">

                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "You're all caught up"}

                  </p>

                </div>

                {unreadCount > 0 && (

                  <button
                    type="button"
                    onClick={
                      markAllAsRead
                    }
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >

                    <CheckCheck
                      size={14}
                    />

                    Mark all read

                  </button>

                )}

              </div>

              {/* Notification List */}

              <div className="max-h-[420px] overflow-y-auto">

                {notifications.length === 0 ? (

                  <div className="px-5 py-10 text-center">

                    <Bell
                      size={30}
                      className="mx-auto mb-3 text-gray-300"
                    />

                    <p className="text-sm font-medium text-gray-600">
                      No notifications
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      New classroom activities will appear here.
                    </p>

                  </div>

                ) : (

                  notifications.map(
                    (notification) => (

                      <div
                        key={
                          notification.id
                        }
                        className={`border-b border-gray-100 px-5 py-4 transition hover:bg-gray-50 ${
                          !notification.read
                            ? "bg-blue-50/40"
                            : ""
                        }`}
                      >

                        <div className="flex gap-3">

                          {/* Notification Icon */}

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">

                            <Bell
                              size={16}
                              className="text-blue-600"
                            />

                          </div>

                          {/* Content */}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-2">

                              <p className="text-sm font-semibold text-gray-900">

                                {
                                  notification.title
                                }

                              </p>

                              {!notification.read && (

                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />

                              )}

                            </div>

                            <p className="mt-1 text-xs leading-5 text-gray-500">

                              {
                                notification.message
                              }

                            </p>

                            <div className="mt-2 flex items-center justify-between">

                              <span className="text-[10px] text-gray-400">

                                {
                                  notification.createdAt
                                    ? new Date(
                                        notification.createdAt
                                      ).toLocaleString(
                                        "en-IN",
                                        {
                                          day: "2-digit",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )
                                    : ""
                                }

                              </span>

                              {!notification.read && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    markNotificationAsRead(
                                      notification.id
                                    )
                                  }
                                  className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700"
                                >

                                  <Check
                                    size={13}
                                  />

                                  Mark read

                                </button>

                              )}

                            </div>

                          </div>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          )}

        </div>

        {/* ================================================= */}
        {/* USER PROFILE                                      */}
        {/* ================================================= */}

        <div className="relative">

          <button
            type="button"
            onClick={() => {

              setShowProfileMenu(
                (previous) => !previous
              );

              setShowNotifications(false);

            }}
            className="flex h-10 items-center gap-3 rounded-xl border border-gray-200 bg-white px-2.5 transition hover:bg-gray-50"
          >

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">

              <UserRound
                size={17}
                className="text-white"
              />

            </div>

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

              <Link
                to={
                  userRole.toLowerCase() ===
                  "teacher"
                    ? "/teacher/profile"
                    : "/student/profile"
                }
                onClick={() =>
                  setShowProfileMenu(false)
                }
                className="block px-5 py-4 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                View Profile
              </Link>

              <Link
                to={
                  userRole.toLowerCase() ===
                  "teacher"
                    ? "/teacher/settings"
                    : "/student/settings"
                }
                onClick={() =>
                  setShowProfileMenu(false)
                }
                className="block px-5 py-4 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Settings
              </Link>

              <div className="border-t border-gray-200" />

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