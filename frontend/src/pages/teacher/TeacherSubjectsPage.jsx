import {
    BookOpen,
    Plus,
    Trash2,
    Loader2,
} from "lucide-react";

import { useEffect, useState } from "react";


function TeacherSubjectsPage() {

    const [subjects, setSubjects] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [creating, setCreating] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
    });


    // =========================
    // FETCH SUBJECTS
    // =========================

    const fetchSubjects = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/api/subjects"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch subjects.");
            }

            const data = await response.json();

            setSubjects(data);

        } catch (error) {

            console.error(
                "Error fetching subjects:",
                error
            );

            setError(
                "Unable to load subjects. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchSubjects();

    }, []);


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
    // CREATE SUBJECT
    // =========================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setCreating(true);
        setError("");


        try {

            const response = await fetch(
                "http://localhost:8080/api/subjects",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(formData),
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to create subject."
                );

            }


            const createdSubject =
                await response.json();


            // Add new subject immediately
            setSubjects((previous) => [
                ...previous,
                createdSubject,
            ]);


            // Reset form
            setFormData({
                name: "",
                code: "",
                description: "",
            });


            setShowForm(false);


        } catch (error) {

            console.error(
                "Error creating subject:",
                error
            );

            setError(
                "Unable to create subject. Please try again."
            );

        } finally {

            setCreating(false);

        }

    };


    return (

        <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">


            {/* ========================= */}
            {/* PAGE HEADER */}
            {/* ========================= */}

            <div className="mb-8 flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Manage Subjects
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Create and manage subjects for students.
                    </p>

                </div>


                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >

                    <Plus size={18} />

                    Add Subject

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
                            Create New Subject
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Add a subject that students can learn.
                        </p>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >


                        {/* NAME */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Subject Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Data Structures"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* CODE */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Subject Code
                            </label>

                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="e.g. DS"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                        name: "",
                                        code: "",
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
                                    : "Create Subject"}

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ========================= */}
            {/* SUBJECT LIST */}
            {/* ========================= */}

            <div>

                <div className="mb-5">

                    <h2 className="text-xl font-bold text-slate-900">
                        Subjects
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Subjects currently available on the platform.
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
                            Loading subjects...
                        </p>

                    </div>

                )}


                {/* EMPTY */}

                {!loading &&
                    subjects.length === 0 && (

                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                            <BookOpen
                                size={40}
                                className="mx-auto text-slate-300"
                            />

                            <h3 className="mt-4 text-base font-semibold text-slate-900">
                                No subjects yet
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Create your first subject to get started.
                            </p>

                        </div>

                    )}


                {/* SUBJECTS */}

                {!loading &&
                    subjects.length > 0 && (

                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                            {subjects.map((subject) => (

                                <div
                                    key={subject.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div className="flex items-start gap-4">

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                                                <BookOpen size={23} />

                                            </div>


                                            <div>

                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    {subject.name}
                                                </h3>

                                                <p className="mt-1 text-sm font-medium text-blue-600">
                                                    {subject.code}
                                                </p>

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                            title="Delete subject"
                                        >

                                            <Trash2 size={18} />

                                        </button>

                                    </div>


                                    <p className="mt-5 text-sm leading-6 text-slate-500">
                                        {subject.description}
                                    </p>


                                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                                        <span className="text-sm text-slate-500">
                                            Subject ID: {subject.id}
                                        </span>


                                        <span className="text-sm font-medium text-slate-700">
                                            Manage Units →
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


export default TeacherSubjectsPage;