import {
    BookOpen,
    Plus,
    Loader2,
    Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


function TeacherUnitsPage() {

    const { subjectId } = useParams();

    const navigate = useNavigate();

    const [units, setUnits] = useState([]);

    const [subject, setSubject] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [creating, setCreating] = useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [formData, setFormData] = useState({
        title: "",
        unitNumber: "",
        topics: "",
    });


    // =========================
    // FETCH SUBJECT
    // =========================

    const fetchSubject = async () => {

        try {

            const response = await fetch(
                `http://localhost:8080/api/subjects/${subjectId}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch subject.");
            }

            const data = await response.json();

            setSubject(data);

        } catch (error) {

            console.error(
                "Error fetching subject:",
                error
            );

            setError(
                "Unable to load subject."
            );

        }
    };


    // =========================
    // FETCH UNITS
    // =========================

    const fetchUnits = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `http://localhost:8080/api/units/subject/${subjectId}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch units.");
            }

            const data = await response.json();

            setUnits(data);

        } catch (error) {

            console.error(
                "Error fetching units:",
                error
            );

            setError(
                "Unable to load units. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchSubject();
        fetchUnits();

    }, [subjectId]);


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
    // CREATE UNIT
    // =========================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setCreating(true);
        setError("");

        try {

            const response = await fetch(
                "http://localhost:8080/api/units",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        title: formData.title,
                        unitNumber: Number(formData.unitNumber),
                        topics: Number(formData.topics),
                        subject: {
                            id: Number(subjectId),
                        },
                    }),
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to create unit."
                );

            }


            const createdUnit =
                await response.json();


            setUnits((previous) => [
                ...previous,
                createdUnit,
            ]);


            setFormData({
                title: "",
                unitNumber: "",
                topics: "",
            });


            setShowForm(false);


        } catch (error) {

            console.error(
                "Error creating unit:",
                error
            );

            setError(
                "Unable to create unit. Please try again."
            );

        } finally {

            setCreating(false);

        }

    };


    // =========================
    // DELETE UNIT
    // =========================

    const handleDeleteUnit = async (
        unit
    ) => {

        if (!unit?.id) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete "${unit.title}"? This action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        setDeletingId(
            unit.id
        );

        setError("");

        try {

            const response =
                await fetch(
                    `http://localhost:8080/api/units/${unit.id}`,
                    {
                        method: "DELETE",
                    }
                );

            const responseText =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText ||
                    `Failed to delete unit (${response.status}).`
                );
            }

            setUnits(
                (previous) =>
                    previous.filter(
                        (item) =>
                            item.id !==
                            unit.id
                    )
            );

        } catch (deleteError) {

            console.error(
                "Error deleting unit:",
                deleteError
            );

            setError(
                deleteError.message ||
                "Unable to delete unit. Please try again."
            );

        } finally {

            setDeletingId(
                null
            );
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
                            navigate("/teacher/subjects")
                        }
                        className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        ← Back to Subjects
                    </button>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Manage Units
                    </h1>

                    <p className="mt-2 text-slate-500">
                        {subject
                            ? `Manage units for ${subject.name}.`
                            : "Create and manage units for this subject."
                        }
                    </p>

                </div>


                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >

                    <Plus size={18} />

                    Add Unit

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
                            Create New Unit
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Add a unit to this subject.
                        </p>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* UNIT TITLE */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Unit Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Introduction to Data Structures"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* UNIT NUMBER */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Unit Number
                            </label>

                            <input
                                type="number"
                                name="unitNumber"
                                value={formData.unitNumber}
                                onChange={handleChange}
                                placeholder="e.g. 1"
                                min="1"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* TOPICS */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Number of Topics
                            </label>

                            <input
                                type="number"
                                name="topics"
                                value={formData.topics}
                                onChange={handleChange}
                                placeholder="e.g. 5"
                                min="0"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                        unitNumber: "",
                                        topics: "",
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
                                    : "Create Unit"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ========================= */}
            {/* UNITS */}
            {/* ========================= */}

            <div>

                <div className="mb-5">

                    <h2 className="text-xl font-bold text-slate-900">
                        Units
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Units currently available for this subject.
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
                            Loading units...
                        </p>

                    </div>

                )}


                {/* EMPTY */}

                {!loading &&
                    units.length === 0 && (

                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                            <BookOpen
                                size={40}
                                className="mx-auto text-slate-300"
                            />

                            <h3 className="mt-4 text-base font-semibold text-slate-900">
                                No units yet
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Create the first unit for this subject.
                            </p>

                        </div>

                    )}


                {/* UNIT LIST */}

                {!loading &&
                    units.length > 0 && (

                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                            {units.map((unit) => (

                                <div
                                    key={unit.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div className="flex min-w-0 items-start gap-4">

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                                                <BookOpen size={23} />

                                            </div>


                                            <div className="min-w-0">

                                                <p className="text-sm font-medium text-blue-600">
                                                    Unit {unit.unitNumber}
                                                </p>

                                                <h3 className="mt-1 break-words text-lg font-semibold text-slate-900">
                                                    {unit.title}
                                                </h3>

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteUnit(
                                                    unit
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                unit.id
                                            }
                                            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            title="Delete unit"
                                        >

                                            {deletingId ===
                                            unit.id ? (

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


                                    <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">

                                        <span className="text-sm text-slate-500">
                                            Topics: {unit.topics}
                                        </span>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/teacher/topics/${unit.id}`
                                                )
                                            }
                                            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
                                        >
                                            Manage Topics →
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

            </div>

        </div>

    );

}


export default TeacherUnitsPage;