import { ArrowRight, MessageSquare, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

import subjects from "../../data/subjects";


const SubjectsSection = () => {

    // Dashboard only shows the first 4 subjects
    const dashboardSubjects = subjects.slice(0, 4);

    return (
        <section>

            {/* Section Header */}
            <div className="mb-4 flex items-center justify-between">

                <h2 className="text-lg font-semibold text-gray-900">
                    My Subjects
                </h2>

                {/* View All */}
                <Link
                    to="/student/subjects"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                    View all
                    <ArrowRight size={16} />
                </Link>

            </div>


            {/* Subject Cards */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                {dashboardSubjects.map((subject) => {

                    const colorStyles = {
                        blue: {
                            icon: "bg-blue-100 text-blue-600",
                            progress: "bg-blue-600",
                            ask: "border-blue-600 text-blue-600 hover:bg-blue-50",
                            continue: "bg-blue-600 hover:bg-blue-700",
                        },

                        green: {
                            icon: "bg-emerald-100 text-emerald-600",
                            progress: "bg-emerald-500",
                            ask: "border-emerald-500 text-emerald-600 hover:bg-emerald-50",
                            continue: "bg-emerald-500 hover:bg-emerald-600",
                        },

                        orange: {
                            icon: "bg-orange-100 text-orange-600",
                            progress: "bg-orange-500",
                            ask: "border-orange-500 text-orange-600 hover:bg-orange-50",
                            continue: "bg-orange-500 hover:bg-orange-600",
                        },

                        purple: {
                            icon: "bg-purple-100 text-purple-600",
                            progress: "bg-purple-500",
                            ask: "border-purple-500 text-purple-600 hover:bg-purple-50",
                            continue: "bg-purple-500 hover:bg-purple-600",
                        },
                    };

                    const styles = colorStyles[subject.color];


                    return (
                        <div
                            key={subject.id}
                            className="rounded-2xl border border-gray-200 bg-white p-5"
                        >

                            {/* Subject Information */}
                            <div className="flex items-start gap-3">

                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold ${styles.icon}`}
                                >
                                    {subject.shortName}
                                </div>


                                <div className="min-w-0">

                                    <h3 className="text-sm font-medium text-gray-900">
                                        {subject.name}
                                    </h3>


                                    <p className="mt-1 text-xs text-gray-500">
                                        {subject.units} Units · {subject.questions} Questions
                                    </p>

                                </div>

                            </div>


                            {/* Progress */}
                            <div className="mt-5">

                                <div className="mb-2 flex items-center justify-between">

                                    <span className="text-xs text-gray-500">
                                        Progress
                                    </span>


                                    <span
                                        className={`text-xs font-medium ${styles.icon.split(" ")[1]}`}
                                    >
                                        {subject.progress}%
                                    </span>

                                </div>


                                <div className="h-1.5 rounded-full bg-gray-100">

                                    <div
                                        className={`h-1.5 rounded-full ${styles.progress}`}
                                        style={{
                                            width: `${subject.progress}%`,
                                        }}
                                    />

                                </div>

                            </div>


                            {/* Actions */}
                            <div className="mt-4 grid grid-cols-3 gap-2">

                                {/* Ask AI */}
                                <Link
                                    to={`/student/chat/${subject.id}`}
                                    className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-medium transition ${styles.ask}`}
                                >
                                    <MessageSquare size={14} />

                                    Ask AI
                                </Link>


                                {/* Quiz */}
                                <Link
                                    to={`/student/quiz/${subject.id}`}
                                    className="flex items-center justify-center gap-1 rounded-lg border border-gray-300 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    <ClipboardCheck size={14} />

                                    Quiz
                                </Link>


                                {/* Continue / Study */}
                                <Link
                                    to={`/student/study/${subject.id}`}
                                    className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-white transition ${styles.continue}`}
                                >
                                    Continue

                                    <ArrowRight size={14} />
                                </Link>

                            </div>

                        </div>
                    );
                })}

            </div>

        </section>
    );
};


export default SubjectsSection;