import {
    MessageSquare,
    ClipboardCheck,
    TrendingUp,
    BarChart3,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";


const API_BASE =
    `${import.meta.env.VITE_API_BASE_URL}`;


const getUserId = () => {

    const directUserId =
        localStorage.getItem(
            "userId"
        );

    if (directUserId) {
        return directUserId;
    }


    try {

        const storedUser =
            JSON.parse(
                localStorage.getItem(
                    "user"
                ) || "null"
            );

        return (
            storedUser?.id ||
            storedUser?.userId ||
            null
        );

    } catch {

        return null;

    }

};


const StatisticsCards = () => {

    const [
        statistics,
        setStatistics,
    ] = useState({
        questionsAnswered: 0,
        quizzesCompleted: 0,
        learningStreak: "—",
        averageQuizScore: 0,
    });


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    useEffect(() => {

        const loadStatistics =
            async () => {

                try {

                    setLoading(true);
                    setError("");


                    const userId =
                        getUserId();


                    if (!userId) {

                        throw new Error(
                            "Student account not found."
                        );

                    }


                    const response =
                        await fetch(
                            `${API_BASE}/api/performance/student/${userId}`
                        );


                    const data =
                        await response
                            .json()
                            .catch(
                                () => ({})
                            );


                    if (!response.ok) {

                        throw new Error(
                            data?.error ||
                            "Unable to load student statistics."
                        );

                    }


                    // -----------------------------------------
                    // TOTAL QUIZ QUESTIONS ANSWERED
                    // -----------------------------------------

                    const quizPerformance =
                        Array.isArray(
                            data?.quizPerformance
                        )
                            ? data.quizPerformance
                            : [];


                    const questionsAnswered =
                        quizPerformance.reduce(
                            (
                                total,
                                quiz
                            ) =>
                                total +
                                (
                                    Number(
                                        quiz?.totalQuestions
                                    ) || 0
                                ),
                            0
                        );


                    // -----------------------------------------
                    // SAVE REAL STATISTICS
                    // -----------------------------------------

                    setStatistics({
                        questionsAnswered,

                        quizzesCompleted:
                            Number(
                                data?.totalQuizzes
                            ) || 0,

                        // Learning streak is not currently
                        // provided by the backend.
                        learningStreak:
                            "—",

                        averageQuizScore:
                            Math.round(
                                Number(
                                    data?.averageScore
                                ) || 0
                            ),
                    });


                } catch (
                    requestError
                ) {

                    console.error(
                        "Statistics loading error:",
                        requestError
                    );


                    setError(
                        requestError?.message ||
                        "Unable to load statistics."
                    );

                } finally {

                    setLoading(false);

                }

            };


        loadStatistics();

    }, []);


    const cards = [
        {
            icon: MessageSquare,
            value: loading
                ? "..."
                : statistics.questionsAnswered,
            label: "Questions Answered",
            change:
                error
                    ? "Unable to load"
                    : "From completed quizzes",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            changeColor: "text-blue-600",
        },

        {
            icon: ClipboardCheck,
            value: loading
                ? "..."
                : statistics.quizzesCompleted,
            label: "Quizzes Completed",
            change:
                error
                    ? "Unable to load"
                    : "From completed attempts",
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-500",
            changeColor: "text-emerald-500",
        },

        {
            icon: TrendingUp,
            value: statistics.learningStreak,
            label: "Learning Streak",
            change: "Not tracked yet",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-500",
            changeColor: "text-amber-500",
        },

        {
            icon: BarChart3,
            value: loading
                ? "..."
                : `${statistics.averageQuizScore}%`,
            label: "Avg Quiz Score",
            change:
                error
                    ? "Unable to load"
                    : "Overall average",
            iconBg: "bg-violet-100",
            iconColor: "text-violet-500",
            changeColor: "text-violet-500",
        },
    ];


    return (
        <section>

            {error && !loading && (

                <p className="mb-3 text-xs text-red-500">
                    {error}
                </p>

            )}


            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                {cards.map(
                    (stat) => {

                        const Icon =
                            stat.icon;


                        return (

                            <div
                                key={
                                    stat.label
                                }
                                className="rounded-2xl border border-gray-200 bg-white p-5"
                            >

                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
                                >

                                    <Icon
                                        size={19}
                                        className={
                                            stat.iconColor
                                        }
                                    />

                                </div>


                                <p className="mt-4 text-2xl font-bold text-gray-900">

                                    {
                                        stat.value
                                    }

                                </p>


                                <p className="mt-1 text-sm text-gray-500">

                                    {
                                        stat.label
                                    }

                                </p>


                                <p
                                    className={`mt-1 text-xs ${stat.changeColor}`}
                                >

                                    {
                                        stat.change
                                    }

                                </p>

                            </div>

                        );

                    }
                )}

            </div>

        </section>
    );

};


export default StatisticsCards;