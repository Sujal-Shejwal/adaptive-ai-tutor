import {
  Users,
  FileText,
  BookOpen,
  TrendingUp,
  Upload,
  FileText as PdfIcon,
  Trash2,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  teacherStats,
  teacherDocuments,
  teacherSubjects,
} from "../../data/teacher";

const statIcons = {
  students: Users,
  notes: FileText,
  subjects: BookOpen,
  progress: TrendingUp,
};

export default function TeacherDashboardPage() {
  const navigate = useNavigate();

  const [selectedSubject, setSelectedSubject] = useState("All");

  // Local copy of dummy documents.
  // Later this will come from the backend/database.
  const [documents, setDocuments] = useState(teacherDocuments);

  const filteredDocuments = useMemo(() => {
    if (selectedSubject === "All") {
      return documents;
    }

    return documents.filter(
      (document) => document.subject === selectedSubject
    );
  }, [documents, selectedSubject]);

  // Delete document from the current UI
  const handleDeleteDocument = (documentId) => {
    setDocuments((currentDocuments) =>
      currentDocuments.filter(
        (document) => document.id !== documentId
      )
    );
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f8fafc] px-8 py-7">
      <div className="mx-auto max-w-[1025px]">

        {/* Heading */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[25px] font-bold leading-[30px] tracking-tight text-[#17233c]">
              Teacher Dashboard
            </h1>

            <p className="mt-[3px] text-[14px] leading-5 text-[#64748b]">
              Manage your course content and track student activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/teacher/upload-notes")}
            className="flex h-[40px] items-center gap-2 rounded-xl bg-[#2563eb] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Upload
              className="h-[15px] w-[15px]"
              strokeWidth={1.8}
            />

            Upload Notes
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-7 grid grid-cols-4 gap-4">
          {teacherStats.map((stat) => {
            const Icon = statIcons[stat.type];

            let iconStyle = "bg-[#dbeafe] text-[#2563eb]";

            if (stat.type === "notes") {
              iconStyle = "bg-[#d1fae5] text-[#10b981]";
            }

            if (stat.type === "subjects") {
              iconStyle = "bg-[#fef3c7] text-[#f59e0b]";
            }

            if (stat.type === "progress") {
              iconStyle = "bg-[#ede9fe] text-[#8b5cf6]";
            }

            return (
              <div
                key={stat.id}
                className="h-[139px] rounded-2xl border border-[#e2e8f0] bg-white px-5 py-5"
              >
                <div
                  className={`flex h-[38px] w-[38px] items-center justify-center rounded-xl ${iconStyle}`}
                >
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.8}
                  />
                </div>

                <p className="mt-[13px] text-[25px] font-bold leading-[30px] text-[#17233c]">
                  {stat.value}
                </p>

                <p className="mt-[1px] text-[13px] leading-5 text-[#64748b]">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Uploaded Documents */}
        <section className="mt-8 rounded-2xl border border-[#e2e8f0] bg-white">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-3 pt-6">
            <h2 className="text-[16px] font-bold leading-5 text-[#17233c]">
              Uploaded Documents
            </h2>

            <div className="flex items-center gap-2">
              {teacherSubjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => setSelectedSubject(subject)}
                  className={`rounded-lg px-[12px] py-[7px] text-[12px] font-medium transition ${
                    selectedSubject === subject
                      ? "bg-[#2563eb] text-white"
                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-gray-200"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="px-6 pb-4">

            {filteredDocuments.map((document, index) => (
              <div
                key={document.id}
                className={`group flex h-[76px] items-center gap-4 px-4 ${
                  index !== filteredDocuments.length - 1
                    ? "border-b border-[#f1f5f9]"
                    : ""
                }`}
              >
                {/* PDF icon */}
                <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-[#fff1f2]">
                  <PdfIcon
                    className="h-[19px] w-[19px] text-[#ff3b30]"
                    strokeWidth={1.7}
                  />
                </div>

                {/* File information */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium leading-5 text-[#17233c]">
                    {document.name}
                  </p>

                  <p className="mt-[2px] text-[12px] leading-4 text-[#94a3b8]">
                    {document.pages} pages · {document.size} · Uploaded{" "}
                    {document.uploadedDate}
                  </p>
                </div>

                {/* Subject */}
                <span
                  className={`rounded-lg px-3 py-[5px] text-[11px] font-medium ${
                    document.subject === "DBMS"
                      ? "bg-[#dbeafe] text-[#2563eb]"
                      : document.subject === "OS"
                        ? "bg-[#d1fae5] text-[#10b981]"
                        : document.subject === "CN"
                          ? "bg-[#fef3c7] text-[#f59e0b]"
                          : "bg-[#ede9fe] text-[#8b5cf6]"
                  }`}
                >
                  {document.subject}
                </span>

                {/* Delete */}
                <button
                  type="button"
                  title={`Delete ${document.name}`}
                  aria-label={`Delete ${document.name}`}
                  onClick={() => handleDeleteDocument(document.id)}
                  className="rounded-lg p-2 text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash2
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                </button>
              </div>
            ))}

            {/* Empty state */}
            {filteredDocuments.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-gray-300" />

                <p className="mt-3 text-sm text-gray-500">
                  No documents found.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}