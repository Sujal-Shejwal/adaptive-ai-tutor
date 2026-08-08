import { ArrowRight } from "lucide-react";

const SubjectsSection = () => {
    const subjects = [
        {
            name: "Database Management System",
            shortName: "DBMS",
            units: 8,
            questions: 124,
            progress: 68,
            color: "blue",
        },
        {
            name: "Operating System",
            shortName: "OS",
            units: 10,
            questions: 98,
            progress: 52,
            color: "green",
        },
        {
            name: "Computer Networks",
            shortName: "CN",
            units: 9,
            questions: 87,
            progress: 41,
            color: "orange",
        },
        {
            name: "Java Programming",
            shortName: "JAVA",
            units: 12,
            questions: 156,
            progress: 75,
            color: "purple",
        },
    ];

    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    My Subjects
                </h2>

                <button className="flex items-center gap-1 text-sm font-medium text-blue-600">
                    View all
                    <ArrowRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {subjects.map((subject) => (
                    <div
                        key={subject.name}
                        className="rounded-2xl border border-gray-200 bg-white p-5"
                    >
                        {/* Subject information */}
                        <div className="flex items-start gap-3">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold ${
                                    subject.color === "blue"
                                        ? "bg-blue-100 text-blue-600"
                                        : subject.color === "green"
                                        ? "bg-emerald-100 text-emerald-600"
                                        : subject.color === "orange"
                                        ? "bg-orange-100 text-orange-600"
                                        : "bg-purple-100 text-purple-600"
                                }`}
                            >
                                {subject.shortName}
                            </div>

                            <div>
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
                                    className={`text-xs font-medium ${
                                        subject.color === "blue"
                                            ? "text-blue-600"
                                            : subject.color === "green"
                                            ? "text-emerald-600"
                                            : subject.color === "orange"
                                            ? "text-orange-600"
                                            : "text-purple-600"
                                    }`}
                                >
                                    {subject.progress}%
                                </span>
                            </div>

                            <div className="h-1.5 rounded-full bg-gray-100">
                                <div
                                    className={`h-1.5 rounded-full ${
                                        subject.color === "blue"
                                            ? "bg-blue-600"
                                            : subject.color === "green"
                                            ? "bg-emerald-500"
                                            : subject.color === "orange"
                                            ? "bg-orange-500"
                                            : "bg-purple-500"
                                    }`}
                                    style={{
                                        width: `${subject.progress}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                                className={`rounded-lg border py-2 text-xs font-medium ${
                                    subject.color === "blue"
                                        ? "border-blue-600 text-blue-600"
                                        : subject.color === "green"
                                        ? "border-emerald-500 text-emerald-600"
                                        : subject.color === "orange"
                                        ? "border-orange-500 text-orange-600"
                                        : "border-purple-500 text-purple-600"
                                }`}
                            >
                                Ask AI
                            </button>

                            <button
                                className={`rounded-lg py-2 text-xs font-medium text-white ${
                                    subject.color === "blue"
                                        ? "bg-blue-600"
                                        : subject.color === "green"
                                        ? "bg-emerald-500"
                                        : subject.color === "orange"
                                        ? "bg-orange-500"
                                        : "bg-purple-500"
                                }`}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SubjectsSection;