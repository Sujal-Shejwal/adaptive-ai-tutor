import {
    Upload,
    FileText,
    Video,
    Plus,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Loader2,
    Trash2,
    ExternalLink,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:8080";

function CreateLearningContentPage() {

    // =====================================================
    // DATA
    // =====================================================

    const [subjects, setSubjects] = useState([]);
    const [units, setUnits] = useState([]);
    const [topics, setTopics] = useState([]);

    // =====================================================
    // SELECTIONS
    // =====================================================

    const [selectedSubjectId, setSelectedSubjectId] =
        useState("");

    const [selectedUnitId, setSelectedUnitId] =
        useState("");

    const [selectedTopicId, setSelectedTopicId] =
        useState("");

    // =====================================================
    // CREATE SUBJECT
    // =====================================================

    const [showNewSubject, setShowNewSubject] =
        useState(false);

    const [subjectName, setSubjectName] =
        useState("");

    const [subjectCode, setSubjectCode] =
        useState("");

    const [subjectDescription, setSubjectDescription] =
        useState("");

    // =====================================================
    // CREATE UNIT
    // =====================================================

    const [showNewUnit, setShowNewUnit] =
        useState(false);

    const [unitTitle, setUnitTitle] =
        useState("");

    const [unitNumber, setUnitNumber] =
        useState("");

    // =====================================================
    // CREATE TOPIC
    // =====================================================

    const [showNewTopic, setShowNewTopic] =
        useState(false);

    const [topicTitle, setTopicTitle] =
        useState("");

    const [topicNumber, setTopicNumber] =
        useState("");

    const [topicDescription, setTopicDescription] =
        useState("");

    // =====================================================
    // PDF
    // =====================================================

    const fileInputRef = useRef(null);

    const [selectedFiles, setSelectedFiles] =
        useState([]);

    // =====================================================
    // VIDEO
    // =====================================================

    const [videoTitle, setVideoTitle] =
        useState("");

    const [videoUrl, setVideoUrl] =
        useState("");

    // =====================================================
    // UI
    // =====================================================

    const [loadingSubjects, setLoadingSubjects] =
        useState(false);

    const [loadingUnits, setLoadingUnits] =
        useState(false);

    const [loadingTopics, setLoadingTopics] =
        useState(false);

    const [savingSubject, setSavingSubject] =
        useState(false);

    const [savingUnit, setSavingUnit] =
        useState(false);

    const [savingTopic, setSavingTopic] =
        useState(false);

    const [savingContent, setSavingContent] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    // =====================================================
    // FETCH SUBJECTS
    // =====================================================

    const fetchSubjects = async () => {

        try {

            setLoadingSubjects(true);

            const response =
                await fetch(
                    `${API_BASE}/api/subjects`
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to load subjects."
                );
            }

            const data =
                await response.json();

            setSubjects(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Error loading subjects:",
                error
            );

            setError(
                "Unable to load subjects."
            );

        } finally {

            setLoadingSubjects(false);

        }
    };

    // =====================================================
    // FETCH UNITS
    // =====================================================

    const fetchUnits = async (
        subjectId
    ) => {

        if (!subjectId) {

            setUnits([]);
            setTopics([]);

            return;
        }

        try {

            setLoadingUnits(true);

            const response =
                await fetch(
                    `${API_BASE}/api/units/subject/${subjectId}`
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to load units."
                );
            }

            const data =
                await response.json();

            setUnits(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Error loading units:",
                error
            );

            setUnits([]);

            setError(
                "Unable to load units."
            );

        } finally {

            setLoadingUnits(false);

        }
    };

    // =====================================================
    // FETCH TOPICS
    // =====================================================

    const fetchTopics = async (
        unitId
    ) => {

        if (!unitId) {

            setTopics([]);

            return;
        }

        try {

            setLoadingTopics(true);

            const response =
                await fetch(
                    `${API_BASE}/api/topics/unit/${unitId}`
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to load topics."
                );
            }

            const data =
                await response.json();

            setTopics(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Error loading topics:",
                error
            );

            setTopics([]);

            setError(
                "Unable to load topics."
            );

        } finally {

            setLoadingTopics(false);

        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchSubjects();

    }, []);

    // =====================================================
    // SUBJECT CHANGE
    // =====================================================

    const handleSubjectChange = async (
        event
    ) => {

        const subjectId =
            event.target.value;

        setSelectedSubjectId(
            subjectId
        );

        setSelectedUnitId("");
        setSelectedTopicId("");

        setUnits([]);
        setTopics([]);

        setError("");
        setSuccess("");

        if (subjectId) {

            await fetchUnits(
                subjectId
            );
        }
    };

    // =====================================================
    // UNIT CHANGE
    // =====================================================

    const handleUnitChange = async (
        event
    ) => {

        const unitId =
            event.target.value;

        setSelectedUnitId(
            unitId
        );

        setSelectedTopicId("");

        setTopics([]);

        setError("");
        setSuccess("");

        if (unitId) {

            await fetchTopics(
                unitId
            );
        }
    };

    // =====================================================
    // TOPIC CHANGE
    // =====================================================

    const handleTopicChange = (
        event
    ) => {

        setSelectedTopicId(
            event.target.value
        );

        setError("");
        setSuccess("");
    };

    // =====================================================
    // CREATE SUBJECT
    // =====================================================

    const handleCreateSubject = async () => {

        setError("");
        setSuccess("");

        if (!subjectName.trim()) {

            setError(
                "Subject name is required."
            );

            return;
        }

        if (!subjectCode.trim()) {

            setError(
                "Subject code is required."
            );

            return;
        }

        if (!subjectDescription.trim()) {

            setError(
                "Subject description is required."
            );

            return;
        }

        try {

            setSavingSubject(true);

            const response =
                await fetch(
                    `${API_BASE}/api/subjects`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            name:
                                subjectName.trim(),

                            code:
                                subjectCode.trim(),

                            description:
                                subjectDescription.trim(),
                        }),
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Failed to create subject."
                );
            }

            const createdSubject =
                await response.json();

            setSubjects(
                (current) => [
                    ...current,
                    createdSubject,
                ]
            );

            setSelectedSubjectId(
                String(createdSubject.id)
            );

            setUnits([]);
            setTopics([]);

            setSelectedUnitId("");
            setSelectedTopicId("");

            setSubjectName("");
            setSubjectCode("");
            setSubjectDescription("");

            setShowNewSubject(false);

            setSuccess(
                "Subject created successfully."
            );

        } catch (error) {

            console.error(
                "Error creating subject:",
                error
            );

            setError(
                error.message ||
                    "Unable to create subject."
            );

        } finally {

            setSavingSubject(false);

        }
    };

    // =====================================================
    // CREATE UNIT
    // =====================================================

    const handleCreateUnit = async () => {

        setError("");
        setSuccess("");

        if (!selectedSubjectId) {

            setError(
                "Please select a subject first."
            );

            return;
        }

        if (!unitTitle.trim()) {

            setError(
                "Unit title is required."
            );

            return;
        }

        if (!unitNumber) {

            setError(
                "Unit number is required."
            );

            return;
        }

        try {

            setSavingUnit(true);

            const response =
                await fetch(
                    `${API_BASE}/api/units`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            title:
                                unitTitle.trim(),

                            unitNumber:
                                Number(unitNumber),

                            // Topics are created separately.
                            topics: 0,

                            subject: {
                                id:
                                    Number(
                                        selectedSubjectId
                                    ),
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

            setUnits(
                (current) => [
                    ...current,
                    createdUnit,
                ]
            );

            setSelectedUnitId(
                String(createdUnit.id)
            );

            setTopics([]);
            setSelectedTopicId("");

            setUnitTitle("");
            setUnitNumber("");

            setShowNewUnit(false);

            setSuccess(
                "Unit created successfully."
            );

        } catch (error) {

            console.error(
                "Error creating unit:",
                error
            );

            setError(
                error.message ||
                    "Unable to create unit."
            );

        } finally {

            setSavingUnit(false);

        }
    };

    // =====================================================
    // CREATE TOPIC
    // =====================================================

    const handleCreateTopic = async () => {

        setError("");
        setSuccess("");

        if (!selectedUnitId) {

            setError(
                "Please select a unit first."
            );

            return;
        }

        if (!topicTitle.trim()) {

            setError(
                "Topic title is required."
            );

            return;
        }

        if (!topicNumber) {

            setError(
                "Topic number is required."
            );

            return;
        }

        try {

            setSavingTopic(true);

            const response =
                await fetch(
                    `${API_BASE}/api/topics`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            title:
                                topicTitle.trim(),

                            topicNumber:
                                Number(
                                    topicNumber
                                ),

                            description:
                                topicDescription.trim(),

                            unit: {
                                id:
                                    Number(
                                        selectedUnitId
                                    ),
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

            setTopics(
                (current) => [
                    ...current,
                    createdTopic,
                ]
            );

            setSelectedTopicId(
                String(createdTopic.id)
            );

            setTopicTitle("");
            setTopicNumber("");
            setTopicDescription("");

            setShowNewTopic(false);

            setSuccess(
                "Topic created successfully."
            );

        } catch (error) {

            console.error(
                "Error creating topic:",
                error
            );

            setError(
                error.message ||
                    "Unable to create topic."
            );

        } finally {

            setSavingTopic(false);

        }
    };

    // =====================================================
    // PDF SELECTION
    // =====================================================

    const handleFileSelection = (
        event
    ) => {

        const files =
            Array.from(
                event.target.files || []
            );

        setSelectedFiles(
            files
        );

        setError("");
        setSuccess("");
    };

    // =====================================================
    // UPLOAD PDF
    // =====================================================

    const uploadFiles = async () => {

        if (
            !selectedTopicId ||
            selectedFiles.length === 0
        ) {
            return;
        }

        for (
            const file
            of selectedFiles
        ) {

            if (
                file.type !==
                    "application/pdf" &&
                !file.name
                    .toLowerCase()
                    .endsWith(".pdf")
            ) {

                throw new Error(
                    `${file.name} is not a PDF file.`
                );
            }

            if (
                file.size >
                50 * 1024 * 1024
            ) {

                throw new Error(
                    `${file.name} exceeds the 50 MB limit.`
                );
            }

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            formData.append(
                "topicId",
                selectedTopicId
            );

            const response =
                await fetch(
                    `${API_BASE}/api/notes/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

            if (!response.ok) {

                throw new Error(
                    `Failed to upload ${file.name}.`
                );
            }
        }
    };

    // =====================================================
    // ADD VIDEO
    // =====================================================

    const addVideo = async () => {

        if (!videoUrl.trim()) {
            return;
        }

        const body =
            new URLSearchParams();

        body.append(
            "title",
            videoTitle.trim() ||
                "Video"
        );

        body.append(
            "videoUrl",
            videoUrl.trim()
        );

        body.append(
            "topicId",
            selectedTopicId
        );

        const response =
            await fetch(
                `${API_BASE}/api/videos`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",
                    },

                    body,
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to save video."
            );
        }
    };

    // =====================================================
    // SAVE CONTENT
    // =====================================================

    const handleSaveContent = async () => {

        setError("");
        setSuccess("");

        if (!selectedSubjectId) {

            setError(
                "Please select or create a subject."
            );

            return;
        }

        if (!selectedUnitId) {

            setError(
                "Please select or create a unit."
            );

            return;
        }

        if (!selectedTopicId) {

            setError(
                "Please select or create a topic."
            );

            return;
        }

        if (
            selectedFiles.length === 0 &&
            !videoUrl.trim()
        ) {

            setSuccess(
                "Topic saved. No optional resources were added."
            );

            return;
        }

        try {

            setSavingContent(true);

            if (
                selectedFiles.length > 0
            ) {

                await uploadFiles();
            }

            if (
                videoUrl.trim()
            ) {

                await addVideo();
            }

            setSelectedFiles([]);

            if (
                fileInputRef.current
            ) {
                fileInputRef.current.value =
                    "";
            }

            setVideoTitle("");
            setVideoUrl("");

            setSuccess(
                "Learning content saved successfully."
            );

        } catch (error) {

            console.error(
                "Error saving content:",
                error
            );

            setError(
                error.message ||
                    "Unable to save content."
            );

        } finally {

            setSavingContent(false);

        }
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="min-h-[calc(100vh-65px)] bg-[#f8fafc] px-8 py-7">

            <div className="mx-auto max-w-[1050px]">

                {/* HEADER */}

                <div className="mb-7">

                    <h1 className="text-[25px] font-bold text-[#17233c]">
                        Create Learning Content
                    </h1>

                    <p className="mt-1 text-[14px] text-[#64748b]">
                        Create a subject, unit and topic,
                        then optionally add notes or a video.
                    </p>

                </div>

                {/* MAIN CARD */}

                <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6">

                    {/* SUBJECT */}

                    <div>

                        <div className="flex items-center justify-between">

                            <label className="text-[13px] font-medium text-[#334155]">
                                Subject
                            </label>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewSubject(
                                        !showNewSubject
                                    );
                                    setError("");
                                }}
                                className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                New Subject
                            </button>

                        </div>

                        <div className="relative mt-2">

                            <select
                                value={
                                    selectedSubjectId
                                }
                                onChange={
                                    handleSubjectChange
                                }
                                disabled={
                                    loadingSubjects
                                }
                                className="h-11 w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] text-[#475569] outline-none focus:border-blue-400 disabled:bg-gray-50"
                            >

                                <option value="">
                                    {loadingSubjects
                                        ? "Loading subjects..."
                                        : "Select existing subject"}
                                </option>

                                {subjects.map(
                                    (subject) => (
                                        <option
                                            key={
                                                subject.id
                                            }
                                            value={
                                                subject.id
                                            }
                                        >
                                            {
                                                subject.name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            <ChevronDown
                                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            />

                        </div>

                    </div>

                    {/* NEW SUBJECT */}

                    {showNewSubject && (

                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

                            <div className="grid gap-4 md:grid-cols-2">

                                <input
                                    value={
                                        subjectName
                                    }
                                    onChange={(event) =>
                                        setSubjectName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Subject name"
                                    className="h-11 rounded-xl border border-[#dbe3ef] bg-white px-4 text-[13px] outline-none focus:border-blue-400"
                                />

                                <input
                                    value={
                                        subjectCode
                                    }
                                    onChange={(event) =>
                                        setSubjectCode(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Subject code"
                                    className="h-11 rounded-xl border border-[#dbe3ef] bg-white px-4 text-[13px] outline-none focus:border-blue-400"
                                />

                            </div>

                            <textarea
                                value={
                                    subjectDescription
                                }
                                onChange={(event) =>
                                    setSubjectDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Subject description"
                                rows={3}
                                className="mt-3 w-full rounded-xl border border-[#dbe3ef] bg-white px-4 py-3 text-[13px] outline-none focus:border-blue-400"
                            />

                            <div className="mt-3 flex gap-2">

                                <button
                                    type="button"
                                    onClick={
                                        handleCreateSubject
                                    }
                                    disabled={
                                        savingSubject
                                    }
                                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
                                >
                                    {savingSubject
                                        ? "Creating..."
                                        : "Create Subject"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewSubject(
                                            false
                                        )
                                    }
                                    className="rounded-xl border border-[#dbe3ef] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#475569]"
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>
                    )}

                    {/* UNIT */}

                    <div className="mt-7">

                        <div className="flex items-center justify-between">

                            <label className="text-[13px] font-medium text-[#334155]">
                                Unit
                            </label>

                            <button
                                type="button"
                                onClick={() => {

                                    if (
                                        !selectedSubjectId
                                    ) {

                                        setError(
                                            "Select a subject before creating a unit."
                                        );

                                        return;
                                    }

                                    setShowNewUnit(
                                        !showNewUnit
                                    );

                                    setError("");
                                }}
                                className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                New Unit
                            </button>

                        </div>

                        <div className="relative mt-2">

                            <select
                                value={
                                    selectedUnitId
                                }
                                onChange={
                                    handleUnitChange
                                }
                                disabled={
                                    !selectedSubjectId ||
                                    loadingUnits
                                }
                                className="h-11 w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] text-[#475569] outline-none focus:border-blue-400 disabled:bg-gray-50"
                            >

                                <option value="">
                                    {!selectedSubjectId
                                        ? "Select subject first"
                                        : loadingUnits
                                        ? "Loading units..."
                                        : "Select existing unit"}
                                </option>

                                {units.map(
                                    (unit) => (
                                        <option
                                            key={
                                                unit.id
                                            }
                                            value={
                                                unit.id
                                            }
                                        >
                                            Unit{" "}
                                            {
                                                unit.unitNumber
                                            }{" "}
                                            -{" "}
                                            {
                                                unit.title
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            <ChevronDown
                                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            />

                        </div>

                    </div>

                    {/* NEW UNIT */}

                    {showNewUnit && (

                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

                            <div className="grid gap-4 md:grid-cols-2">

                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        unitNumber
                                    }
                                    onChange={(event) =>
                                        setUnitNumber(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Unit number"
                                    className="h-11 rounded-xl border border-[#dbe3ef] bg-white px-4 text-[13px] outline-none focus:border-blue-400"
                                />

                                <input
                                    value={
                                        unitTitle
                                    }
                                    onChange={(event) =>
                                        setUnitTitle(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Unit title"
                                    className="h-11 rounded-xl border border-[#dbe3ef] bg-white px-4 text-[13px] outline-none focus:border-blue-400"
                                />

                            </div>

                            <div className="mt-3 flex gap-2">

                                <button
                                    type="button"
                                    onClick={
                                        handleCreateUnit
                                    }
                                    disabled={
                                        savingUnit
                                    }
                                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
                                >
                                    {savingUnit
                                        ? "Creating..."
                                        : "Create Unit"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewUnit(
                                            false
                                        )
                                    }
                                    className="rounded-xl border border-[#dbe3ef] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#475569]"
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>
                    )}

                    {/* TOPIC */}

                    <div className="mt-7">

                        <div className="flex items-center justify-between">

                            <label className="text-[13px] font-medium text-[#334155]">
                                Topic
                            </label>

                            <button
                                type="button"
                                onClick={() => {

                                    if (
                                        !selectedUnitId
                                    ) {

                                        setError(
                                            "Select a unit before creating a topic."
                                        );

                                        return;
                                    }

                                    setShowNewTopic(
                                        !showNewTopic
                                    );

                                    setError("");
                                }}
                                className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                New Topic
                            </button>

                        </div>

                        <div className="relative mt-2">

                            <select
                                value={
                                    selectedTopicId
                                }
                                onChange={
                                    handleTopicChange
                                }
                                disabled={
                                    !selectedUnitId ||
                                    loadingTopics
                                }
                                className="h-11 w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] text-[#475569] outline-none focus:border-blue-400 disabled:bg-gray-50"
                            >

                                <option value="">
                                    {!selectedUnitId
                                        ? "Select unit first"
                                        : loadingTopics
                                        ? "Loading topics..."
                                        : "Select existing topic"}
                                </option>

                                {topics.map(
                                    (topic) => (
                                        <option
                                            key={
                                                topic.id
                                            }
                                            value={
                                                topic.id
                                            }
                                        >
                                            Topic{" "}
                                            {
                                                topic.topicNumber
                                            }{" "}
                                            -{" "}
                                            {
                                                topic.title
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            <ChevronDown
                                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            />

                        </div>

                    </div>

                    {/* NEW TOPIC */}

                    {showNewTopic && (

                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

                            <div className="grid gap-4 md:grid-cols-2">

                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        topicNumber
                                    }
                                    onChange={(event) =>
                                        setTopicNumber(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Topic number"
                                    className="h-11 rounded-xl border border-[#dbe3ef] bg-white px-4 text-[13px] outline-none focus:border-blue-400"
                                />

                                <input
                                    value={
                                        topicTitle
                                    }
                                    onChange={(event) =>
                                        setTopicTitle(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Topic title"
                                    className="h-11 rounded-xl border border-[#dbe3ef] bg-white px-4 text-[13px] outline-none focus:border-blue-400"
                                />

                            </div>

                            <textarea
                                value={
                                    topicDescription
                                }
                                onChange={(event) =>
                                    setTopicDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Topic description (optional)"
                                rows={3}
                                className="mt-3 w-full rounded-xl border border-[#dbe3ef] bg-white px-4 py-3 text-[13px] outline-none focus:border-blue-400"
                            />

                            <div className="mt-3 flex gap-2">

                                <button
                                    type="button"
                                    onClick={
                                        handleCreateTopic
                                    }
                                    disabled={
                                        savingTopic
                                    }
                                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
                                >
                                    {savingTopic
                                        ? "Creating..."
                                        : "Create Topic"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewTopic(
                                            false
                                        )
                                    }
                                    className="rounded-xl border border-[#dbe3ef] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#475569]"
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>
                    )}

                </section>

                {/* RESOURCES */}

                <section className="mt-7 rounded-2xl border border-[#e2e8f0] bg-white p-6">

                    <h2 className="text-[16px] font-bold text-[#17233c]">
                        Resources
                    </h2>

                    <p className="mt-1 text-[13px] text-[#94a3b8]">
                        Both resources are optional.
                    </p>

                    {/* PDF */}

                    <div className="mt-5 rounded-xl border border-[#e2e8f0] p-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                                <FileText className="h-5 w-5 text-red-600" />
                            </div>

                            <div>
                                <h3 className="text-[14px] font-semibold text-[#17233c]">
                                    PDF Notes
                                </h3>

                                <p className="text-[12px] text-[#94a3b8]">
                                    Optional course material.
                                </p>
                            </div>

                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            multiple
                            onChange={
                                handleFileSelection
                            }
                            disabled={
                                !selectedTopicId
                            }
                            className="mt-4 block w-full text-[13px]"
                        />

                        {selectedFiles.length > 0 && (

                            <p className="mt-2 text-[12px] text-emerald-600">
                                {selectedFiles.length} PDF file(s) selected.
                            </p>
                        )}

                    </div>

                    {/* VIDEO */}

                    <div className="mt-5 rounded-xl border border-[#e2e8f0] p-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                                <Video className="h-5 w-5 text-red-600" />
                            </div>

                            <div>
                                <h3 className="text-[14px] font-semibold text-[#17233c]">
                                    YouTube Video
                                </h3>

                                <p className="text-[12px] text-[#94a3b8]">
                                    Optional video resource.
                                </p>
                            </div>

                        </div>

                        <input
                            type="text"
                            value={
                                videoTitle
                            }
                            onChange={(event) =>
                                setVideoTitle(
                                    event.target.value
                                )
                            }
                            disabled={
                                !selectedTopicId
                            }
                            placeholder="Video title"
                            className="mt-4 h-11 w-full rounded-xl border border-[#e2e8f0] px-4 text-[13px] outline-none focus:border-blue-400 disabled:bg-gray-50"
                        />

                        <input
                            type="url"
                            value={
                                videoUrl
                            }
                            onChange={(event) =>
                                setVideoUrl(
                                    event.target.value
                                )
                            }
                            disabled={
                                !selectedTopicId
                            }
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="mt-3 h-11 w-full rounded-xl border border-[#e2e8f0] px-4 text-[13px] outline-none focus:border-blue-400 disabled:bg-gray-50"
                        />

                    </div>

                </section>

                {/* MESSAGES */}

                {error && (

                    <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">

                        <AlertCircle className="h-4 w-4" />

                        <span>{error}</span>

                    </div>
                )}

                {success && (

                    <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-600">

                        <CheckCircle2 className="h-4 w-4" />

                        <span>{success}</span>

                    </div>
                )}

                {/* SAVE */}

                <div className="mt-7 flex justify-end">

                    <button
                        type="button"
                        onClick={
                            handleSaveContent
                        }
                        disabled={
                            savingContent ||
                            !selectedTopicId
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {savingContent ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}

                        {savingContent
                            ? "Saving..."
                            : "Save Content"}

                    </button>

                </div>

            </div>

        </div>
    );
}

export default CreateLearningContentPage;