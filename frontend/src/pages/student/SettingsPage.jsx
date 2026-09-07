import {
    Bell,
    Check,
    ChevronDown,
    Info,
    Languages,
    LockKeyhole,
    Save,
    ShieldCheck,
    Sparkles,
    Clock3,
    LogOut,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";


function SettingsPage() {

    const navigate = useNavigate();

    // =====================================================
    // DEFAULT SETTINGS
    // =====================================================

    const defaultNotifications = {
        quizReminders: true,
        newContentAlerts: true,
        teacherAnnouncements: true,
        weeklyProgressReports: false,
    };

    const defaultLearningPreferences = {
        answerStyle: "Detailed",
        studyReminder: true,
        recommendations: true,
    };

    const defaultAccountSettings = {
        language: "English (India)",
        timeZone: "Asia/Kolkata (IST UTC+5:30)",
        academicYear: "2026–2027",
    };

    const defaultPrivacySettings = {
        saveChatHistory: true,
        personalizedData: true,
    };


    // =====================================================
    // STATE
    // =====================================================

    const [notifications, setNotifications] = useState(
        defaultNotifications
    );

    const [learningPreferences, setLearningPreferences] = useState(
        defaultLearningPreferences
    );

    const [accountSettings, setAccountSettings] = useState(
        defaultAccountSettings
    );

    const [privacySettings, setPrivacySettings] = useState(
        defaultPrivacySettings
    );

    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    // =====================================================
    // GET CURRENT USER ID
    // =====================================================

    const getUserId = () => {

        const directUserId = localStorage.getItem("userId");

        if (directUserId) {
            return directUserId;
        }

        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);

                return user?.id || user?.userId || null;
            } catch (error) {
                console.error(
                    "Unable to read stored user:",
                    error
                );
            }
        }

        return null;
    };


    // =====================================================
    // LOAD SETTINGS FROM BACKEND
    // =====================================================

    useEffect(() => {

        const loadSettings = async () => {

            const userId = getUserId();

            if (!userId) {
                setError("User information not found. Please login again.");
                setLoading(false);
                return;
            }

            try {

                setLoading(true);
                setError("");

                const response = await fetch(
                    `http://localhost:8080/api/users/${userId}/settings`
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load settings"
                    );
                }

                const data = await response.json();


                setNotifications({
                    quizReminders:
                        data.quizReminders ??
                        defaultNotifications.quizReminders,

                    newContentAlerts:
                        data.newContentAlerts ??
                        defaultNotifications.newContentAlerts,

                    teacherAnnouncements:
                        data.teacherAnnouncements ??
                        defaultNotifications.teacherAnnouncements,

                    weeklyProgressReports:
                        data.weeklyProgressReports ??
                        defaultNotifications.weeklyProgressReports,
                });


                setLearningPreferences({
                    answerStyle:
                        data.answerStyle ??
                        defaultLearningPreferences.answerStyle,

                    studyReminder:
                        data.studyReminder ??
                        defaultLearningPreferences.studyReminder,

                    recommendations:
                        data.recommendations ??
                        defaultLearningPreferences.recommendations,
                });


                setAccountSettings({
                    language:
                        data.language ??
                        defaultAccountSettings.language,

                    timeZone:
                        data.timeZone ??
                        defaultAccountSettings.timeZone,

                    academicYear:
                        data.academicYear ??
                        defaultAccountSettings.academicYear,
                });


                setPrivacySettings({
                    saveChatHistory:
                        data.saveChatHistory ??
                        defaultPrivacySettings.saveChatHistory,

                    personalizedData:
                        data.personalizedData ??
                        defaultPrivacySettings.personalizedData,
                });

            } catch (err) {

                console.error(
                    "Settings loading error:",
                    err
                );

                setError(
                    "Unable to load settings from the server."
                );

            } finally {

                setLoading(false);
            }
        };


        loadSettings();

    }, []);


    // =====================================================
    // TOGGLE COMPONENT
    // =====================================================

    const Toggle = ({
        enabled,
        onClick,
    }) => {

        return (
            <button
                type="button"
                onClick={onClick}
                aria-pressed={enabled}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    enabled
                        ? "bg-blue-600"
                        : "bg-slate-200"
                }`}
            >
                <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        enabled
                            ? "left-6"
                            : "left-1"
                    }`}
                />
            </button>
        );
    };


    // =====================================================
    // NOTIFICATION TOGGLE
    // =====================================================

    const toggleNotification = (key) => {

        setNotifications((previous) => ({
            ...previous,
            [key]: !previous[key],
        }));

        setSaved(false);
        setError("");
    };


    // =====================================================
    // LEARNING TOGGLE
    // =====================================================

    const toggleLearningPreference = (key) => {

        setLearningPreferences((previous) => ({
            ...previous,
            [key]: !previous[key],
        }));

        setSaved(false);
        setError("");
    };


    // =====================================================
    // PRIVACY TOGGLE
    // =====================================================

    const togglePrivacy = (key) => {

        setPrivacySettings((previous) => ({
            ...previous,
            [key]: !previous[key],
        }));

        setSaved(false);
        setError("");
    };


    // =====================================================
    // ACCOUNT CHANGE
    // =====================================================

    const handleAccountChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setAccountSettings((previous) => ({
            ...previous,
            [name]: value,
        }));

        setSaved(false);
        setError("");
    };


    // =====================================================
    // LEARNING STYLE
    // =====================================================

    const handleAnswerStyleChange = (event) => {

        setLearningPreferences((previous) => ({
            ...previous,
            answerStyle: event.target.value,
        }));

        setSaved(false);
        setError("");
    };


    // =====================================================
    // SAVE SETTINGS TO BACKEND
    // =====================================================

    const handleSave = async () => {

        const userId = getUserId();

        if (!userId) {
            setError(
                "User information not found. Please login again."
            );
            return;
        }

        try {

            setSaving(true);
            setSaved(false);
            setError("");


            const payload = {

                // Notifications
                quizReminders:
                    notifications.quizReminders,

                newContentAlerts:
                    notifications.newContentAlerts,

                teacherAnnouncements:
                    notifications.teacherAnnouncements,

                weeklyProgressReports:
                    notifications.weeklyProgressReports,


                // Learning Preferences
                answerStyle:
                    learningPreferences.answerStyle,

                studyReminder:
                    learningPreferences.studyReminder,

                recommendations:
                    learningPreferences.recommendations,


                // Account Preferences
                language:
                    accountSettings.language,

                timeZone:
                    accountSettings.timeZone,

                academicYear:
                    accountSettings.academicYear,


                // Privacy
                saveChatHistory:
                    privacySettings.saveChatHistory,

                personalizedData:
                    privacySettings.personalizedData,
            };


            const response = await fetch(
                `http://localhost:8080/api/users/${userId}/settings`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(payload),
                }
            );


            if (!response.ok) {
                throw new Error(
                    "Failed to save settings"
                );
            }


            const data = await response.json();


            // Update UI with the values returned
            // by the backend.

            setNotifications({
                quizReminders:
                    data.quizReminders,

                newContentAlerts:
                    data.newContentAlerts,

                teacherAnnouncements:
                    data.teacherAnnouncements,

                weeklyProgressReports:
                    data.weeklyProgressReports,
            });


            setLearningPreferences({
                answerStyle:
                    data.answerStyle,

                studyReminder:
                    data.studyReminder,

                recommendations:
                    data.recommendations,
            });


            setAccountSettings({
                language:
                    data.language,

                timeZone:
                    data.timeZone,

                academicYear:
                    data.academicYear,
            });


            setPrivacySettings({
                saveChatHistory:
                    data.saveChatHistory,

                personalizedData:
                    data.personalizedData,
            });


            setSaved(true);

            setTimeout(() => {
                setSaved(false);
            }, 3000);

        } catch (err) {

            console.error(
                "Settings save error:",
                err
            );

            setError(
                "Unable to save settings. Please try again."
            );

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");

        navigate("/login");
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

                <div className="mx-auto max-w-[675px]">

                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                        <p className="text-sm text-slate-500">
                            Loading settings...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

            <div className="mx-auto max-w-[675px]">


                {/* ================================================= */}
                {/* PAGE HEADER */}
                {/* ================================================= */}

                <div className="mb-8">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                            <Info size={20} />

                        </div>


                        <div>

                            <h1 className="text-3xl font-bold text-slate-900">
                                Settings
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage your learning, notifications and account preferences.
                            </p>

                        </div>

                    </div>

                </div>


                {/* ================================================= */}
                {/* ERROR */}
                {/* ================================================= */}

                {error && (

                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                        {error}

                    </div>

                )}


                {/* ================================================= */}
                {/* NOTIFICATIONS */}
                {/* ================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <Bell
                            size={18}
                            className="text-blue-600"
                        />

                        <h2 className="text-base font-bold text-slate-900">
                            Notifications
                        </h2>

                    </div>


                    <p className="mt-1 text-xs text-slate-500">
                        Control the notifications you receive from your learning platform.
                    </p>


                    <div className="mt-5 space-y-5">


                        {/* Quiz Reminders */}

                        <div className="flex items-center justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-900">
                                    Quiz Reminders
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Get reminders when quizzes are available or approaching.
                                </p>

                            </div>


                            <Toggle
                                enabled={
                                    notifications.quizReminders
                                }
                                onClick={() =>
                                    toggleNotification(
                                        "quizReminders"
                                    )
                                }
                            />

                        </div>


                        {/* New Content */}

                        <div className="flex items-center justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-900">
                                    New Content Alerts
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Get notified when your teacher uploads new notes or quizzes.
                                </p>

                            </div>


                            <Toggle
                                enabled={
                                    notifications.newContentAlerts
                                }
                                onClick={() =>
                                    toggleNotification(
                                        "newContentAlerts"
                                    )
                                }
                            />

                        </div>


                        {/* Teacher Announcements */}

                        <div className="flex items-center justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-900">
                                    Teacher Announcements
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Receive announcements from joined communities.
                                </p>

                            </div>


                            <Toggle
                                enabled={
                                    notifications.teacherAnnouncements
                                }
                                onClick={() =>
                                    toggleNotification(
                                        "teacherAnnouncements"
                                    )
                                }
                            />

                        </div>


                        {/* Weekly Reports */}

                        <div className="flex items-center justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-900">
                                    Weekly Progress Reports
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Receive a summary of your weekly learning activity.
                                </p>

                            </div>


                            <Toggle
                                enabled={
                                    notifications.weeklyProgressReports
                                }
                                onClick={() =>
                                    toggleNotification(
                                        "weeklyProgressReports"
                                    )
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* LEARNING PREFERENCES */}
                {/* ================================================= */}

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <Sparkles
                            size={18}
                            className="text-blue-600"
                        />

                        <h2 className="text-base font-bold text-slate-900">
                            Learning Preferences
                        </h2>

                    </div>


                    <p className="mt-1 text-xs text-slate-500">
                        Customize how Adaptive AI helps you learn.
                    </p>


                    <div className="mt-5">


                        {/* AI ANSWER STYLE */}

                        <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4">

                            <div>

                                <p className="text-sm font-medium text-slate-900">
                                    AI Answer Style
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Choose how detailed AI explanations should be.
                                </p>

                            </div>


                            <div className="relative shrink-0">

                                <select
                                    value={
                                        learningPreferences.answerStyle
                                    }
                                    onChange={
                                        handleAnswerStyleChange
                                    }
                                    className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-600 outline-none focus:border-blue-500"
                                >

                                    <option>
                                        Simple
                                    </option>

                                    <option>
                                        Detailed
                                    </option>

                                    <option>
                                        Exam Focused
                                    </option>

                                </select>


                                <ChevronDown
                                    size={14}
                                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                            </div>

                        </div>


                        {/* STUDY REMINDER */}

                        <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4">

                            <div>

                                <p className="text-sm font-medium text-slate-900">
                                    Daily Study Reminder
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Remind me to continue my learning plan.
                                </p>

                            </div>


                            <Toggle
                                enabled={
                                    learningPreferences.studyReminder
                                }
                                onClick={() =>
                                    toggleLearningPreference(
                                        "studyReminder"
                                    )
                                }
                            />

                        </div>


                        {/* RECOMMENDATIONS */}

                        <div className="flex items-center justify-between gap-4 py-4">

                            <div>

                                <p className="text-sm font-medium text-slate-900">
                                    Learning Recommendations
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Show recommended topics based on your progress.
                                </p>

                            </div>


                            <Toggle
                                enabled={
                                    learningPreferences.recommendations
                                }
                                onClick={() =>
                                    toggleLearningPreference(
                                        "recommendations"
                                    )
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* ACCOUNT PREFERENCES */}
                {/* ================================================= */}

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <Languages
                            size={18}
                            className="text-blue-600"
                        />

                        <h2 className="text-base font-bold text-slate-900">
                            Account Preferences
                        </h2>

                    </div>


                    <p className="mt-1 text-xs text-slate-500">
                        Manage regional and academic preferences.
                    </p>


                    <div className="mt-4 divide-y divide-slate-100">


                        {/* LANGUAGE */}

                        <div className="flex items-center justify-between gap-4 py-4">

                            <div className="flex items-center gap-3">

                                <Languages
                                    size={17}
                                    className="text-slate-500"
                                />

                                <div>

                                    <p className="text-sm font-medium text-slate-900">
                                        Language
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Interface language
                                    </p>

                                </div>

                            </div>


                            <select
                                name="language"
                                value={
                                    accountSettings.language
                                }
                                onChange={
                                    handleAccountChange
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-500"
                            >

                                <option>
                                    English (India)
                                </option>

                                <option>
                                    English (US)
                                </option>

                            </select>

                        </div>


                        {/* TIME ZONE */}

                        <div className="flex items-center justify-between gap-4 py-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">

                                    <Clock3 size={17} />

                                </div>


                                <div>

                                    <p className="text-sm font-medium text-slate-900">
                                        Time Zone
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Used for reminders and schedules
                                    </p>

                                </div>

                            </div>


                            <select
                                name="timeZone"
                                value={
                                    accountSettings.timeZone
                                }
                                onChange={
                                    handleAccountChange
                                }
                                className="max-w-[270px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-right text-sm text-slate-600 outline-none focus:border-blue-500"
                            >

                                <option>
                                    Asia/Kolkata (IST UTC+5:30)
                                </option>

                                <option>
                                    Asia/Dubai (GST UTC+4:00)
                                </option>

                                <option>
                                    UTC
                                </option>

                            </select>

                        </div>


                        {/* ACADEMIC YEAR */}

                        <div className="flex items-center justify-between gap-4 py-4">

                            <div>

                                <p className="text-sm font-medium text-slate-900">
                                    Academic Year
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Current academic session
                                </p>

                            </div>


                            <select
                                name="academicYear"
                                value={
                                    accountSettings.academicYear
                                }
                                onChange={
                                    handleAccountChange
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-500"
                            >

                                <option>
                                    2026–2027
                                </option>

                                <option>
                                    2025–2026
                                </option>

                                <option>
                                    2024–2025
                                </option>

                            </select>

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* PRIVACY & DATA */}
                {/* ================================================= */}

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <ShieldCheck
                            size={18}
                            className="text-blue-600"
                        />

                        <h2 className="text-base font-bold text-slate-900">
                            Privacy & Data
                        </h2>

                    </div>


                    <p className="mt-1 text-xs text-slate-500">
                        Control how your learning information is used.
                    </p>


                    <div className="mt-5 space-y-5">


                        {/* CHAT HISTORY */}

                        <div className="flex items-center justify-between gap-4">

                            <div className="flex items-start gap-3">

                                <LockKeyhole
                                    size={18}
                                    className="mt-0.5 text-slate-500"
                                />

                                <div>

                                    <p className="text-sm font-medium text-slate-900">
                                        Save AI Chat History
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Keep previous AI conversations available in Recent Conversations.
                                    </p>

                                </div>

                            </div>


                            <Toggle
                                enabled={
                                    privacySettings.saveChatHistory
                                }
                                onClick={() =>
                                    togglePrivacy(
                                        "saveChatHistory"
                                    )
                                }
                            />

                        </div>


                        {/* PERSONALIZATION */}

                        <div className="flex items-center justify-between gap-4">

                            <div className="flex items-start gap-3">

                                <Sparkles
                                    size={18}
                                    className="mt-0.5 text-slate-500"
                                />

                                <div>

                                    <p className="text-sm font-medium text-slate-900">
                                        Personalized Learning Data
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Use your activity and quiz performance for personalized recommendations.
                                    </p>

                                </div>

                            </div>


                            <Toggle
                                enabled={
                                    privacySettings.personalizedData
                                }
                                onClick={() =>
                                    togglePrivacy(
                                        "personalizedData"
                                    )
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* ABOUT */}
                {/* ================================================= */}

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <Info
                            size={18}
                            className="text-slate-500"
                        />

                        <h2 className="text-base font-bold text-slate-900">
                            About
                        </h2>

                    </div>


                    <div className="mt-5 flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">

                            <span className="text-lg font-bold">
                                AI
                            </span>

                        </div>


                        <div>

                            <h3 className="text-sm font-bold text-slate-900">
                                Adaptive AI Tutor
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Version 1.0.0 · Final Year Engineering Project
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                AI-powered learning platform for IT & CS students
                            </p>

                        </div>

                    </div>


                    <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">


                        <div>

                            <p className="text-xs text-slate-400">
                                Frontend
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                                React + Vite + Tailwind CSS
                            </p>

                        </div>


                        <div>

                            <p className="text-xs text-slate-400">
                                AI
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                                RAG + LLM Integration
                            </p>

                        </div>


                        <div>

                            <p className="text-xs text-slate-400">
                                Backend
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                                Spring Boot + Java
                            </p>

                        </div>


                        <div>

                            <p className="text-xs text-slate-400">
                                Database
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                                PostgreSQL
                            </p>

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* SAVE BUTTON */}
                {/* ================================================= */}

                <div className="mt-6 flex items-center justify-end gap-4">

                    {saved && (

                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">

                            <Check size={16} />

                            Settings saved

                        </div>

                    )}


                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition ${
                            saving
                                ? "cursor-not-allowed bg-blue-400"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >

                        <Save size={16} />

                        {saving
                            ? "Saving..."
                            : "Save Preferences"}

                    </button>

                </div>


                {/* ================================================= */}
                {/* SIGN OUT */}
                {/* ================================================= */}

                <section className="mt-6 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">

                    <div className="flex items-start justify-between gap-4">

                        <div>

                            <h2 className="text-base font-bold text-slate-900">
                                Sign Out
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Sign out of your Adaptive AI Tutor account on this device.
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                        >

                            <LogOut size={16} />

                            Sign Out

                        </button>

                    </div>

                </section>

            </div>

        </div>
    );
}


export default SettingsPage;