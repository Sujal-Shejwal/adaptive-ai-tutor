import {
    ArrowLeft,
    BookOpen,
    CheckCircle,
    FileText,
    Loader2,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";


function TopicLearningPage() {

    const { topicId } = useParams();

    const [topic, setTopic] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        const fetchTopic = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await fetch(
                    `http://localhost:8080/api/topics/${topicId}`
                );


                if (!response.ok) {

                    throw new Error(
                        "Failed to fetch topic."
                    );

                }


                const data = await response.json();

                setTopic(data);

            } catch (error) {

                console.error(
                    "Error fetching topic:",
                    error
                );

                setError(
                    "Unable to load topic. Please try again."
                );

            } finally {

                setLoading(false);

            }

        };


        if (topicId) {

            fetchTopic();

        }

    }, [topicId]);


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                    <Loader2
                        size={32}
                        className="mx-auto animate-spin text-blue-600"
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading topic...
                    </p>

                </div>

            </div>

        );

    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (

            <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

                    <p className="text-sm text-red-600">
                        {error}
                    </p>

                </div>

            </div>

        );

    }


    // =========================
    // TOPIC NOT FOUND
    // =========================

    if (!topic) {

        return (

            <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                    <p className="text-sm text-slate-500">
                        Topic not found.
                    </p>

                </div>

            </div>

        );

    }


    // =========================
    // MAIN PAGE
    // =========================

    return (

        <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">


            {/* ========================= */}
            {/* BACK */}
            {/* ========================= */}

            <Link
                to={`/student/unit/${topic.unit?.id}`}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >

                <ArrowLeft size={17} />

                Back to Unit

            </Link>



            {/* ========================= */}
            {/* TOPIC HEADER */}
            {/* ========================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-start gap-4">


                    {/* Icon */}

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                        <BookOpen size={28} />

                    </div>



                    {/* Topic information */}

                    <div className="flex-1">

                        <p className="text-sm font-medium text-blue-600">

                            Topic {topic.topicNumber}

                        </p>


                        <h1 className="mt-1 text-2xl font-bold text-slate-900">

                            {topic.title}

                        </h1>


                        {topic.unit && (

                            <p className="mt-2 text-sm text-slate-500">

                                Unit {topic.unit.unitNumber}
                                {" · "}
                                {topic.unit.title}

                            </p>

                        )}

                    </div>


                </div>

            </div>



            {/* ========================= */}
            {/* TOPIC DESCRIPTION */}
            {/* ========================= */}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">

                        <FileText size={20} />

                    </div>


                    <h2 className="text-lg font-bold text-slate-900">

                        About This Topic

                    </h2>

                </div>


                <p className="mt-5 text-sm leading-7 text-slate-600">

                    {topic.description ||
                        "No description has been added for this topic yet."}

                </p>

            </div>



            {/* ========================= */}
            {/* LEARNING CONTENT */}
            {/* ========================= */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                <div className="text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600">

                        <BookOpen size={26} />

                    </div>


                    <h2 className="mt-5 text-lg font-bold text-slate-900">

                        Learning Content

                    </h2>


                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">

                        Detailed learning material for this topic will
                        be added here. This section will contain notes,
                        explanations, examples, and other learning
                        resources.

                    </p>

                </div>

            </div>



            {/* ========================= */}
            {/* COMPLETION */}
            {/* ========================= */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between gap-4">

                    <div>

                        <h2 className="text-base font-semibold text-slate-900">

                            Topic Progress

                        </h2>


                        <p className="mt-1 text-sm text-slate-500">

                            Complete this topic after studying the
                            learning material.

                        </p>

                    </div>


                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >

                        <CheckCircle size={17} />

                        Mark Complete

                    </button>

                </div>

            </div>


        </div>

    );

}


export default TopicLearningPage;