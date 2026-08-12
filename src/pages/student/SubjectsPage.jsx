import {
    BookOpen,
    MessageSquare,
    ClipboardCheck,
    ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

import subjects from "../../data/subjects";


const colorStyles = {
    blue: {
        icon: "bg-blue-100 text-blue-600",
        progress: "bg-blue-600",
        button: "border-blue-500 text-blue-600 hover:bg-blue-50",
        study: "bg-blue-600 hover:bg-blue-700",
    },

    green: {
        icon: "bg-green-100 text-green-600",
        progress: "bg-green-500",
        button: "border-green-500 text-green-600 hover:bg-green-50",
        study: "bg-green-500 hover:bg-green-600",
    },

    orange: {
        icon: "bg-orange-100 text-orange-600",
        progress: "bg-orange-500",
        button: "border-orange-500 text-orange-600 hover:bg-orange-50",
        study: "bg-orange-500 hover:bg-orange-600",
    },

    purple: {
        icon: "bg-purple-100 text-purple-600",
        progress: "bg-purple-500",
        button: "border-purple-500 text-purple-600 hover:bg-purple-50",
        study: "bg-purple-500 hover:bg-purple-600",
    },
};


function SubjectsPage() {

    return (
        <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

            {/* Page Header */}
            <div className="mb-8">

                <h1 className="text-3xl font-bold text-slate-900">
                    My Subjects
                </h1>

                <p className="mt-2 text-slate-500">
                    Select a subject to view units, notes, and start learning.
                </p>

            </div>


            {/* Subject Cards */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                {subjects.map((subject) => {

                    const styles = colorStyles[subject.color];

                    return (
                        <div
                            key={subject.id}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                        >

                            {/* Card Header */}
                            <div className="flex items-start gap-4">

                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${styles.icon}`}
                                >
                                    {subject.shortName}
                                </div>


                                <div className="flex-1">

                                    <h2 className="text-lg font-semibold text-slate-900">
                                        {subject.name}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {subject.units} Units · {subject.topics} Topics
                                    </p>

                                </div>

                            </div>


                            {/* Description */}
                            <p className="mt-5 text-sm leading-6 text-slate-500">
                                {subject.description}
                            </p>


                            {/* Progress */}
                            <div className="mt-6">

                                <div className="mb-2 flex items-center justify-between">

                                    <span className="text-sm font-medium text-slate-600">
                                        Progress
                                    </span>

                                    <span className="text-sm font-semibold text-slate-900">
                                        {subject.progress}%
                                    </span>

                                </div>


                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className={`h-full rounded-full ${styles.progress}`}
                                        style={{
                                            width: `${subject.progress}%`,
                                        }}
                                    />

                                </div>

                            </div>


                            {/* Actions */}
                            <div className="mt-6 flex gap-3">

                                {/* ASK AI */}
                                <Link
                                    to={`/student/chat/${subject.id}`}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${styles.button}`}
                                >
                                    <MessageSquare size={17} />
                                    Ask AI
                                </Link>


                                {/* QUIZ */}
                                <Link
                                    to={`/student/quiz/${subject.id}`}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    <ClipboardCheck size={17} />
                                    Quiz
                                </Link>


                                {/* STUDY */}
                                <Link
                                    to={`/student/study/${subject.id}`}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition ${styles.study}`}
                                >
                                    <BookOpen size={17} />

                                    Study

                                    <ArrowRight size={16} />
                                </Link>

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}


export default SubjectsPage;