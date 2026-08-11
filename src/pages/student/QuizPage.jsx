import {
    ArrowLeft,
    CheckCircle2,
    ClipboardCheck,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

import subjects from "../../data/subjects";


function QuizPage() {
    const { subjectId } = useParams();

    const subject = subjects.find(
        (item) => item.id === subjectId
    );


    if (!subject) {
        return (
            <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

                <h1 className="text-2xl font-bold text-slate-900">
                    Subject Not Found
                </h1>

                <Link
                    to="/student/subjects"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white"
                >
                    <ArrowLeft size={16} />
                    Back to Subjects
                </Link>

            </div>
        );
    }


    return (
        <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

            {/* Back */}
            <Link
                to="/student/subjects"
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
            >
                <ArrowLeft size={17} />
                Back to Subjects
            </Link>


            {/* Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600">
                        <ClipboardCheck size={25} />
                    </div>

                    <div>

                        <p className="text-sm text-slate-500">
                            Practice Quiz
                        </p>

                        <h1 className="text-2xl font-bold text-slate-900">
                            {subject.name} Quiz
                        </h1>

                    </div>

                </div>

            </div>


            {/* Quiz Placeholder */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle2 size={28} />
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-slate-900">
                        Quiz Coming Next
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        The quiz system for {subject.name} will be
                        implemented in the next development stage.
                    </p>

                </div>

            </div>

        </div>
    );
}


export default QuizPage;