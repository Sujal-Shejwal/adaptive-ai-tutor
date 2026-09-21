import {
    Upload,
    FileText,
    Trash2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Loader2,
    Video,
    ExternalLink,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";


function TeacherUploadNotesPage() {

    const navigate = useNavigate();

    const fileInputRef = useRef(null);


    // =========================
    // DATA
    // =========================

    const [subjects, setSubjects] = useState([]);

    const [units, setUnits] = useState([]);

    const [topics, setTopics] = useState([]);

    const [uploadedFiles, setUploadedFiles] = useState([]);

    const [videos, setVideos] = useState([]);
    const [videoTitle, setVideoTitle] = useState("");
    const [videoUrl, setVideoUrl] = useState("");



    // =========================
    // SELECTIONS
    // =========================

    const [selectedSubjectId, setSelectedSubjectId] =
        useState("");

    const [selectedUnitId, setSelectedUnitId] =
        useState("");

    const [selectedTopicId, setSelectedTopicId] =
        useState("");


    // =========================
    // LOADING
    // =========================

    const [loadingSubjects, setLoadingSubjects] =
        useState(true);

    const [loadingUnits, setLoadingUnits] =
        useState(false);

    const [loadingTopics, setLoadingTopics] =
        useState(false);

    const [loadingNotes, setLoadingNotes] =
        useState(false);

    const [uploading, setUploading] =
        useState(false);

    const [loadingVideos, setLoadingVideos] =
        useState(false);

    const [savingVideo, setSavingVideo] =
        useState(false);


    // =========================
    // UI
    // =========================

    const [isDragging, setIsDragging] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =========================
    // FETCH SUBJECTS
    // =========================

    const fetchSubjects = async () => {

        try {

            setLoadingSubjects(true);

            setError("");

            const response = await fetch(
                "http://localhost:8080/api/subjects"
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch subjects."
                );
            }

            const data = await response.json();

            setSubjects(data);

        } catch (error) {

            console.error(
                "Error fetching subjects:",
                error
            );

            setError(
                "Unable to load subjects."
            );

        } finally {

            setLoadingSubjects(false);

        }
    };


    // =========================
    // FETCH UNITS
    // =========================

    const fetchUnits = async (subjectId) => {

        if (!subjectId) {

            setUnits([]);

            setTopics([]);

            return;
        }


        try {

            setLoadingUnits(true);

            setError("");

            const response = await fetch(
                `http://localhost:8080/api/units/subject/${subjectId}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch units."
                );
            }

            const data = await response.json();

            setUnits(data);

        } catch (error) {

            console.error(
                "Error fetching units:",
                error
            );

            setError(
                "Unable to load units."
            );

            setUnits([]);

        } finally {

            setLoadingUnits(false);

        }
    };


    // =========================
    // FETCH TOPICS
    // =========================

    const fetchTopics = async (unitId) => {

        if (!unitId) {

            setTopics([]);

            return;
        }


        try {

            setLoadingTopics(true);

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
                "Unable to load topics."
            );

            setTopics([]);

        } finally {

            setLoadingTopics(false);

        }
    };


    // =========================
    // FETCH NOTES
    // =========================

    const fetchNotes = async (topicId) => {

        if (!topicId) {

            setUploadedFiles([]);

            return;
        }


        try {

            setLoadingNotes(true);

            setError("");

            const response = await fetch(
                `http://localhost:8080/api/notes/topic/${topicId}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch notes."
                );
            }

            const data = await response.json();


            const selectedSubject =
                subjects.find(
                    (subject) =>
                        String(subject.id) ===
                        String(selectedSubjectId)
                );


            const selectedUnit =
                units.find(
                    (unit) =>
                        String(unit.id) ===
                        String(selectedUnitId)
                );


            const selectedTopic =
                topics.find(
                    (topic) =>
                        String(topic.id) ===
                        String(topicId)
                );


            const formattedFiles =
                data.map((note) => ({

                    id: note.id,

                    name: note.fileName,

                    size: "PDF",

                    subject:
                        selectedSubject?.name || "",

                    unit:
                        selectedUnit?.title || "",

                    topic:
                        selectedTopic?.title || "",

                    status: "Uploaded",

                }));


            setUploadedFiles(formattedFiles);

        } catch (error) {

            console.error(
                "Error fetching notes:",
                error
            );

            setUploadedFiles([]);

        } finally {

            setLoadingNotes(false);

        }
    };


    // =========================
    // FETCH VIDEOS
    // =========================

    const fetchVideos = async (topicId) => {

        if (!topicId) {
            setVideos([]);
            return;
        }

        try {

            setLoadingVideos(true);

            const response = await fetch(
                `http://localhost:8080/api/videos/topic/${topicId}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch videos."
                );
            }

            const data = await response.json();

            setVideos(
                Array.isArray(data) ? data : []
            );

        } catch (error) {

            console.error(
                "Error fetching videos:",
                error
            );

            setVideos([]);

        } finally {

            setLoadingVideos(false);

        }
    };


    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        fetchSubjects();

    }, []);


    // =========================
    // SUBJECT CHANGE
    // =========================

    const handleSubjectChange = async (event) => {

        const subjectId =
            event.target.value;


        setSelectedSubjectId(
            subjectId
        );

        setSelectedUnitId("");

        setSelectedTopicId("");

        setUnits([]);

        setTopics([]);

        setUploadedFiles([]);
        setVideos([]);
        setVideoTitle("");
        setVideoUrl("");

        setError("");

        setSuccess("");


        if (subjectId) {

            await fetchUnits(
                subjectId
            );

        }

    };


    // =========================
    // UNIT CHANGE
    // =========================

    const handleUnitChange = async (event) => {

        const unitId =
            event.target.value;


        setSelectedUnitId(
            unitId
        );

        setSelectedTopicId("");

        setTopics([]);

        setUploadedFiles([]);
        setVideos([]);
        setVideoTitle("");
        setVideoUrl("");

        setError("");

        setSuccess("");


        if (unitId) {

            await fetchTopics(
                unitId
            );

        }

    };


    // =========================
    // TOPIC CHANGE
    // =========================

    const handleTopicChange = async (event) => {

        const topicId =
            event.target.value;


        setSelectedTopicId(
            topicId
        );

        setError("");

        setSuccess("");


        if (topicId) {

            await Promise.all([
                fetchNotes(topicId),
                fetchVideos(topicId),
            ]);

        } else {

            setUploadedFiles([]);
            setVideos([]);
            setVideoTitle("");
            setVideoUrl("");

        }

    };


    // =========================
    // FILE HANDLING
    // =========================

    const handleFiles = async (files) => {

        setError("");

        setSuccess("");


        // Topic required

        if (!selectedTopicId) {

            setError(
                "Please select a subject, unit, and topic before uploading."
            );

            return;
        }


        const fileList =
            Array.from(files);


        if (fileList.length === 0) {

            return;

        }


        // Only PDF

        const invalidFile =
            fileList.find(
                (file) =>
                    file.type !==
                        "application/pdf" &&
                    !file.name
                        .toLowerCase()
                        .endsWith(".pdf")
            );


        if (invalidFile) {

            setError(
                "Only PDF files are supported."
            );

            return;
        }


        // 50 MB limit

        const oversizedFile =
            fileList.find(
                (file) =>
                    file.size >
                    50 * 1024 * 1024
            );


        if (oversizedFile) {

            setError(
                `${oversizedFile.name} exceeds the maximum file size of 50 MB.`
            );

            return;
        }


        // Upload one by one

        for (const file of fileList) {

            await uploadFile(file);

        }

    };


    // =========================
    // UPLOAD SINGLE FILE
    // =========================

    const uploadFile = async (file) => {

        try {

            setUploading(true);

            setError("");

            setSuccess("");


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
                    "http://localhost:8080/api/notes/upload",
                    {
                        method: "POST",
                        body: formData,
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to upload file."
                );

            }


            const createdNote =
                await response.json();


            // Find selected data

            const selectedSubject =
                subjects.find(
                    (subject) =>
                        String(subject.id) ===
                        String(selectedSubjectId)
                );


            const selectedUnit =
                units.find(
                    (unit) =>
                        String(unit.id) ===
                        String(selectedUnitId)
                );


            const selectedTopic =
                topics.find(
                    (topic) =>
                        String(topic.id) ===
                        String(selectedTopicId)
                );


            // Add file to UI

            const newFile = {

                id: createdNote.id,

                name:
                    createdNote.fileName ||
                    file.name,

                size:
                    formatFileSize(
                        file.size
                    ),

                subject:
                    selectedSubject?.name ||
                    "",

                unit:
                    selectedUnit?.title ||
                    "",

                topic:
                    selectedTopic?.title ||
                    "",

                status:
                    "Uploaded",

            };


            setUploadedFiles(
                (currentFiles) => [
                    newFile,
                    ...currentFiles,
                ]
            );


            setSuccess(
                `${file.name} uploaded successfully.`
            );


        } catch (error) {

            console.error(
                "Error uploading file:",
                error
            );

            setError(
                `Unable to upload ${file.name}. Please try again.`
            );

        } finally {

            setUploading(false);

        }

    };


    // =========================
    // ADD VIDEO
    // =========================

    const handleAddVideo = async () => {

        setError("");
        setSuccess("");

        if (!selectedTopicId) {
            setError(
                "Please select a subject, unit, and topic."
            );
            return;
        }

        if (!videoUrl.trim()) {
            setError(
                "Please enter a video URL."
            );
            return;
        }

        try {

            setSavingVideo(true);

            const body = new URLSearchParams();

            body.append(
                "title",
                videoTitle.trim() || "Video"
            );

            body.append(
                "videoUrl",
                videoUrl.trim()
            );

            body.append(
                "topicId",
                selectedTopicId
            );

            const response = await fetch(
                "http://localhost:8080/api/videos",
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
                    "Failed to add video."
                );
            }

            const createdVideo =
                await response.json();

            setVideos((currentVideos) => [
                createdVideo,
                ...currentVideos,
            ]);

            setVideoTitle("");
            setVideoUrl("");

            setSuccess(
                "Video added successfully."
            );

        } catch (error) {

            console.error(
                "Error adding video:",
                error
            );

            setError(
                error?.message ||
                    "Unable to add video."
            );

        } finally {

            setSavingVideo(false);

        }
    };


    // =========================
    // DELETE VIDEO
    // =========================

    const handleDeleteVideo = async (videoId) => {

        try {

            setError("");
            setSuccess("");

            const response = await fetch(
                `http://localhost:8080/api/videos/${videoId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to delete video."
                );
            }

            setVideos((currentVideos) =>
                currentVideos.filter(
                    (video) =>
                        video.id !== videoId
                )
            );

            setSuccess(
                "Video deleted successfully."
            );

        } catch (error) {

            console.error(
                "Error deleting video:",
                error
            );

            setError(
                "Unable to delete video."
            );

        }
    };


    // =========================
    // FILE INPUT
    // =========================

    const handleFileInput = (event) => {

        handleFiles(
            event.target.files
        );


        // Allow selecting same file again

        event.target.value = "";

    };


    // =========================
    // DRAG & DROP
    // =========================

    const handleDrop = (event) => {

        event.preventDefault();

        setIsDragging(false);

        handleFiles(
            event.dataTransfer.files
        );

    };


    // =========================
    // BROWSE
    // =========================

    const handleBrowse = () => {

        fileInputRef.current?.click();

    };


    // =========================
    // DELETE FROM UI
    // =========================

    const handleDelete = async (fileId) => {

        try {

            setError("");
            setSuccess("");

            const response = await fetch(
                `http://localhost:8080/api/notes/${fileId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {

                if (response.status === 404) {
                    throw new Error("Note not found.");
                }

                throw new Error(
                    "Failed to delete file."
                );
            }

            // Remove from UI only after backend deletion succeeds
            setUploadedFiles(
                (currentFiles) =>
                    currentFiles.filter(
                        (file) =>
                            file.id !== fileId
                    )
            );

            setSuccess(
                "File deleted successfully."
            );

        } catch (error) {

            console.error(
                "Error deleting file:",
                error
            );

            setError(
                "Unable to delete file. Please try again."
            );
        }

    };


    // =========================
    // UI
    // =========================

    return (

        <div className="min-h-[calc(100vh-65px)] bg-[#f8fafc] px-8 py-7">

            <div className="mx-auto max-w-[1025px]">


                {/* ========================= */}
                {/* HEADER */}
                {/* ========================= */}

                <div className="mb-7">

                    <h1 className="text-[25px] font-bold leading-[30px] tracking-tight text-[#17233c]">
                        Upload Notes
                    </h1>

                    <p className="mt-[3px] text-[14px] leading-5 text-[#64748b]">
                        Upload PDF course materials for students to access and study.
                    </p>

                </div>


                {/* ========================= */}
                {/* UPLOAD DETAILS */}
                {/* ========================= */}

                <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6">

                    <h2 className="text-[16px] font-bold leading-5 text-[#17233c]">
                        Upload Details
                    </h2>


                    {/* SUBJECT */}

                    <div className="mt-5">

                        <label className="mb-2 block text-[13px] font-medium text-[#334155]">
                            Subject
                        </label>

                        <div className="relative">

                            <select
                                value={selectedSubjectId}
                                onChange={handleSubjectChange}
                                disabled={loadingSubjects}
                                className="h-[44px] w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] text-[#475569] outline-none transition focus:border-blue-400 disabled:bg-gray-50"
                            >

                                <option value="">

                                    {loadingSubjects
                                        ? "Loading subjects..."
                                        : "Select Subject"}

                                </option>


                                {subjects.map(
                                    (subject) => (

                                        <option
                                            key={subject.id}
                                            value={subject.id}
                                        >
                                            {subject.name}
                                        </option>

                                    )
                                )}

                            </select>


                            <ChevronDown
                                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            />

                        </div>

                    </div>


                    {/* UNIT */}

                    <div className="mt-5">

                        <label className="mb-2 block text-[13px] font-medium text-[#334155]">
                            Unit
                        </label>

                        <div className="relative">

                            <select
                                value={selectedUnitId}
                                onChange={handleUnitChange}
                                disabled={
                                    !selectedSubjectId ||
                                    loadingUnits
                                }
                                className="h-[44px] w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] text-[#475569] outline-none transition focus:border-blue-400 disabled:bg-gray-50"
                            >

                                <option value="">

                                    {loadingUnits
                                        ? "Loading units..."
                                        : "Select Unit"}

                                </option>


                                {units.map(
                                    (unit) => (

                                        <option
                                            key={unit.id}
                                            value={unit.id}
                                        >
                                            Unit {unit.unitNumber} - {unit.title}
                                        </option>

                                    )
                                )}

                            </select>


                            <ChevronDown
                                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            />

                        </div>

                    </div>


                    {/* TOPIC */}

                    <div className="mt-5">

                        <label className="mb-2 block text-[13px] font-medium text-[#334155]">
                            Topic
                        </label>

                        <div className="relative">

                            <select
                                value={selectedTopicId}
                                onChange={handleTopicChange}
                                disabled={
                                    !selectedUnitId ||
                                    loadingTopics
                                }
                                className="h-[44px] w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] text-[#475569] outline-none transition focus:border-blue-400 disabled:bg-gray-50"
                            >

                                <option value="">

                                    {loadingTopics
                                        ? "Loading topics..."
                                        : "Select Topic"}

                                </option>


                                {topics.map(
                                    (topic) => (

                                        <option
                                            key={topic.id}
                                            value={topic.id}
                                        >
                                            Topic {topic.topicNumber} - {topic.title}
                                        </option>

                                    )
                                )}

                            </select>


                            <ChevronDown
                                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            />

                        </div>

                    </div>


                    {/* ========================= */}
                    {/* DRAG & DROP */}
                    {/* ========================= */}

                    <div
                        onDragOver={(event) => {

                            event.preventDefault();

                            setIsDragging(true);

                        }}

                        onDragLeave={() => {

                            setIsDragging(false);

                        }}

                        onDrop={handleDrop}

                        className={`mt-5 flex min-h-[270px] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
                            isDragging
                                ? "border-blue-500 bg-blue-50"
                                : "border-[#cbd5e1] bg-[#f8fafc]"
                        }`}
                    >

                        {/* ICON */}

                        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-blue-100">

                            {uploading ? (

                                <Loader2
                                    className="h-[23px] w-[23px] animate-spin text-blue-600"
                                />

                            ) : (

                                <Upload
                                    className="h-[23px] w-[23px] text-blue-600"
                                    strokeWidth={1.8}
                                />

                            )}

                        </div>


                        {/* TEXT */}

                        <h3 className="mt-4 text-[15px] font-semibold text-[#17233c]">

                            {uploading
                                ? "Uploading..."
                                : "Drag & drop PDF files here"}

                        </h3>


                        <p className="mt-1 text-[13px] text-[#94a3b8]">
                            or click to browse from your computer
                        </p>


                        {/* BUTTON */}

                        <button
                            type="button"
                            onClick={handleBrowse}
                            disabled={
                                uploading ||
                                !selectedTopicId
                            }
                            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Choose Files
                        </button>


                        <p className="mt-4 text-[11px] text-[#94a3b8]">
                            Supported format: PDF · Max size: 50 MB
                        </p>


                        {/* HIDDEN INPUT */}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            multiple
                            onChange={handleFileInput}
                            className="hidden"
                        />

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">

                            <AlertCircle className="h-4 w-4 shrink-0" />

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    {/* SUCCESS */}

                    {success && (

                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-600">

                            <CheckCircle2 className="h-4 w-4 shrink-0" />

                            <span>
                                {success}
                            </span>

                        </div>

                    )}

                </section>


                {/* ========================= */}
                {/* OPTIONAL VIDEO */}
                {/* ========================= */}

                <section className="mt-7 rounded-2xl border border-[#e2e8f0] bg-white p-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                            <Video className="h-5 w-5 text-red-600" />
                        </div>

                        <div>
                            <h2 className="text-[16px] font-bold text-[#17233c]">
                                Optional Video
                            </h2>

                            <p className="text-[13px] text-[#94a3b8]">
                                Add a YouTube or video link for this topic.
                            </p>
                        </div>

                    </div>

                    <div className="mt-5">

                        <label className="mb-2 block text-[13px] font-medium text-[#334155]">
                            Video Title <span className="text-[#94a3b8]">(optional)</span>
                        </label>

                        <input
                            type="text"
                            value={videoTitle}
                            onChange={(event) =>
                                setVideoTitle(event.target.value)
                            }
                            placeholder="e.g. DBMS Normalization Explained"
                            disabled={
                                !selectedTopicId ||
                                savingVideo
                            }
                            className="h-[44px] w-full rounded-xl border border-[#e2e8f0] px-4 text-[13px] outline-none focus:border-blue-400 disabled:bg-gray-50"
                        />

                    </div>

                    <div className="mt-5">

                        <label className="mb-2 block text-[13px] font-medium text-[#334155]">
                            Video URL <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="url"
                            value={videoUrl}
                            onChange={(event) =>
                                setVideoUrl(event.target.value)
                            }
                            placeholder="https://www.youtube.com/watch?v=..."
                            disabled={
                                !selectedTopicId ||
                                savingVideo
                            }
                            className="h-[44px] w-full rounded-xl border border-[#e2e8f0] px-4 text-[13px] outline-none focus:border-blue-400 disabled:bg-gray-50"
                        />

                    </div>

                    <button
                        type="button"
                        onClick={handleAddVideo}
                        disabled={
                            !selectedTopicId ||
                            !videoUrl.trim() ||
                            savingVideo
                        }
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {savingVideo ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Video className="h-4 w-4" />
                        )}

                        {savingVideo
                            ? "Adding..."
                            : "Add Video"}

                    </button>

                </section>


                {/* ========================= */}
                {/* VIDEOS */}
                {/* ========================= */}

                {selectedTopicId && (

                    <section className="mt-7 rounded-2xl border border-[#e2e8f0] bg-white">

                        <div className="border-b border-[#f1f5f9] px-6 py-5">

                            <h2 className="text-[16px] font-bold text-[#17233c]">
                                Videos ({videos.length})
                            </h2>

                        </div>

                        <div className="px-6 py-2">

                            {loadingVideos ? (

                                <div className="py-10 text-center">

                                    <Loader2
                                        className="mx-auto h-7 w-7 animate-spin text-blue-600"
                                    />

                                    <p className="mt-3 text-[13px] text-gray-500">
                                        Loading videos...
                                    </p>

                                </div>

                            ) : videos.length > 0 ? (

                                videos.map((video) => (

                                    <div
                                        key={video.id}
                                        className="flex min-h-[85px] items-center gap-4 border-b border-[#f1f5f9]"
                                    >

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                                            <Video className="h-5 w-5 text-red-600" />
                                        </div>

                                        <div className="min-w-0 flex-1">

                                            <p className="truncate text-[14px] font-medium text-[#17233c]">
                                                {video.title}
                                            </p>

                                            <p className="mt-1 truncate text-[12px] text-[#94a3b8]">
                                                {video.videoUrl}
                                            </p>

                                        </div>

                                        <a
                                            href={video.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                                            title="Open video"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteVideo(
                                                    video.id
                                                )
                                            }
                                            className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                                            title="Delete video"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                    </div>

                                ))

                            ) : (

                                <div className="py-10 text-center">

                                    <Video
                                        className="mx-auto h-8 w-8 text-gray-300"
                                    />

                                    <p className="mt-3 text-[13px] text-gray-500">
                                        No video added for this topic.
                                    </p>

                                </div>

                            )}

                        </div>

                    </section>

                )}


                {/* ========================= */}
                {/* UPLOADED FILES */}
                {/* ========================= */}

                <section className="mt-7 rounded-2xl border border-[#e2e8f0] bg-white">

                    {/* HEADER */}

                    <div className="border-b border-[#f1f5f9] px-6 py-5">

                        <h2 className="text-[16px] font-bold leading-5 text-[#17233c]">
                            Uploaded Files ({uploadedFiles.length})
                        </h2>

                    </div>


                    {/* FILES */}

                    <div className="px-6 py-2">

                        {loadingNotes ? (

                            <div className="py-12 text-center">

                                <Loader2
                                    className="mx-auto h-7 w-7 animate-spin text-blue-600"
                                />

                                <p className="mt-3 text-[13px] text-gray-500">
                                    Loading uploaded files...
                                </p>

                            </div>

                        ) : uploadedFiles.length > 0 ? (

                            uploadedFiles.map(
                                (file, index) => (

                                    <div
                                        key={file.id}
                                        className={`group flex min-h-[90px] items-center gap-4 ${
                                            index !==
                                            uploadedFiles.length - 1
                                                ? "border-b border-[#f1f5f9]"
                                                : ""
                                        }`}
                                    >

                                        {/* FILE ICON */}

                                        <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-[#fff1f2]">

                                            <FileText
                                                className="h-[20px] w-[20px] text-[#ff3b30]"
                                                strokeWidth={1.7}
                                            />

                                        </div>


                                        {/* INFORMATION */}

                                        <div className="min-w-0 flex-1">

                                            <p className="truncate text-[14px] font-medium text-[#17233c]">
                                                {file.name}
                                            </p>


                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[#94a3b8]">

                                                <span>
                                                    {file.size}
                                                </span>

                                                <span>
                                                    •
                                                </span>

                                                <span>
                                                    {file.subject}
                                                </span>

                                                <span>
                                                    •
                                                </span>

                                                <span>
                                                    {file.unit}
                                                </span>

                                                <span>
                                                    •
                                                </span>

                                                <span>
                                                    {file.topic}
                                                </span>

                                            </div>

                                        </div>


                                        {/* STATUS */}

                                        <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-600">

                                            <CheckCircle2 className="h-3.5 w-3.5" />

                                            {file.status}

                                        </div>


                                        {/* DELETE */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    file.id
                                                )
                                            }
                                            title="Remove from list"
                                            aria-label={`Delete ${file.name}`}
                                            className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                                        >

                                            <Trash2
                                                className="h-4 w-4"
                                                strokeWidth={1.8}
                                            />

                                        </button>

                                    </div>

                                )
                            )

                        ) : (

                            <div className="py-12 text-center">

                                <FileText className="mx-auto h-8 w-8 text-gray-300" />

                                <p className="mt-3 text-[13px] text-gray-500">

                                    {selectedTopicId
                                        ? "No files uploaded for this topic yet."
                                        : "Select a topic to view uploaded files."}

                                </p>

                            </div>

                        )}

                    </div>

                </section>


                {/* ========================= */}
                {/* BACK */}
                {/* ========================= */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/teacher/dashboard"
                        )
                    }
                    className="mt-5 text-[13px] font-medium text-blue-600 hover:text-blue-700"
                >
                    ← Back to Dashboard
                </button>

            </div>

        </div>

    );

}


// =========================
// FILE SIZE
// =========================

function formatFileSize(bytes) {

    if (bytes === 0) {

        return "0 Bytes";

    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB",
    ];


    const index = Math.floor(
        Math.log(bytes) /
        Math.log(1024)
    );


    return `${(
        bytes /
        Math.pow(1024, index)
    ).toFixed(1)} ${units[index]}`;

}


export default TeacherUploadNotesPage;