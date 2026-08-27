import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock3,
    FileText,
    PlayCircle,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import { useEffect, useState } from "react";


// =========================
// COLOR STYLES
// =========================

const colorStyles = {

    blue: {
        icon: "bg-blue-100 text-blue-600",
        progress: "bg-blue-600",
        button: "bg-blue-600 hover:bg-blue-700",
        light: "bg-blue-50 text-blue-700",
    },

    green: {
        icon: "bg-green-100 text-green-600",
        progress: "bg-green-500",
        button: "bg-green-500 hover:bg-green-600",
        light: "bg-green-50 text-green-700",
    },

    orange: {
        icon: "bg-orange-100 text-orange-600",
        progress: "bg-orange-500",
        button: "bg-orange-500 hover:bg-orange-600",
        light: "bg-orange-50 text-orange-700",
    },

    purple: {
        icon: "bg-purple-100 text-purple-600",
        progress: "bg-purple-500",
        button: "bg-purple-500 hover:bg-purple-600",
        light: "bg-purple-50 text-purple-700",
    },

};


// =========================
// STUDY PAGE
// =========================

function StudyPage() {

    // =========================
    // GET SUBJECT ID FROM URL
    // =========================

    const { subjectId } = useParams();


    // =========================
    // STATE
    // =========================

    const [subject, setSubject] = useState(null);

    const [units, setUnits] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(false);

    const [progress, setProgress] = useState(0);

    const [unitProgress, setUnitProgress] = useState({});

    const [progressLoading, setProgressLoading] = useState(true);


    // =========================
    // FETCH SUBJECT + UNITS
    // =========================

    useEffect(() => {

        const fetchStudyData = async () => {

            try {

                setLoading(true);
                setProgressLoading(true);
                setError(false);

                const subjectResponse = await fetch(
                    "http://localhost:8080/api/subjects"
                );

                if (!subjectResponse.ok) {
                    throw new Error("Failed to fetch subjects");
                }

                const subjectsData = await subjectResponse.json();

                const foundSubject = subjectsData.find(
                    (item) =>
                        String(item.id) === String(subjectId)
                );

                if (!foundSubject) {
                    setError(true);
                    return;
                }

                const unitsResponse = await fetch(
                    `http://localhost:8080/api/units/subject/${subjectId}`
                );

                if (!unitsResponse.ok) {
                    throw new Error("Failed to fetch units");
                }

                const unitsData = await unitsResponse.json();

                setSubject(foundSubject);
                setUnits(Array.isArray(unitsData) ? unitsData : []);

                const userId = localStorage.getItem("userId");

                if (!userId) {
                    setProgress(0);
                    setUnitProgress({});
                    return;
                }

                const subjectProgressResponse = await fetch(
                    `http://localhost:8080/api/progress/user/${userId}/subjects`
                );

                if (subjectProgressResponse.ok) {
                    const subjectProgressData =
                        await subjectProgressResponse.json();

                    setProgress(
                        Number(
                            subjectProgressData?.[foundSubject.id] ?? 0
                        )
                    );
                } else {
                    setProgress(0);
                }

                const unitProgressEntries = await Promise.all(
                    (Array.isArray(unitsData) ? unitsData : []).map(
                        async (unit) => {
                            try {
                                const response = await fetch(
                                    `http://localhost:8080/api/progress/user/${userId}/unit/${unit.id}`
                                );

                                if (!response.ok) {
                                    return [unit.id, 0];
                                }

                                const value = await response.json();

                                return [unit.id, Number(value) || 0];
                            } catch (unitError) {
                                console.error(
                                    `Error loading progress for unit ${unit.id}:`,
                                    unitError
                                );
                                return [unit.id, 0];
                            }
                        }
                    )
                );

                setUnitProgress(
                    Object.fromEntries(unitProgressEntries)
                );

            } catch (loadError) {

                console.error(
                    "Error loading study data:",
                    loadError
                );

                setError(true);

            } finally {

                setLoading(false);
                setProgressLoading(false);
            }
        };

        if (subjectId) {
            fetchStudyData();
        } else {
            setLoading(false);
            setProgressLoading(false);
            setError(true);
        }

    }, [subjectId]);


    // =========================
    // LOADING STATE
    // =========================

    if (loading) {

        return (

            <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                    <p className="text-slate-500">
                        Loading subject...
                    </p>

                </div>

            </div>

        );

    }


    // =========================
    // SUBJECT NOT FOUND
    // =========================

    if (error || !subject) {

        return (

            <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                    <h1 className="text-2xl font-bold text-slate-900">
                        Subject Not Found
                    </h1>


                    <p className="mt-2 text-slate-500">
                        The subject you are trying to access does not exist.
                    </p>


                    <Link
                        to="/student/subjects"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >

                        <ArrowLeft size={16} />

                        Back to Subjects

                    </Link>

                </div>

            </div>

        );

    }


    // =========================
    // COLOR
    // =========================

    const colorMap = {

        DS: "blue",

        DBMS: "green",

        OS: "orange",

        CN: "purple",

        OOP: "blue",

    };


    const subjectColor =
        colorMap[subject.code] || "blue";


    const styles =
        colorStyles[subjectColor];


    // =========================
    // CALCULATED DATA
    // =========================

    const subjectUnits =
        units.length;


    const subjectTopics =
        units.reduce(
            (total, unit) =>
                total + (unit.topics || 0),
            0
        );





    // =========================
    // PAGE
    // =========================

    return (

        <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">


            {/* ========================= */}
            {/* BACK BUTTON */}
            {/* ========================= */}

            <Link
                to="/student/subjects"
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >

                <ArrowLeft size={17} />

                Back to Subjects

            </Link>


            {/* ========================= */}
            {/* SUBJECT HEADER */}
            {/* ========================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">


                    {/* ========================= */}
                    {/* SUBJECT INFORMATION */}
                    {/* ========================= */}

                    <div className="flex items-center gap-4">

                        <div
                            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${styles.icon}`}
                        >

                            {subject.code}

                        </div>


                        <div>

                            <h1 className="text-2xl font-bold text-slate-900">

                                {subject.name}

                            </h1>


                            <p className="mt-1 text-sm text-slate-500">

                                {subjectUnits} Units · {subjectTopics} Topics

                            </p>

                        </div>

                    </div>


                    {/* ========================= */}
                    {/* PROGRESS */}
                    {/* ========================= */}

                    <div className="w-full lg:w-72">

                        <div className="mb-2 flex items-center justify-between">

                            <span className="text-sm font-medium text-slate-600">

                                Overall Progress

                            </span>


                            <span className="text-sm font-bold text-slate-900">

                                {progress}%

                            </span>

                        </div>


                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                            <div
                                className={`h-full rounded-full ${styles.progress}`}
                                style={{
                                    width: `${progress}%`,
                                }}
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* ========================= */}
            {/* LEARNING SUMMARY */}
            {/* ========================= */}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">


                {/* ========================= */}
                {/* UNITS */}
                {/* ========================= */}

                <div className="rounded-xl border border-slate-200 bg-white p-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">

                            <BookOpen size={19} />

                        </div>


                        <div>

                            <p className="text-xs text-slate-400">
                                Units
                            </p>


                            <p className="text-lg font-semibold text-slate-900">

                                {subjectUnits}

                            </p>

                        </div>

                    </div>

                </div>


                {/* ========================= */}
                {/* TOPICS */}
                {/* ========================= */}

                <div className="rounded-xl border border-slate-200 bg-white p-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">

                            <FileText size={19} />

                        </div>


                        <div>

                            <p className="text-xs text-slate-400">
                                Topics
                            </p>


                            <p className="text-lg font-semibold text-slate-900">

                                {subjectTopics}

                            </p>

                        </div>

                    </div>

                </div>


                {/* ========================= */}
                {/* LEARNING STATUS */}
                {/* ========================= */}

                <div className="rounded-xl border border-slate-200 bg-white p-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">

                            <Clock3 size={19} />

                        </div>


                        <div>

                            <p className="text-xs text-slate-400">
                                Learning Status
                            </p>


                            <p className="text-lg font-semibold text-slate-900">

                                {progress === 0
                                    ? "Not Started"
                                    : progress >= 100
                                        ? "Completed"
                                        : "In Progress"}

                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* ========================= */}
            {/* COURSE UNITS */}
            {/* ========================= */}

            <div className="mt-8">


                <div className="mb-4">

                    <h2 className="text-xl font-bold text-slate-900">

                        Course Units

                    </h2>


                    <p className="mt-1 text-sm text-slate-500">

                        Select a unit to continue learning.

                    </p>

                </div>


                {/* ========================= */}
                {/* UNIT LIST */}
                {/* ========================= */}

                <div className="space-y-4">

                    {units.map((unit, index) => {

                        const unitProgressValue =
                            Number(
                                unitProgress?.[unit.id] ?? 0
                            );

                        const completed =
                            unitProgressValue >= 100;

                        const unitStatus =
                            completed
                                ? "Completed"
                                : unitProgressValue > 0
                                    ? "In Progress"
                                    : "Not Started";


                        return (

                            <div
                                key={unit.id}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                            >

                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">


                                    {/* ========================= */}
                                    {/* UNIT INFORMATION */}
                                    {/* ========================= */}

                                    <div className="flex items-center gap-4">


                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                                completed
                                                    ? "bg-green-100 text-green-600"
                                                    : styles.icon
                                            }`}
                                        >

                                            {completed ? (

                                                <CheckCircle2 size={21} />

                                            ) : (

                                                <BookOpen size={21} />

                                            )}

                                        </div>


                                        <div>


                                            <p className="text-xs font-medium text-slate-400">

                                                Unit {unit.unitNumber || index + 1}

                                            </p>


                                            <h3 className="mt-1 font-semibold text-slate-900">

                                                {unit.title}

                                            </h3>


                                            <p className="mt-1 text-sm text-slate-500">

                                                {unit.topics} Topics · {progressLoading
                                                    ? "Loading..."
                                                    : `${unitProgressValue}% complete`}

                                            </p>

                                            <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">

                                                <div
                                                    className={`h-full rounded-full ${styles.progress} transition-all duration-500`}
                                                    style={{
                                                        width: `${progressLoading ? 0 : unitProgressValue}%`,
                                                    }}
                                                />

                                            </div>

                                            <p className="mt-2 text-xs font-medium text-slate-500">

                                                {progressLoading
                                                    ? "Loading..."
                                                    : unitStatus}

                                            </p>

                                        </div>

                                    </div>


                                    {/* ========================= */}
                                    {/* START LEARNING BUTTON */}
                                    {/* ========================= */}

                                    <Link
                                        to={`/student/unit/${unit.id}`}
                                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition ${styles.button}`}
                                    >

                                        <PlayCircle size={17} />


                                        {completed
                                            ? "Review"
                                            : "Start Learning"
                                        }

                                    </Link>

                                </div>

                            </div>

                        );

                    })}


                    {/* ========================= */}
                    {/* NO UNITS */}
                    {/* ========================= */}

                    {units.length === 0 && (

                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                            <BookOpen
                                size={32}
                                className="mx-auto text-slate-400"
                            />


                            <p className="mt-3 font-medium text-slate-700">

                                No units available

                            </p>


                            <p className="mt-1 text-sm text-slate-500">

                                Units for this subject have not been added yet.

                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}


export default StudyPage;