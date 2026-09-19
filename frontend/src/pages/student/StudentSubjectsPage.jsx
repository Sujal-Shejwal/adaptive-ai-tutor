import { useEffect, useState } from "react";
import { BookOpen, MessageSquare, ClipboardCheck, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function StudentSubjectsPage() {
    const navigate = useNavigate();

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadSubjects = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_BASE}/api/subjects`
                );

                const data = await response
                    .json()
                    .catch(() => []);

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Failed to load subjects."
                    );
                }

                if (!cancelled) {
                    setSubjects(
                        Array.isArray(data) ? data : []
                    );
                }
            } catch (loadError) {
                console.error(
                    "Student subjects loading error:",
                    loadError
                );

                if (!cancelled) {
                    setError(
                        loadError?.message ||
                        "Unable to load subjects."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadSubjects();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">
                <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                    <Loader2
                        size={28}
                        className="mx-auto animate-spin text-blue-600"
                    />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading subjects...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">
                <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8">
                    <h1 className="text-lg font-semibold text-red-700">
                        Unable to load subjects
                    </h1>

                    <p className="mt-2 text-sm text-red-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        My Subjects
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Select a subject to start learning.
                    </p>
                </div>

                {subjects.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <BookOpen
                            size={32}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-4 text-sm font-medium text-slate-700">
                            No subjects available
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            Ask your teacher to create a subject.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {subjects.map((subject) => {
                            const safeId =
                                encodeURIComponent(
                                    String(subject?.id ?? "")
                                );

                            return (
                                <div
                                    key={subject.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                            <BookOpen
                                                size={23}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                {subject.name}
                                            </h2>

                                            <p className="mt-1 text-sm font-medium text-blue-600">
                                                {subject.code || "SUBJECT"}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-5 text-sm leading-6 text-slate-500">
                                        {subject.description ||
                                            "Learn and practice this subject with your AI tutor."}
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/student/chat/${safeId}`
                                                )
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                                        >
                                            <MessageSquare
                                                size={16}
                                            />
                                            Ask AI
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/student/quiz/${safeId}`
                                                )
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                        >
                                            <ClipboardCheck
                                                size={16}
                                            />
                                            Quiz
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/student/chat/${safeId}`
                                                )
                                            }
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                                        >
                                            Start Learning
                                            <ArrowRight
                                                size={16}
                                            />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
