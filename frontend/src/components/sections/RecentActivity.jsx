import { useCallback, useEffect, useState } from "react";

import {
    ClipboardCheck,
} from "lucide-react";


const RecentActivity = () => {

    const [
        activities,
        setActivities,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");


    // =========================================================
    // GET LOGGED-IN USER ID
    // =========================================================

    const getUserId = () => {

        const storedId =
            localStorage.getItem("userId");

        if (storedId) {
            return storedId;
        }


        try {

            const storedUser =
                JSON.parse(
                    localStorage.getItem("user") ||
                    "null"
                );

            return storedUser?.id
                ? String(storedUser.id)
                : null;

        } catch {

            return null;
        }
    };


    // =========================================================
    // FETCH RECENT ACTIVITY
    // =========================================================

    const fetchRecentActivity =
        useCallback(async () => {

            try {

                setError("");


                const userId =
                    getUserId();


                if (!userId) {

                    setActivities([]);

                    throw new Error(
                        "Student account not found. Please log in again."
                    );
                }


                const response =
                    await fetch(
                        `http://localhost:8080/api/progress/user/${userId}/recent`
                    );


                if (!response.ok) {

                    throw new Error(
                        `Failed to fetch recent activity (${response.status})`
                    );

                }


                const data =
                    await response.json();


                setActivities(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    "Recent activity error:",
                    error
                );

                setActivities([]);

                setError(
                    error.message ||
                    "Unable to load recent activity."
                );

            } finally {

                setLoading(false);

            }

        }, []);


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchRecentActivity();

    }, [fetchRecentActivity]);


    // =========================================================
    // REFRESH WHEN RETURNING TO DASHBOARD
    // =========================================================

    useEffect(() => {

        const handleFocus = () => {

            fetchRecentActivity();

        };


        window.addEventListener(
            "focus",
            handleFocus
        );


        return () => {

            window.removeEventListener(
                "focus",
                handleFocus
            );

        };

    }, [fetchRecentActivity]);


    // =========================================================
    // AUTO REFRESH EVERY 5 SECONDS
    // =========================================================

    useEffect(() => {

        const interval =
            setInterval(() => {

                fetchRecentActivity();

            }, 5000);


        return () => {

            clearInterval(interval);

        };

    }, [fetchRecentActivity]);


    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime = (
        dateTime
    ) => {

        if (!dateTime) {

            return "Recently";

        }


        const activityDate =
            new Date(dateTime);


        if (
            Number.isNaN(
                activityDate.getTime()
            )
        ) {

            return "Recently";

        }


        const now =
            new Date();


        const difference =
            Math.floor(
                (now - activityDate) / 1000
            );


        // -----------------------------------------------------
        // JUST NOW
        // -----------------------------------------------------

        if (difference < 60) {

            return "Just now";

        }


        // -----------------------------------------------------
        // MINUTES
        // -----------------------------------------------------

        const minutes =
            Math.floor(
                difference / 60
            );


        if (minutes < 60) {

            return `${minutes} ${
                minutes === 1
                    ? "minute"
                    : "minutes"
            } ago`;

        }


        // -----------------------------------------------------
        // HOURS
        // -----------------------------------------------------

        const hours =
            Math.floor(
                minutes / 60
            );


        if (hours < 24) {

            return `${hours} ${
                hours === 1
                    ? "hour"
                    : "hours"
            } ago`;

        }


        // -----------------------------------------------------
        // DAYS
        // -----------------------------------------------------

        const days =
            Math.floor(
                hours / 24
            );


        if (days === 1) {

            return "Yesterday";

        }


        if (days < 7) {

            return `${days} days ago`;

        }


        // -----------------------------------------------------
        // OLDER ACTIVITY
        // -----------------------------------------------------

        return activityDate.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );

    };


    // =========================================================
    // LOADING STATE
    // =========================================================

    if (loading) {

        return (

            <section className="rounded-2xl border border-gray-200 bg-white p-5">

                <h2 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                </h2>


                <p className="mt-5 text-sm text-gray-400">
                    Loading activity...
                </p>

            </section>

        );

    }


    // =========================================================
    // ERROR STATE
    // =========================================================

    if (error) {

        return (

            <section className="rounded-2xl border border-red-200 bg-red-50 p-5">

                <h2 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                </h2>


                <p className="mt-5 text-sm text-red-600">
                    {error}
                </p>

            </section>

        );

    }


    // =========================================================
    // EMPTY STATE
    // =========================================================

    if (activities.length === 0) {

        return (

            <section className="rounded-2xl border border-gray-200 bg-white p-5">

                <h2 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                </h2>


                <p className="mt-5 text-sm text-gray-400">
                    No recent activity yet.
                </p>

            </section>

        );

    }


    // =========================================================
    // ACTIVITY LIST
    // =========================================================

    return (

        <section className="rounded-2xl border border-gray-200 bg-white p-5">

            <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
            </h2>


            <div className="mt-5 space-y-4">

                {activities.map(
                    (activity) => {

                        const topic =
                            activity.topic;


                        return (

                            <div
                                key={
                                    activity.id
                                }
                                className="flex items-start gap-3"
                            >

                                {/* =================================================
                                    ICON
                                ================================================= */}

                                <div
                                    className="
                                        flex
                                        h-8
                                        w-8
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-emerald-100
                                        text-emerald-600
                                    "
                                >

                                    <ClipboardCheck
                                        size={16}
                                    />

                                </div>


                                {/* =================================================
                                    ACTIVITY CONTENT
                                ================================================= */}

                                <div className="min-w-0">

                                    <p className="text-sm text-gray-700">

                                        Completed Topic:{" "}

                                        <span className="font-medium">

                                            {topic?.title ||
                                                "Unknown Topic"}

                                        </span>

                                    </p>


                                    <span className="text-xs text-gray-400">

                                        {formatTime(
                                            activity.completedAt
                                        )}

                                    </span>

                                </div>

                            </div>

                        );

                    }
                )}

            </div>

        </section>

    );

};


export default RecentActivity;