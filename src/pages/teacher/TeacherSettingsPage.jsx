import {
  Bell,
  Settings as SettingsIcon,
  Info,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

import { useState } from "react";

const subjects = [
  "DBMS",
  "Operating System",
  "Computer Networks",
  "Java",
];

function Toggle({ enabled, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Toggle ${label}`}
      aria-pressed={enabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        enabled ? "bg-blue-600" : "bg-[#e2e8f0]"
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function NotificationRow({
  title,
  description,
  enabled,
  onToggle,
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-[7px]">
      <div className="min-w-0">
        <h3 className="text-[14px] font-medium leading-5 text-[#17233c]">
          {title}
        </h3>

        <p className="mt-[2px] text-[12px] leading-[17px] text-[#94a3b8]">
          {description}
        </p>
      </div>

      <Toggle
        enabled={enabled}
        onToggle={onToggle}
        label={title}
      />
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  enabled,
  onToggle,
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-[7px]">
      <div className="min-w-0">
        <h3 className="text-[14px] font-medium leading-5 text-[#17233c]">
          {title}
        </h3>

        <p className="mt-[2px] text-[12px] leading-[17px] text-[#94a3b8]">
          {description}
        </p>
      </div>

      <Toggle
        enabled={enabled}
        onToggle={onToggle}
        label={title}
      />
    </div>
  );
}

export default function TeacherSettingsPage() {
  const [notifications, setNotifications] = useState({
    studentActivity: true,
    studentQuestions: true,
    newContent: true,
    weeklyReports: false,
    quizNotifications: true,
  });

  const [teachingPreferences, setTeachingPreferences] = useState({
    uploadNotifications: true,
    quizNotifications: true,
    studentActivity: true,
  });

  const [defaultSubject, setDefaultSubject] = useState("DBMS");

  const toggleNotification = (key) => {
    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const toggleTeachingPreference = (key) => {
    setTeachingPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f8fafc] px-6 py-7">

      {/* IMPORTANT:
          Figma uses a narrow centered content area.
      */}
      <div className="mx-auto w-full max-w-[672px]">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="mb-6">
          <h1 className="text-[25px] font-bold leading-[30px] tracking-tight text-[#17233c]">
            Settings
          </h1>

          <p className="mt-[4px] text-[14px] leading-5 text-[#64748b]">
            Customize your teacher experience.
          </p>
        </div>

        {/* ========================= */}
        {/* NOTIFICATIONS */}
        {/* ========================= */}

        <section className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-5">

          <div className="flex items-center gap-3">
            <Bell
              className="h-[19px] w-[19px] text-[#64748b]"
              strokeWidth={1.8}
            />

            <h2 className="text-[16px] font-bold text-[#17233c]">
              Notifications
            </h2>
          </div>

          <div className="mt-4">

            <NotificationRow
              title="Student Activity Alerts"
              description="Get notified about important student activity"
              enabled={notifications.studentActivity}
              onToggle={() =>
                toggleNotification("studentActivity")
              }
            />

            <NotificationRow
              title="New Student Questions"
              description="When students ask questions or need help"
              enabled={notifications.studentQuestions}
              onToggle={() =>
                toggleNotification("studentQuestions")
              }
            />

            <NotificationRow
              title="New Content Alerts"
              description="Notifications when new course content is added"
              enabled={notifications.newContent}
              onToggle={() =>
                toggleNotification("newContent")
              }
            />

            <NotificationRow
              title="Weekly Student Reports"
              description="Summary of student learning activity every week"
              enabled={notifications.weeklyReports}
              onToggle={() =>
                toggleNotification("weeklyReports")
              }
            />

            <NotificationRow
              title="Quiz Notifications"
              description="Receive notifications about quiz activity"
              enabled={notifications.quizNotifications}
              onToggle={() =>
                toggleNotification("quizNotifications")
              }
            />

          </div>
        </section>

        {/* ========================= */}
        {/* TEACHING PREFERENCES */}
        {/* ========================= */}

        <section className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white px-6 py-5">

          <div className="flex items-center gap-3">
            <SettingsIcon
              className="h-[19px] w-[19px] text-[#64748b]"
              strokeWidth={1.8}
            />

            <h2 className="text-[16px] font-bold text-[#17233c]">
              Teaching Preferences
            </h2>
          </div>

          {/* Default Subject */}

          <div className="mt-5">

            <label className="mb-2 block text-[13px] font-medium text-[#334155]">
              Default Subject
            </label>

            <div className="relative">

              <select
                value={defaultSubject}
                onChange={(event) =>
                  setDefaultSubject(event.target.value)
                }
                className="h-[44px] w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] text-[#475569] outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              >
                {subjects.map((subject) => (
                  <option
                    key={subject}
                    value={subject}
                  >
                    {subject}
                  </option>
                ))}
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]"
              />

            </div>

            
          </div>

          {/* Divider */}

          <div className="mt-4 border-t border-[#f1f5f9] pt-3">

            <PreferenceRow
              title="Upload Notifications"
              description="Notify students when new notes are uploaded."
              enabled={
                teachingPreferences.uploadNotifications
              }
              onToggle={() =>
                toggleTeachingPreference(
                  "uploadNotifications"
                )
              }
            />

            <PreferenceRow
              title="Quiz Notifications"
              description="Receive updates about student quiz activity."
              enabled={
                teachingPreferences.quizNotifications
              }
              onToggle={() =>
                toggleTeachingPreference(
                  "quizNotifications"
                )
              }
            />

            <PreferenceRow
              title="Student Activity"
              description="Receive important updates about student progress."
              enabled={
                teachingPreferences.studentActivity
              }
              onToggle={() =>
                toggleTeachingPreference(
                  "studentActivity"
                )
              }
            />

          </div>
        </section>

        {/* ========================= */}
        {/* ACCOUNT SETTINGS */}
        {/* ========================= */}

        <section className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white px-6 py-5">

          <h2 className="text-[16px] font-bold text-[#17233c]">
            Account Settings
          </h2>

          <div className="mt-3 divide-y divide-[#f1f5f9]">

            <div className="flex min-h-[48px] items-center justify-between">
              <span className="text-[13px] font-medium text-[#334155]">
                Language
              </span>

              <span className="text-[13px] text-[#64748b]">
                English (India)
              </span>
            </div>

            <div className="flex min-h-[48px] items-center justify-between">
              <span className="text-[13px] font-medium text-[#334155]">
                Time Zone
              </span>

              <span className="text-[13px] text-[#64748b]">
                Asia/Kolkata (IST UTC+5:30)
              </span>
            </div>

            <div className="flex min-h-[48px] items-center justify-between">
              <span className="text-[13px] font-medium text-[#334155]">
                Academic Year
              </span>

              <span className="text-[13px] text-[#64748b]">
                2024–2025
              </span>
            </div>

          </div>
        </section>

        {/* ========================= */}
        {/* ABOUT */}
        {/* ========================= */}

        <section className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white px-6 py-5">

          <div className="flex items-center gap-3">

            <Info
              className="h-[19px] w-[19px] text-[#64748b]"
              strokeWidth={1.8}
            />

            <h2 className="text-[16px] font-bold text-[#17233c]">
              About
            </h2>

          </div>

          <div className="mt-4 flex items-center gap-4">

            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-blue-600">

              <GraduationCap
                className="h-[23px] w-[23px] text-white"
                strokeWidth={1.8}
              />

            </div>

            <div>

              <h3 className="text-[15px] font-bold text-[#17233c]">
                Adaptive AI Tutor
              </h3>

              <p className="mt-1 text-[12px] text-[#94a3b8]">
                Version 1.0.0 · Final Year Engineering Project
              </p>

              <p className="mt-1 text-[12px] text-[#94a3b8]">
                AI-powered learning platform for IT & CS students
              </p>

            </div>

          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 border-t border-[#f1f5f9] pt-3">

            <p className="text-[12px] text-[#64748b]">
              <span className="font-medium text-[#334155]">
                Stack:
              </span>{" "}
              React + Vite + Tailwind CSS
            </p>

            <p className="text-[12px] text-[#64748b]">
              <span className="font-medium text-[#334155]">
                AI Model:
              </span>{" "}
              RAG + LLM Integration
            </p>

            <p className="text-[12px] text-[#64748b]">
              <span className="font-medium text-[#334155]">
                Backend:
              </span>{" "}
              FastAPI + Python
            </p>

            <p className="text-[12px] text-[#64748b]">
              <span className="font-medium text-[#334155]">
                Database:
              </span>{" "}
              PostgreSQL + Pinecone
            </p>

          </div>
        </section>

        <div className="h-6" />

      </div>
    </div>
  );
}