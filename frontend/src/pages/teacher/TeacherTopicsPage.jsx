import {
    BookOpen,
    Plus,
    Loader2,
    Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


function TeacherTopicsPage() {

    const { unitId } = useParams();

    const navigate = useNavigate();

    const [topics, setTopics] = useState([]);

    const [unit, setUnit] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [creating, setCreating] = useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [formData, setFormData] = useState({
        title: "",
        topicNumber: "",
        description: "",
    });


    // =========================
    // FETCH UNIT
    // =========================

    const fetchUnit = async () => {

        try {

            const response = await fetch(
                `http://localhost:8080/api/units/${unitId}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch unit.");
            }

            const data = await response.json();

            setUnit(data);

        } catch (error) {

            console.error(
                "Error fetching unit:",
                error
            );

            setError(
                "Unable to load unit."
            );

        }
    };


    // =========================
    // FETCH TOPICS
    // =========================

    const fetchTopics = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `http://localhost:8080/api/topics/unit/${unitId}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch topics.");
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


    useEffect(() => {

        fetchUnit();
        fetchTopics();

    }, [unitId]);


    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

    };


    // =========================
    // CREATE TOPIC
    // =========================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setCreating(true);
        setError("");

        try {

            const response = await fetch(
                "http://localhost:8080/api/topics",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        title: formData.title,
                        topicNumber: Number(
                            formData.topicNumber
                        ),
                        description: formData.description,
                        unit: {
                            id: Number(unitId),
                        },
                    }),
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to create topic."
                );

            }


            const createdTopic =
                await response.json();


            setTopics((previous) => [
                ...previous,
                createdTopic,
            ]);


            setFormData({
                title: "",
                topicNumber: "",
                description: "",
            });


            setShowForm(false);


        } catch (error) {

            console.error(
                "Error creating topic:",
                error
            );

            setError(
                "Unable to create topic. Please try again."
            );

        } finally {

            setCreating(false);

        }

    };


    // =========================
    // DELETE TOPIC
    // =========================

    const handleDeleteTopic = async (
        topic
    ) => {

        if (!topic?.id) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete "${topic.title}"? This action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        setDeletingId(topic.id);
        setError("");

        try {

            const response =
                await fetch(
                    `http://localhost:8080/api/topics/${topic.id}`,
                    {
                        method: "DELETE",
                    }
                );

            const responseText =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText ||
                    `Failed to delete topic (${response.status}).`
                );
            }

            setTopics(
                (previous) =>
                    previous.filter(
                        (item) =>
                            item.id !==
                            topic.id
                    )
            );

        } catch (deleteError) {

            console.error(
                "Error deleting topic:",
                deleteError
            );

            setError(
                deleteError.message ||
                "Unable to delete topic. Please try again."
            );

        } finally {

            setDeletingId(null);
        }
    };


    return (

        <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">


            {/* ========================= */}
            {/* PAGE HEADER */}
            {/* ========================= */}

            <div className="mb-8 flex items-center justify-between">

                <div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        ← Back to Units
                    </button>


                    <h1 className="text-3xl font-bold text-slate-900">
                        Manage Topics
                    </h1>


                    <p className="mt-2 text-slate-500">

                        {unit
                            ? `Manage topics for ${unit.title}.`
                            : "Create and manage topics for this unit."
                        }

                    </p>

                </div>


                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >

                    <Plus size={18} />

                    Add Topic

                </button>

            </div>


            {/* ========================= */}
            {/* ERROR */}
            {/* ========================= */}

            {error && (

                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

                    <p className="text-sm text-red-600">
                        {error}
                    </p>

                </div>

            )}


            {/* ========================= */}
            {/* CREATE FORM */}
            {/* ========================= */}

            {showForm && (

                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="mb-6">

                        <h2 className="text-xl font-semibold text-slate-900">
                            Create New Topic
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Add a topic to this unit.
                        </p>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >


                        {/* TOPIC TITLE */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Topic Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Introduction to Software Process"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* TOPIC NUMBER */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Topic Number
                            </label>

                            <input
                                type="number"
                                name="topicNumber"
                                value={formData.topicNumber}
                                onChange={handleChange}
                                placeholder="e.g. 1"
                                min="1"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* DESCRIPTION */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe what students will learn..."
                                rows="4"
                                required
                                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* BUTTONS */}

                        <div className="flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() => {

                                    setShowForm(false);

                                    setFormData({
                                        title: "",
                                        topicNumber: "",
                                        description: "",
                                    });

                                }}
                                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                disabled={creating}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {creating && (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                )}


                                {creating
                                    ? "Creating..."
                                    : "Create Topic"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ========================= */}
            {/* TOPIC LIST */}
            {/* ========================= */}

            <div>

                <div className="mb-5">

                    <h2 className="text-xl font-bold text-slate-900">
                        Topics
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Topics currently available for this unit.
                    </p>

                </div>


                {/* LOADING */}

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


                {/* EMPTY */}

                {!loading &&
                    topics.length === 0 && (

                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                            <BookOpen
                                size={40}
                                className="mx-auto text-slate-300"
                            />

                            <h3 className="mt-4 text-base font-semibold text-slate-900">
                                No topics yet
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Create the first topic for this unit.
                            </p>

                        </div>

                    )}


                {/* TOPICS */}

                {!loading &&
                    topics.length > 0 && (

                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                            {topics.map((topic) => (

                                <div
                                    key={topic.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div className="flex min-w-0 items-start gap-4">

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                                                <BookOpen size={23} />

                                            </div>


                                            <div className="min-w-0">

                                                <p className="text-sm font-medium text-blue-600">
                                                    Topic {topic.topicNumber}
                                                </p>

                                                <h3 className="mt-1 break-words text-lg font-semibold text-slate-900">
                                                    {topic.title}
                                                </h3>

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteTopic(
                                                    topic
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                topic.id
                                            }
                                            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            title="Delete topic"
                                        >

                                            {deletingId ===
                                            topic.id ? (

                                                <Loader2
                                                    size={18}
                                                    className="animate-spin"
                                                />

                                            ) : (

                                                <Trash2
                                                    size={18}
                                                />

                                            )}

                                        </button>

                                    </div>


                                    <p className="mt-5 text-sm leading-6 text-slate-500">
                                        {topic.description}
                                    </p>


                                    <div className="mt-5 border-t border-slate-100 pt-4">

                                        <span className="text-sm text-slate-500">
                                            Topic ID: {topic.id}
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

            </div>

        </div>

    );

}


export default TeacherTopicsPage;