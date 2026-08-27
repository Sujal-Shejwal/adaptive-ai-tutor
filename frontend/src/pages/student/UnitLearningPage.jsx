import {
    ArrowLeft,
    BookOpen,
    CheckCircle,
    FileText,
    Loader2,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";


function UnitLearningPage() {

    const { unitId } = useParams();


    // =========================================================
    // STATE
    // =========================================================

    const [unit, setUnit] =
        useState(null);

    const [topics, setTopics] =
        useState([]);

    const [completedTopicIds, setCompletedTopicIds] =
        useState(new Set());

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================================================
    // GET LOGGED-IN USER ID
    // =========================================================

    const getUserId = () => {

        const storedId =
            localStorage.getItem(
                "userId"
            );

        if (storedId) {
            return storedId;
        }

        try {

            const storedUser =
                JSON.parse(
                    localStorage.getItem(
                        "user"
                    ) || "null"
                );

            return storedUser?.id
                ? String(
                    storedUser.id
                )
                : null;

        } catch {

            return null;
        }
    };


    // =========================================================
    // FETCH UNIT
    // =========================================================

    const fetchUnit = async () => {

        if (!unitId) {
            return null;
        }

        const response =
            await fetch(
                `http://localhost:8080/api/units/${unitId}`
            );

        if (!response.ok) {

            if (
                response.status === 404
            ) {

                throw new Error(
                    "Unit not found."
                );
            }

            throw new Error(
                "Failed to fetch unit."
            );
        }

        return response.json();
    };


    // =========================================================
    // FETCH TOPICS
    // =========================================================

    const fetchTopics = async () => {

        if (!unitId) {
            return [];
        }

        const response =
            await fetch(
                `http://localhost:8080/api/topics/unit/${unitId}`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch topics."
            );
        }

        const data =
            await response.json();

        return Array.isArray(data)
            ? data
            : [];
    };


    // =========================================================
    // FETCH TOPIC PROGRESS
    // =========================================================

    const fetchTopicProgress = async (
        topicList,
        userId
    ) => {

        if (
            !userId ||
            topicList.length === 0
        ) {

            return new Set();
        }

        const progressResults =
            await Promise.all(
                topicList.map(
                    async (topic) => {

                        try {

                            const response =
                                await fetch(
                                    `http://localhost:8080/api/progress/user/${userId}/topic/${topic.id}`
                                );

                            if (
                                response.status ===
                                404
                            ) {

                                return {
                                    topicId:
                                        topic.id,
                                    completed:
                                        false,
                                };
                            }

                            if (
                                !response.ok
                            ) {

                                return {
                                    topicId:
                                        topic.id,
                                    completed:
                                        false,
                                };
                            }

                            const data =
                                await response.json();

                            return {
                                topicId:
                                    topic.id,
                                completed:
                                    data?.completed ===
                                    true ||
                                    data?.isCompleted ===
                                    true,
                            };

                        } catch (
                            progressError
                        ) {

                            console.error(
                                `Error fetching progress for topic ${topic.id}:`,
                                progressError
                            );

                            return {
                                topicId:
                                    topic.id,
                                completed:
                                    false,
                            };
                        }
                    }
                )
            );


        return new Set(
            progressResults
                .filter(
                    (item) =>
                        item.completed
                )
                .map(
                    (item) =>
                        item.topicId
                )
        );
    };


    // =========================================================
    // LOAD ALL UNIT DATA
    // =========================================================

    useEffect(() => {

        let cancelled = false;


        const loadData = async () => {

            try {

                setLoading(true);

                setError("");


                const userId =
                    getUserId();


                if (!userId) {

                    throw new Error(
                        "Student account not found. Please log in again."
                    );
                }


                const [
                    unitData,
                    topicData,
                ] = await Promise.all([
                    fetchUnit(),
                    fetchTopics(),
                ]);


                const completedIds =
                    await fetchTopicProgress(
                        topicData,
                        userId
                    );


                if (
                    cancelled
                ) {
                    return;
                }


                setUnit(unitData);

                setTopics(topicData);

                setCompletedTopicIds(
                    completedIds
                );

            } catch (loadError) {

                if (
                    cancelled
                ) {
                    return;
                }


                console.error(
                    "Error loading unit:",
                    loadError
                );


                setError(
                    loadError.message ||
                    "Unable to load unit. Please try again."
                );

            } finally {

                if (
                    !cancelled
                ) {

                    setLoading(false);

                }
            }
        };


        if (unitId) {

            loadData();

        }


        return () => {

            cancelled = true;

        };

    }, [unitId]);


    // =========================================================
    // CALCULATED PROGRESS
    // =========================================================

    const totalTopics =
        topics.length;

    const completedTopics =
        topics.filter(
            (topic) =>
                completedTopicIds.has(
                    topic.id
                )
        ).length;


    const progress =
        totalTopics > 0
            ? Math.round(
                (
                    completedTopics *
                    100
                ) /
                totalTopics
            )
            : 0;


    const learningStatus =
        totalTopics === 0
            ? "No Topics"
            : completedTopics ===
                totalTopics
                ? "Completed"
                : completedTopics > 0
                    ? "In Progress"
                    : "Not Started";


    // =========================================================
    // LOADING STATE
    // =========================================================

    if (loading) {

        return (

            <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

                <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                    <Loader2
                        size={30}
                        className="mx-auto animate-spin text-blue-600"
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading unit...
                    </p>

                </div>

            </div>

        );

    }


    // =========================================================
    // ERROR STATE
    // =========================================================

    if (
        error ||
        !unit
    ) {

        return (

            <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

                <div className="mx-auto max-w-5xl">

                    <Link
                        to="/student/subjects"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                    >

                        <ArrowLeft size={17} />

                        Back to Subjects

                    </Link>


                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

                        <h1 className="text-xl font-bold text-red-700">
                            Unable to Load Unit
                        </h1>

                        <p className="mt-2 text-sm text-red-600">
                            {error ||
                                "The requested unit could not be found."}
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">


            <div className="mx-auto max-w-5xl">


                {/* ========================= */}
                {/* BACK */}
                {/* ========================= */}

                <Link
                    to="/student/subjects"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                >

                    <ArrowLeft size={17} />

                    Back to Subjects

                </Link>


                {/* ========================= */}
                {/* UNIT HEADER */}
                {/* ========================= */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">


                        {/* UNIT INFORMATION */}

                        <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                                <BookOpen size={28} />

                            </div>


                            <div>

                                <p className="text-sm font-medium text-blue-600">
                                    Unit{" "}
                                    {unit.unitNumber ||
                                        unitId}
                                </p>


                                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                                    {unit.title}
                                </h1>


                                <p className="mt-1 text-sm text-slate-500">
                                    {totalTopics} Topics
                                </p>

                            </div>

                        </div>


                        {/* PROGRESS */}

                        <div className="w-full lg:w-72">

                            <div className="mb-2 flex items-center justify-between">

                                <span className="text-sm font-medium text-slate-600">
                                    Unit Progress
                                </span>


                                <span className="text-sm font-bold text-slate-900">
                                    {progress}%
                                </span>

                            </div>


                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                    style={{
                                        width:
                                            `${progress}%`,
                                    }}
                                />

                            </div>


                            <p className="mt-2 text-xs text-slate-400">
                                {completedTopics} of{" "}
                                {totalTopics} topics completed
                            </p>

                        </div>

                    </div>

                </div>


                {/* ========================= */}
                {/* TOPIC SUMMARY */}
                {/* ========================= */}

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">


                    {/* TOPICS */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">

                                <FileText size={23} />

                            </div>


                            <div>

                                <p className="text-sm text-slate-400">
                                    Topics
                                </p>


                                <p className="text-xl font-semibold text-slate-900">
                                    {totalTopics}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* LEARNING STATUS */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">

                                <CheckCircle size={23} />

                            </div>


                            <div>

                                <p className="text-sm text-slate-400">
                                    Learning Status
                                </p>


                                <p className="text-xl font-semibold text-slate-900">
                                    {learningStatus}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ========================= */}
                {/* TOPICS */}
                {/* ========================= */}

                <div className="mt-8">


                    <div className="mb-5">

                        <h2 className="text-xl font-bold text-slate-900">
                            Unit Topics
                        </h2>


                        <p className="mt-1 text-sm text-slate-500">
                            Select a topic to start learning.
                        </p>

                    </div>


                    {/* EMPTY */}

                    {topics.length === 0 && (

                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                            <FileText
                                size={40}
                                className="mx-auto text-slate-300"
                            />


                            <h3 className="mt-4 text-base font-semibold text-slate-900">
                                No topics available
                            </h3>


                            <p className="mt-2 text-sm text-slate-500">
                                Topics for this unit have not been added yet.
                            </p>

                        </div>

                    )}


                    {/* TOPIC CARDS */}

                    {topics.length > 0 && (

                        <div className="space-y-4">

                            {topics.map(
                                (
                                    topic,
                                    index
                                ) => {

                                    const completed =
                                        completedTopicIds.has(
                                            topic.id
                                        );


                                    return (

                                        <Link
                                            key={
                                                topic.id
                                            }
                                            to={`/student/topic/${topic.id}`}
                                            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        >

                                            <div className="flex items-center justify-between gap-4">


                                                {/* LEFT */}

                                                <div className="flex items-center gap-4">

                                                    <div
                                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                                            completed
                                                                ? "bg-green-100 text-green-600"
                                                                : "bg-blue-100 text-blue-600"
                                                        }`}
                                                    >

                                                        {completed ? (

                                                            <CheckCircle
                                                                size={21}
                                                            />

                                                        ) : (

                                                            <FileText
                                                                size={21}
                                                            />

                                                        )}

                                                    </div>


                                                    <div>

                                                        <p className="text-xs font-medium text-slate-400">
                                                            Topic{" "}
                                                            {topic.topicNumber ||
                                                                index +
                                                                1}
                                                        </p>


                                                        <h3 className="mt-1 text-base font-semibold text-slate-900">
                                                            {topic.title}
                                                        </h3>


                                                        {topic.description && (

                                                            <p className="mt-1 text-sm text-slate-500">
                                                                {topic.description}
                                                            </p>

                                                        )}

                                                    </div>

                                                </div>


                                                {/* RIGHT */}

                                                <div className="shrink-0 text-right">

                                                    <span
                                                        className={`text-xs font-semibold ${
                                                            completed
                                                                ? "text-green-600"
                                                                : "text-slate-400"
                                                        }`}
                                                    >
                                                        {completed
                                                            ? "Completed"
                                                            : "Not Started"}
                                                    </span>

                                                </div>

                                            </div>

                                        </Link>

                                    );

                                }
                            )}

                        </div>

                    )}

                </div>


            </div>

        </div>

    );

}


export default UnitLearningPage;
