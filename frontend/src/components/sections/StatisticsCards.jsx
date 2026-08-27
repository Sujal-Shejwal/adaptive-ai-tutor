import {
    CheckCircle2,
    BookOpen,
    List,
    TrendingUp,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

const StatisticsCards = () => {

    const [statistics, setStatistics] = useState({
        completedTopics: 0,
        learningMaterials: 0,
        totalTopics: 0,
        overallProgress: 0,
    });

    const [loading, setLoading] =
        useState(true);


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
    // FETCH DASHBOARD STATISTICS
    // =========================================================

    const fetchStatistics =
        useCallback(async () => {

            try {

                const userId =
                    getUserId();

                if (!userId) {

                    console.error(
                        "Student user ID not found."
                    );

                    setLoading(false);

                    return;
                }


                const response =
                    await fetch(
                        `http://localhost:8080/api/dashboard/user/${userId}/statistics`
                    );


                if (!response.ok) {

                    throw new Error(
                        `Failed to fetch dashboard statistics (${response.status})`
                    );

                }


                const data =
                    await response.json();


                setStatistics({

                    completedTopics:
                        Number(
                            data.completedTopics
                        ) || 0,

                    learningMaterials:
                        Number(
                            data.learningMaterials
                        ) || 0,

                    totalTopics:
                        Number(
                            data.totalTopics
                        ) || 0,

                    overallProgress:
                        Number(
                            data.overallProgress
                        ) || 0,

                });

            } catch (error) {

                console.error(
                    "Dashboard statistics error:",
                    error
                );

            } finally {

                setLoading(false);

            }

        }, []);


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchStatistics();

    }, [fetchStatistics]);


    // =========================================================
    // REFRESH WHEN RETURNING TO DASHBOARD
    // =========================================================

    useEffect(() => {

        const handleFocus = () => {

            fetchStatistics();

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

    }, [fetchStatistics]);


    // =========================================================
    // AUTO REFRESH
    // =========================================================

    useEffect(() => {

        const interval =
            setInterval(() => {

                fetchStatistics();

            }, 5000);


        return () => {

            clearInterval(interval);

        };

    }, [fetchStatistics]);


    // =========================================================
    // STATISTICS DATA
    // =========================================================

    const cards = [

        {
            icon: CheckCircle2,

            value:
                statistics.completedTopics,

            label:
                "Topics Completed",

            description:
                "Based on your progress",

            iconBg:
                "bg-blue-100",

            iconColor:
                "text-blue-600",

            descriptionColor:
                "text-blue-600",
        },


        {
            icon: BookOpen,

            value:
                statistics.learningMaterials,

            label:
                "Learning Materials",

            description:
                "Available in your courses",

            iconBg:
                "bg-emerald-100",

            iconColor:
                "text-emerald-500",

            descriptionColor:
                "text-emerald-500",
        },


        {
            icon: List,

            value:
                statistics.totalTopics,

            label:
                "Total Topics",

            description:
                "Across all subjects",

            iconBg:
                "bg-amber-100",

            iconColor:
                "text-amber-500",

            descriptionColor:
                "text-amber-500",
        },


        {
            icon: TrendingUp,

            value:
                `${statistics.overallProgress}%`,

            label:
                "Overall Progress",

            description:
                "Course completion",

            iconBg:
                "bg-violet-100",

            iconColor:
                "text-violet-500",

            descriptionColor:
                "text-violet-500",
        },

    ];


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <section>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                {cards.map((card) => {

                    const Icon = card.icon;


                    return (

                        <div
                            key={card.label}
                            className="rounded-2xl border border-gray-200 bg-white p-5"
                        >

                            {/* ICON */}

                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
                            >

                                <Icon
                                    size={19}
                                    className={card.iconColor}
                                />

                            </div>


                            {/* VALUE */}

                            <p className="mt-4 text-2xl font-bold text-gray-900">

                                {loading
                                    ? "..."
                                    : card.value}

                            </p>


                            {/* LABEL */}

                            <p className="mt-1 text-sm text-gray-500">

                                {card.label}

                            </p>


                            {/* DESCRIPTION */}

                            <p
                                className={`mt-1 text-xs ${card.descriptionColor}`}
                            >

                                {card.description}

                            </p>

                        </div>

                    );

                })}

            </div>

        </section>

    );

};


export default StatisticsCards;