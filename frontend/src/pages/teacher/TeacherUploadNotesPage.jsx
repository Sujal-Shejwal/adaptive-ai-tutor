import {
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const subjects = [
  "DBMS",
  "Operating System",
  "Computer Networks",
  "Java",
];

const initialUploadedFiles = [
  {
    id: 1,
    name: "DBMS_Unit4_Transactions.pdf",
    size: "2.1 MB",
    subject: "DBMS",
    status: "Uploaded",
  },
  {
    id: 2,
    name: "OS_Memory_Management.pdf",
    size: "1.8 MB",
    subject: "Operating System",
    status: "Uploaded",
  },
];

function TeacherUploadNotesPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedSubject, setSelectedSubject] = useState("DBMS");

  const [uploadedFiles, setUploadedFiles] = useState(
    initialUploadedFiles
  );

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = (files) => {
    setError("");

    const fileList = Array.from(files);

    if (fileList.length === 0) {
      return;
    }

    // Check PDF format
    const invalidFile = fileList.find(
      (file) =>
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
    );

    if (invalidFile) {
      setError("Only PDF files are supported.");
      return;
    }

    // Check 50 MB limit
    const oversizedFile = fileList.find(
      (file) => file.size > 50 * 1024 * 1024
    );

    if (oversizedFile) {
      setError(
        `${oversizedFile.name} exceeds the maximum file size of 50 MB.`
      );
      return;
    }

    const newFiles = fileList.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: formatFileSize(file.size),
      subject: selectedSubject,
      status: "Uploaded",
    }));

    setUploadedFiles((currentFiles) => [
      ...newFiles,
      ...currentFiles,
    ]);
  };

  const handleFileInput = (event) => {
    handleFiles(event.target.files);

    // Allows selecting the same file again
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragging(false);

    handleFiles(event.dataTransfer.files);
  };

  const handleDelete = (fileId) => {
    setUploadedFiles((currentFiles) =>
      currentFiles.filter((file) => file.id !== fileId)
    );
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f8fafc] px-8 py-7">
      <div className="mx-auto max-w-[1025px]">

        {/* ========================= */}
        {/* PAGE HEADER */}
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


          {/* Subject */}
          <div className="mt-5">

            <label className="mb-2 block text-[13px] font-medium text-[#334155]">
              Subject
            </label>

            <div className="relative">

              <select
                value={selectedSubject}
                onChange={(event) =>
                  setSelectedSubject(event.target.value)
                }
                className="h-[44px] w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] text-[#475569] outline-none transition focus:border-blue-400"
              >
                {subjects.map((subject) => (
                  <option
                    key={subject}
                    value={subject}
                  >
                    {subject}
                  </option>
                ))}
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              />

            </div>
          </div>


          {/* Drag & Drop Area */}
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

            {/* Upload Icon */}
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-blue-100">

              <Upload
                className="h-[23px] w-[23px] text-blue-600"
                strokeWidth={1.8}
              />

            </div>


            {/* Text */}
            <h3 className="mt-4 text-[15px] font-semibold text-[#17233c]">
              Drag & drop PDF files here
            </h3>

            <p className="mt-1 text-[13px] text-[#94a3b8]">
              or click to browse from your computer
            </p>


            {/* Choose Files */}
            <button
              type="button"
              onClick={handleBrowse}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Choose Files
            </button>


            {/* Supported format */}
            <p className="mt-4 text-[11px] text-[#94a3b8]">
              Supported format: PDF · Max size: 50 MB
            </p>


            {/* Hidden input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />

          </div>


          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">

              <AlertCircle className="h-4 w-4 shrink-0" />

              <span>{error}</span>

            </div>
          )}

        </section>


        {/* ========================= */}
        {/* UPLOADED FILES */}
        {/* ========================= */}

        <section className="mt-7 rounded-2xl border border-[#e2e8f0] bg-white">

          {/* Header */}
          <div className="border-b border-[#f1f5f9] px-6 py-5">

            <h2 className="text-[16px] font-bold leading-5 text-[#17233c]">
              Uploaded Files ({uploadedFiles.length})
            </h2>

          </div>


          {/* Files */}
          <div className="px-6 py-2">

            {uploadedFiles.length > 0 ? (

              uploadedFiles.map((file, index) => (

                <div
                  key={file.id}
                  className={`group flex min-h-[76px] items-center gap-4 ${
                    index !== uploadedFiles.length - 1
                      ? "border-b border-[#f1f5f9]"
                      : ""
                  }`}
                >

                  {/* File Icon */}
                  <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-[#fff1f2]">

                    <FileText
                      className="h-[20px] w-[20px] text-[#ff3b30]"
                      strokeWidth={1.7}
                    />

                  </div>


                  {/* File Information */}
                  <div className="min-w-0 flex-1">

                    <p className="truncate text-[14px] font-medium text-[#17233c]">
                      {file.name}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-[12px] text-[#94a3b8]">

                      <span>{file.size}</span>

                      <span>•</span>

                      <span>{file.subject}</span>

                    </div>

                  </div>


                  {/* Status */}
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-600">

                    <CheckCircle2 className="h-3.5 w-3.5" />

                    {file.status}

                  </div>


                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(file.id)}
                    title="Delete file"
                    aria-label={`Delete ${file.name}`}
                    className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                  >

                    <Trash2
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />

                  </button>

                </div>

              ))

            ) : (

              <div className="py-12 text-center">

                <FileText className="mx-auto h-8 w-8 text-gray-300" />

                <p className="mt-3 text-[13px] text-gray-500">
                  No files uploaded yet.
                </p>

              </div>

            )}

          </div>

        </section>


        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/teacher/dashboard")}
          className="mt-5 text-[13px] font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>

      </div>
    </div>
  );
}


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
    Math.log(bytes) / Math.log(1024)
  );

  return `${(
    bytes / Math.pow(1024, index)
  ).toFixed(1)} ${units[index]}`;
}


export default TeacherUploadNotesPage;