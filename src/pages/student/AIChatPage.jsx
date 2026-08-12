import {
    ArrowLeft,
    MessageSquare,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import subjects from "../../data/subjects";


function AIChatPage() {

    // Get subject ID from URL
    const { subjectId } = useParams();


    // Find subject from shared data
    const subject = subjects.find(
        (item) => item.id === subjectId
    );


    // Subject not found
    if (!subject) {

        return (
            <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                    <h1 className="text-2xl font-bold text-slate-900">
                        Subject Not Found
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        The subject you are trying to access does not exist.
                    </p>

                    <Link
                        to="/student/subjects"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Back to Subjects
                    </Link>

                </div>

            </div>
        );
    }


    return (
        <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

            {/* Back */}
            <Link
                to="/student/subjects"
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
                <ArrowLeft size={17} />
                Back to Subjects
            </Link>


            {/* Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <MessageSquare size={25} />
                    </div>

                    <div>

                        <p className="text-sm text-slate-500">
                            AI Tutor
                        </p>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Ask AI about {subject.name}
                        </h1>

                    </div>

                </div>

            </div>


            {/* Chat Area */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <MessageSquare size={28} />
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-slate-900">
                        AI Chat
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Ask questions about {subject.name}.
                        The real AI API will be connected later.
                    </p>

                    <div className="mt-6 w-full max-w-xl">

                        <input
                            type="text"
                            placeholder={`Ask something about ${subject.name}...`}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />

                    </div>

                </div>

            </div>

        </div>
    );
}


export default AIChatPage;