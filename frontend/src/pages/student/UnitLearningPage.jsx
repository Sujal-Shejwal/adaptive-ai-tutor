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


    const [topics, setTopics] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");



    // =========================
    // FETCH TOPICS
    // =========================

    useEffect(() => {

        const fetchTopics = async () => {

            try {

                setLoading(true);

                setError("");


                const response = await fetch(
                    `http://localhost:8080/api/topics/unit/${unitId}`
                );


                if (!response.ok) {

                    throw new Error(
                        "Failed to fetch topics."
                    );

                }


                const data = await response.json();

                setTopics(data);

            } catch (error) {

                console.error(
                    "Error fetching topics:",
                    error
                );

                setError(
                    "Unable to load topics. Please try again."
                );

            } finally {

                setLoading(false);

            }

        };


        if (unitId) {

            fetchTopics();

        }

    }, [unitId]);



    return (

        <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">


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

                <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                        <BookOpen size={28} />

                    </div>


                    <div>

                        <p className="text-sm font-medium text-blue-600">

                            Unit {unitId}

                        </p>


                        <h1 className="mt-1 text-2xl font-bold text-slate-900">

                            Introduction to Data Structures

                        </h1>


                        <p className="mt-1 text-sm text-slate-500">

                            {topics.length} Topics

                        </p>

                    </div>

                </div>

            </div>



            {/* ========================= */}
            {/* TOPIC SUMMARY */}
            {/* ========================= */}

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">


                {/* Topics */}

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

                                {topics.length}

                            </p>

                        </div>

                    </div>

                </div>



                {/* Learning Status */}

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

                                Not Started

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



                {/* ========================= */}
                {/* LOADING */}
                {/* ========================= */}

                {loading && (

                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                        <Loader2
                            size={28}
                            className="mx-auto animate-spin text-blue-600"
                        />


                        <p className="mt-3 text-sm text-slate-500">

                            Loading topics...

                        </p>

                    </div>

                )}



                {/* ========================= */}
                {/* ERROR */}
                {/* ========================= */}

                {!loading && error && (

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

                        <p className="text-sm text-red-600">

                            {error}

                        </p>

                    </div>

                )}



                {/* ========================= */}
                {/* EMPTY */}
                {/* ========================= */}

                {!loading &&
                    !error &&
                    topics.length === 0 && (

                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                            <FileText
                                size={40}
                                className="mx-auto text-slate-300"
                            />


                            <h3 className="mt-4 text-base font-semibold text-slate-900">

                                No topics available

                            </h3>


                            <p className="mt-2 text-sm text-slate-500">

                                Topics for this unit have not
                                been added yet.

                            </p>

                        </div>

                    )}



                {/* ========================= */}
                {/* TOPIC CARDS */}
                {/* ========================= */}

                {!loading &&
                    !error &&
                    topics.length > 0 && (

                        <div className="space-y-4">

                            {topics.map(
                                (topic, index) => (

                                    <Link
                                        key={topic.id}
                                        to={`/student/topic/${topic.id}`}
                                        className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                    >

                                        <div className="flex items-center justify-between gap-4">


                                            {/* LEFT */}

                                            <div className="flex items-center gap-4">

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                                                    <FileText
                                                        size={21}
                                                    />

                                                </div>


                                                <div>

                                                    <p className="text-xs font-medium text-slate-400">

                                                        Topic{" "}
                                                        {topic.topicNumber ||
                                                            index + 1}

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

                                            <CheckCircle
                                                size={21}
                                                className="shrink-0 text-slate-300"
                                            />

                                        </div>

                                    </Link>

                                )
                            )}

                        </div>

                    )}

            </div>


        </div>

    );

}


export default UnitLearningPage;