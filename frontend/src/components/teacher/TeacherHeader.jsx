import {
  Search,
  Bell,
  UserRound,
  ChevronDown,
  Settings,
  LogOut,
  Check,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherHeader() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [profileOpen, setProfileOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  // =====================================================
  // LOGGED-IN TEACHER
  // =====================================================

  const userId =
    localStorage.getItem("userId");

  const userName =
    localStorage.getItem("userName") ||
    "Teacher";

  const userRole =
    localStorage.getItem("userRole") ||
    "teacher";

  // Convert role into display format
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
        throw new Error(
          "Failed to load notifications"
        );
      }

      const data =
        await response.json();

      setNotifications(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Error loading notifications:",
        error
      );

    }
  };

  // =====================================================
  // LOAD UNREAD COUNT
  // =====================================================

  const loadUnreadCount = async () => {

    if (!userId) {
      return;
    }

    try {

      const response =
        await fetch(
          `http://localhost:8080/api/notifications/user/${userId}/unread-count`
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load unread count"
        );
      }

      const count =
        await response.json();

      setUnreadCount(
        Number(count) || 0
      );

    } catch (error) {

      console.error(
        "Error loading unread notification count:",
        error
      );

    }
  };

  // =====================================================
  // LOAD NOTIFICATIONS ON PAGE LOAD
  // =====================================================

  useEffect(() => {

    loadNotifications();
    loadUnreadCount();

    // Refresh notification count periodically
    const interval =
      setInterval(() => {

        loadUnreadCount();

      }, 30000);

    return () => {
      clearInterval(interval);
    };

  }, [userId]);

  // =====================================================
  // OPEN NOTIFICATION PANEL
  // =====================================================

  const handleNotificationClick = async () => {

    setProfileOpen(false);

    setNotificationOpen(
      (previous) => !previous
    );

    // Refresh notifications whenever
    // teacher opens the notification panel
    await loadNotifications();
    await loadUnreadCount();
  };

  // =====================================================
  // MARK ONE NOTIFICATION AS READ
  // =====================================================

  const handleMarkAsRead = async (
    notificationId
  ) => {

    try {

      const response =
        await fetch(
          `http://localhost:8080/api/notifications/${notificationId}/read`,
          {
            method: "POST",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to mark notification as read"
        );
      }

      // Update notification locally
      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    read: true,
                  }
                : notification
          )
      );

      // Update unread count
      setUnreadCount(
        (previous) =>
          Math.max(
            0,
            previous - 1
          )
      );

    } catch (error) {

      console.error(
        "Error marking notification as read:",
        error
      );

    }
  };

  // =====================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =====================================================

  const handleMarkAllAsRead = async () => {

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
        throw new Error(
          "Failed to mark all notifications as read"
        );
      }

      // Update local notifications
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
        "Error marking all notifications as read:",
        error
      );

    }
  };

  // =====================================================
  // FORMAT NOTIFICATION TIME
  // =====================================================

  const formatNotificationTime = (
    createdAt
  ) => {

    if (!createdAt) {
      return "";
    }

    const date =
      new Date(createdAt);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    // Clear authentication information
    localStorage.removeItem(
      "userRole"
    );

    localStorage.removeItem(
      "userId"
    );

    localStorage.removeItem(
      "userName"
    );

    localStorage.removeItem(
      "userEmail"
    );

    // Remove old temporary session data
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    // Close menus
    setProfileOpen(false);
    setNotificationOpen(false);

    // Redirect to login
    navigate("/login");
  };

  return (

    <header className="sticky top-0 z-30 flex h-[65px] items-center justify-between border-b border-gray-200 bg-white px-6">

      {/* ================================================= */}
      {/* SEARCH                                            */}
      {/* ================================================= */}

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

      {/* ================================================= */}
      {/* RIGHT SIDE                                        */}
      {/* ================================================= */}

      <div className="flex items-center gap-3">

        {/* ================================================= */}
        {/* NOTIFICATION                                      */}
        {/* ================================================= */}

        <div className="relative">

          <button
            type="button"
            onClick={
              handleNotificationClick
            }
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          >

            <Bell
              className="h-[17px] w-[17px]"
              strokeWidth={1.8}
            />

            {/* Unread badge */}
            {unreadCount > 0 && (

              <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">

                {unreadCount > 9
                  ? "9+"
                  : unreadCount}

              </span>

            )}

          </button>

          {/* ================================================= */}
          {/* NOTIFICATION DROPDOWN                             */}
          {/* ================================================= */}

          {notificationOpen && (

            <div className="absolute right-0 top-[46px] z-[100] w-[380px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                <div>

                  <h3 className="text-[15px] font-semibold text-gray-900">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-[11px] text-gray-400">

                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "All caught up"}

                  </p>

                </div>

                {unreadCount > 0 && (

                  <button
                    type="button"
                    onClick={
                      handleMarkAllAsRead
                    }
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>

                )}

              </div>

              {/* Notification list */}

              <div className="max-h-[420px] overflow-y-auto">

                {notifications.length === 0 ? (

                  <div className="px-5 py-10 text-center">

                    <Bell
                      className="mx-auto mb-3 h-8 w-8 text-gray-300"
                    />

                    <p className="text-sm font-medium text-gray-600">
                      No notifications
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      You're all caught up.
                    </p>

                  </div>

                ) : (

                  notifications.map(
                    (notification) => (

                      <div
                        key={
                          notification.id
                        }
                        className={`border-b border-gray-100 px-4 py-4 last:border-b-0 ${
                          !notification.read
                            ? "bg-blue-50/40"
                            : "bg-white"
                        }`}
                      >

                        <div className="flex gap-3">

                          {/* Notification icon */}

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                            <Bell
                              className="h-4 w-4 text-blue-600"
                              strokeWidth={1.8}
                            />

                          </div>

                          {/* Content */}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-2">

                              <p className="text-[13px] font-semibold text-gray-800">

                                {
                                  notification.title
                                }

                              </p>

                              {!notification.read && (

                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />

                              )}

                            </div>

                            <p className="mt-1 text-[12px] leading-5 text-gray-500">

                              {
                                notification.message
                              }

                            </p>

                            <div className="mt-2 flex items-center justify-between">

                              <span className="text-[10px] text-gray-400">

                                {formatNotificationTime(
                                  notification.createdAt
                                )}

                              </span>

                              {!notification.read && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMarkAsRead(
                                      notification.id
                                    )
                                  }
                                  className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700"
                                >

                                  <Check
                                    className="h-3 w-3"
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
        {/* PROFILE                                           */}
        {/* ================================================= */}

        <div className="relative">

          <button
            type="button"
            onClick={() => {

              setNotificationOpen(false);

              setProfileOpen(
                (value) => !value
              );

            }}
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
                {userName}
              </p>

              <p className="text-[10px] leading-[12px] text-gray-500">
                {displayRole}
              </p>

            </div>

            <ChevronDown
              className="ml-1 h-[14px] w-[14px] text-gray-400"
              strokeWidth={1.8}
            />

          </button>

          {/* ================================================= */}
          {/* PROFILE DROPDOWN                                  */}
          {/* ================================================= */}

          {profileOpen && (

            <div className="absolute right-0 top-[46px] w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">

              {/* View Profile */}

              <button
                type="button"
                onClick={() => {

                  setProfileOpen(false);

                  navigate(
                    "/teacher/profile"
                  );

                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
              >

                <UserRound className="h-4 w-4" />

                View Profile

              </button>

              {/* Settings */}

              <button
                type="button"
                onClick={() => {

                  setProfileOpen(false);

                  navigate(
                    "/teacher/settings"
                  );

                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
              >

                <Settings className="h-4 w-4" />

                Settings

              </button>

              <div className="my-1 border-t border-gray-100" />

              {/* Logout */}

              <button
                type="button"
                onClick={
                  handleLogout
                }
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