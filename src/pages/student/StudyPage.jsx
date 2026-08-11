import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock3,
    FileText,
    PlayCircle,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

import subjects from "../../data/subjects";


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


function StudyPage() {

    // Get subject ID from URL
    const { subjectId } = useParams();


    // Find matching subject from shared data
    const subject = subjects.find(
        (item) => item.id === subjectId
    );


    // If subject doesn't exist
    if (!subject) {
        return (
            <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

                <div className="rounded-2xl border border-slate-200 bg-white p-8">

                    <h1 className="text-2xl font-bold text-slate-900">
                        Subject Not Found
                    </h1>

                    <p className="mt-2 text-slate-500">
                        The subject you are trying to access does not exist.
                    </p>

                    <Link
                        to="/student/subjects"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Back to Subjects
                    </Link>

                </div>

            </div>
        );
    }


    const styles = colorStyles[subject.color];


    return (
        <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

            {/* Back Button */}
            <Link
                to="/student/subjects"
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
                <ArrowLeft size={17} />
                Back to Subjects
            </Link>


            {/* Subject Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* Subject Information */}
                    <div className="flex items-center gap-4">

                        <div
                            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${styles.icon}`}
                        >
                            {subject.shortName}
                        </div>


                        <div>

                            <h1 className="text-2xl font-bold text-slate-900">
                                {subject.name}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                {subject.units} Units · {subject.topics} Topics
                            </p>

                        </div>

                    </div>


                    {/* Progress */}
                    <div className="w-full lg:w-72">

                        <div className="mb-2 flex items-center justify-between">

                            <span className="text-sm font-medium text-slate-600">
                                Overall Progress
                            </span>

                            <span className="text-sm font-bold text-slate-900">
                                {subject.progress}%
                            </span>

                        </div>


                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                            <div
                                className={`h-full rounded-full ${styles.progress}`}
                                style={{
                                    width: `${subject.progress}%`,
                                }}
                            ></div>

                        </div>

                    </div>

                </div>

            </div>


            {/* Learning Summary */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

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
                                {subject.units}
                            </p>

                        </div>

                    </div>

                </div>


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
                                {subject.topics}
                            </p>

                        </div>

                    </div>

                </div>


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
                                In Progress
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* Units */}
            <div className="mt-8">

                <div className="mb-4">

                    <h2 className="text-xl font-bold text-slate-900">
                        Course Units
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Select a unit to continue learning.
                    </p>

                </div>


                <div className="space-y-4">

                    {subject.study.units.map((unit, index) => {

                        const completed =
                            index < Math.floor(
                                subject.study.units.length *
                                (subject.progress / 100)
                            );


                        return (
                            <div
                                key={unit.id}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                            >

                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                    {/* Unit Information */}
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
                                                Unit {unit.id}
                                            </p>

                                            <h3 className="mt-1 font-semibold text-slate-900">
                                                {unit.title}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {unit.topics} Topics
                                            </p>

                                        </div>

                                    </div>


                                    {/* Study Button */}
                                    <button
                                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition ${styles.button}`}
                                    >

                                        <PlayCircle size={17} />

                                        {completed
                                            ? "Review"
                                            : "Start Learning"}

                                    </button>

                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>

        </div>
    );
}


export default StudyPage;