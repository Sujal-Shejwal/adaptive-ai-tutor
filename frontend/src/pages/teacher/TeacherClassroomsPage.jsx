import { useEffect, useState } from "react";

import {
  Plus,
  Users,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  UserCircle2,
  UserMinus,
  Share2,
  Mail,
  MessageCircle,
  Link2,
  Upload,
  FileSpreadsheet,
  FileText,
  Send,
} from "lucide-react";

const API_BASE = "http://localhost:8080";

export default function TeacherClassroomsPage() {
  // =====================================================
  // CLASSROOM STATE
  // =====================================================

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // CREATE CLASSROOM STATE
  // =====================================================

  const [classroomName, setClassroomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // =====================================================
  // COPY JOIN CODE STATE
  // =====================================================

  const [copiedCode, setCopiedCode] = useState("");

  // =====================================================
  // STUDENT LIST STATE
  // =====================================================

  const [expandedClassroomId, setExpandedClassroomId] = useState(null);

  const [studentsByClassroom, setStudentsByClassroom] = useState({});
  const [studentsLoading, setStudentsLoading] = useState({});
  const [studentsError, setStudentsError] = useState({});

  // =====================================================
  // REMOVE STUDENT STATE
  // =====================================================

  const [removingStudentKey, setRemovingStudentKey] = useState("");

  // =====================================================
  // INDIVIDUAL INVITATION STATE
  // =====================================================

  const [invitationsByClassroom, setInvitationsByClassroom] = useState({});
  const [invitationLoading, setInvitationLoading] = useState({});
  const [invitationError, setInvitationError] = useState({});
  const [copiedInvitation, setCopiedInvitation] = useState("");

  // =====================================================
  // BULK INVITATION STATE
  // =====================================================

  const [bulkStudentsByClassroom, setBulkStudentsByClassroom] = useState({});
  const [bulkFileNameByClassroom, setBulkFileNameByClassroom] = useState({});
  const [bulkParseLoading, setBulkParseLoading] = useState({});
  const [bulkSendLoading, setBulkSendLoading] = useState({});
  const [bulkError, setBulkError] = useState({});
  const [bulkResults, setBulkResults] = useState({});

  // =====================================================
  // GET TEACHER ID
  // =====================================================

  const getTeacherId = () => {
    const storedId = localStorage.getItem("userId");

    if (storedId) {
      const parsedId = Number(storedId);

      if (!Number.isNaN(parsedId) && parsedId > 0) {
        return parsedId;
      }
    }

    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      const parsedId = storedUser?.id
        ? Number(storedUser.id)
        : null;

      return parsedId && !Number.isNaN(parsedId)
        ? parsedId
        : null;
    } catch {
      return null;
    }
  };

  // =====================================================
  // LOAD CLASSROOMS
  // =====================================================

  const loadClassrooms = async () => {
    const teacherId = getTeacherId();

    if (!teacherId) {
      setError("Teacher account not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/classrooms/teacher/${teacherId}`
      );

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to load classrooms."
        );
      }

      setClassrooms(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error(
        "Error loading classrooms:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to load classrooms."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  // =====================================================
  // CREATE CLASSROOM
  // =====================================================

  const handleCreateClassroom = async (event) => {
    event.preventDefault();

    const trimmedName = classroomName.trim();

    if (!trimmedName) {
      setCreateError("Classroom name is required.");
      return;
    }

    const teacherId = getTeacherId();

    if (!teacherId) {
      setCreateError("Teacher account not found.");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");

      const response = await fetch(
        `${API_BASE}/api/classrooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            teacherId,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to create classroom."
        );
      }

      setClassrooms((current) => [
        data,
        ...current,
      ]);

      setClassroomName("");
    } catch (requestError) {
      console.error(
        "Error creating classroom:",
        requestError
      );

      setCreateError(
        requestError?.message ||
          "Unable to create classroom."
      );
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // COPY JOIN CODE
  // =====================================================

  const handleCopyCode = async (joinCode) => {
    try {
      await navigator.clipboard.writeText(joinCode);

      setCopiedCode(joinCode);

      setTimeout(() => {
        setCopiedCode("");
      }, 1800);
    } catch {
      setCopiedCode("");
    }
  };

  // =====================================================
  // LOAD CLASSROOM STUDENTS
  // =====================================================

  const loadStudents = async (classroomId) => {
    try {
      setStudentsLoading((current) => ({
        ...current,
        [classroomId]: true,
      }));

      setStudentsError((current) => ({
        ...current,
        [classroomId]: "",
      }));

      const response = await fetch(
        `${API_BASE}/api/classrooms/${classroomId}/students`
      );

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to load students."
        );
      }

      setStudentsByClassroom((current) => ({
        ...current,
        [classroomId]: Array.isArray(data)
          ? data
          : [],
      }));
    } catch (requestError) {
      console.error(
        "Error loading students:",
        requestError
      );

      setStudentsError((current) => ({
        ...current,
        [classroomId]:
          requestError?.message ||
          "Unable to load students.",
      }));
    } finally {
      setStudentsLoading((current) => ({
        ...current,
        [classroomId]: false,
      }));
    }
  };

  // =====================================================
  // TOGGLE STUDENTS
  // =====================================================

  const handleToggleStudents = async (classroomId) => {
    if (expandedClassroomId === classroomId) {
      setExpandedClassroomId(null);
      return;
    }

    setExpandedClassroomId(classroomId);

    if (
      !Object.prototype.hasOwnProperty.call(
        studentsByClassroom,
        classroomId
      )
    ) {
      await loadStudents(classroomId);
    }
  };

  // =====================================================
  // REMOVE STUDENT
  // =====================================================

  const handleRemoveStudent = async (
    classroomId,
    studentId,
    studentName
  ) => {
    const confirmed = window.confirm(
      `Remove ${
        studentName || "this student"
      } from this classroom?`
    );

    if (!confirmed) {
      return;
    }

    const teacherId = getTeacherId();

    if (!teacherId) {
      window.alert("Teacher account not found.");
      return;
    }

    const studentKey = `${classroomId}-${studentId}`;

    try {
      setRemovingStudentKey(studentKey);

      const response = await fetch(
        `${API_BASE}/api/classrooms/${classroomId}/students/${studentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacherId,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to remove student."
        );
      }

      setStudentsByClassroom((current) => ({
        ...current,
        [classroomId]: (
          current[classroomId] || []
        ).filter(
          (enrollment) =>
            enrollment?.student?.id !== studentId
        ),
      }));
    } catch (requestError) {
      console.error(
        "Error removing student:",
        requestError
      );

      window.alert(
        requestError?.message ||
          "Unable to remove student."
      );
    } finally {
      setRemovingStudentKey("");
    }
  };

  // =====================================================
  // CREATE INVITATION
  // =====================================================

  const createInvitation = async (classroomId) => {
    const teacherId = getTeacherId();

    if (!teacherId) {
      throw new Error("Teacher account not found.");
    }

    const response = await fetch(
      `${API_BASE}/api/classroom-invitations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classroomId,
          teacherId,
        }),
      }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.error || "Unable to create invitation."
      );
    }

    return data;
  };

  // =====================================================
  // GET / CREATE INVITATION FOR CLASSROOM
  // =====================================================

  const getInvitationForClassroom = async (
    classroomId
  ) => {
    if (
      invitationsByClassroom[classroomId]?.token
    ) {
      return invitationsByClassroom[classroomId];
    }

    try {
      setInvitationLoading((current) => ({
        ...current,
        [classroomId]: true,
      }));

      setInvitationError((current) => ({
        ...current,
        [classroomId]: "",
      }));

      const invitation =
        await createInvitation(classroomId);

      setInvitationsByClassroom((current) => ({
        ...current,
        [classroomId]: invitation,
      }));

      return invitation;
    } catch (requestError) {
      console.error(
        "Invitation error:",
        requestError
      );

      setInvitationError((current) => ({
        ...current,
        [classroomId]:
          requestError?.message ||
          "Unable to create invitation.",
      }));

      return null;
    } finally {
      setInvitationLoading((current) => ({
        ...current,
        [classroomId]: false,
      }));
    }
  };

  // =====================================================
  // BUILD INVITATION LINK
  // =====================================================

  const buildInvitationLink = (token) => {
    if (!token) {
      return "";
    }

    return `${window.location.origin}/student/invite/${encodeURIComponent(
      token
    )}`;
  };

  // =====================================================
  // COPY INVITATION
  // =====================================================

  const handleCopyInvitation = async (classroom) => {
    const invitation =
      await getInvitationForClassroom(
        classroom.id
      );

    if (!invitation?.token) {
      return;
    }

    const invitationLink =
      buildInvitationLink(invitation.token);

    const message =
      `You are invited to join ${classroom.name} on Adaptive AI Tutor.\n\n` +
      `Join link: ${invitationLink}\n\n` +
      `Classroom Join Code: ${classroom.joinCode}`;

    try {
      await navigator.clipboard.writeText(message);

      setCopiedInvitation(classroom.id);

      setTimeout(() => {
        setCopiedInvitation("");
      }, 2000);
    } catch {
      window.alert(message);
    }
  };

  // =====================================================
  // WHATSAPP INVITATION
  // =====================================================

  const handleWhatsApp = async (classroom) => {
    const invitation =
      await getInvitationForClassroom(
        classroom.id
      );

    if (!invitation?.token) {
      return;
    }

    const invitationLink =
      buildInvitationLink(invitation.token);

    const message =
      `Hello! You are invited to join ${classroom.name} on Adaptive AI Tutor.\n\n` +
      `Open this invitation link:\n${invitationLink}\n\n` +
      `After opening it, log in and enter this classroom join code: ${classroom.joinCode}`;

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // EMAIL INVITATION
  // =====================================================

  const handleEmail = async (classroom) => {
    const invitation =
      await getInvitationForClassroom(
        classroom.id
      );

    if (!invitation?.token) {
      return;
    }

    const invitationLink =
      buildInvitationLink(invitation.token);

    const subject =
      `Invitation to join ${classroom.name}`;

    const body =
      `Hello,\n\n` +
      `You are invited to join ${classroom.name} on Adaptive AI Tutor.\n\n` +
      `Open this invitation link:\n${invitationLink}\n\n` +
      `After opening the link, log in and enter the classroom join code:\n${classroom.joinCode}\n\n` +
      `This invitation is valid for 24 hours.\n\n` +
      `Thank you.`;

    window.location.href =
      `mailto:?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
  };

  // =====================================================
  // BULK FILE PARSE
  // =====================================================

  const handleBulkFileChange = async (
    event,
    classroomId
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileName =
      file.name || "student-list";

    const lowerName = fileName.toLowerCase();

    if (
      !lowerName.endsWith(".xlsx") &&
      !lowerName.endsWith(".pdf")
    ) {
      setBulkError((current) => ({
        ...current,
        [classroomId]:
          "Please upload an Excel (.xlsx) or PDF file.",
      }));

      event.target.value = "";
      return;
    }

    try {
      setBulkParseLoading((current) => ({
        ...current,
        [classroomId]: true,
      }));

      setBulkError((current) => ({
        ...current,
        [classroomId]: "",
      }));

      setBulkResults((current) => ({
        ...current,
        [classroomId]: null,
      }));

      setBulkStudentsByClassroom((current) => ({
        ...current,
        [classroomId]: [],
      }));

      setBulkFileNameByClassroom((current) => ({
        ...current,
        [classroomId]: fileName,
      }));

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_BASE}/api/classroom-invitations/parse-student-file`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to read the uploaded student file."
        );
      }

      const students = Array.isArray(
        data?.students
      )
        ? data.students
        : [];

      setBulkStudentsByClassroom((current) => ({
        ...current,
        [classroomId]: students,
      }));
    } catch (requestError) {
      console.error(
        "Bulk file parsing error:",
        requestError
      );

      setBulkStudentsByClassroom((current) => ({
        ...current,
        [classroomId]: [],
      }));

      setBulkError((current) => ({
        ...current,
        [classroomId]:
          requestError?.message ||
          "Unable to process the student file.",
      }));
    } finally {
      setBulkParseLoading((current) => ({
        ...current,
        [classroomId]: false,
      }));

      event.target.value = "";
    }
  };

  // =====================================================
  // SEND BULK INVITATIONS
  // =====================================================

  const handleSendBulkInvitations = async (
    classroom
  ) => {
    const teacherId = getTeacherId();

    if (!teacherId) {
      setBulkError((current) => ({
        ...current,
        [classroom.id]:
          "Teacher account not found.",
      }));

      return;
    }

    const students =
      bulkStudentsByClassroom[classroom.id] || [];

    if (students.length === 0) {
      setBulkError((current) => ({
        ...current,
        [classroom.id]:
          "Please upload a valid Excel or PDF student list first.",
      }));

      return;
    }

    try {
      setBulkSendLoading((current) => ({
        ...current,
        [classroom.id]: true,
      }));

      setBulkError((current) => ({
        ...current,
        [classroom.id]: "",
      }));

      setBulkResults((current) => ({
        ...current,
        [classroom.id]: null,
      }));

      const response = await fetch(
        `${API_BASE}/api/classroom-invitations/bulk-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            classroomId: classroom.id,
            teacherId,
            frontendBaseUrl:
              window.location.origin,
            students,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to send bulk invitations."
        );
      }

      setBulkResults((current) => ({
        ...current,
        [classroom.id]: data,
      }));
    } catch (requestError) {
      console.error(
        "Bulk invitation error:",
        requestError
      );

      setBulkError((current) => ({
        ...current,
        [classroom.id]:
          requestError?.message ||
          "Unable to send bulk invitations.",
      }));
    } finally {
      setBulkSendLoading((current) => ({
        ...current,
        [classroom.id]: false,
      }));
    }
  };

  // =====================================================
  // CLEAR BULK DATA
  // =====================================================

  const handleClearBulkData = (classroomId) => {
    setBulkStudentsByClassroom((current) => ({
      ...current,
      [classroomId]: [],
    }));

    setBulkFileNameByClassroom((current) => ({
      ...current,
      [classroomId]: "",
    }));

    setBulkResults((current) => ({
      ...current,
      [classroomId]: null,
    }));

    setBulkError((current) => ({
      ...current,
      [classroomId]: "",
    }));
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                My Classrooms
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create classrooms and manage your students.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              <Users size={17} />

              {classrooms.length}{" "}
              {classrooms.length === 1
                ? "Classroom"
                : "Classrooms"}
            </div>
          </div>
        </div>

        {/* =================================================
            CREATE CLASSROOM
        ================================================= */}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Plus
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Create Classroom
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                A unique join code will be generated automatically.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCreateClassroom}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={classroomName}
              onChange={(event) =>
                setClassroomName(
                  event.target.value
                )
              }
              placeholder="Example: Data Structures Batch B"
              className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={creating}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Plus size={17} />
              )}

              {creating
                ? "Creating..."
                : "Create Classroom"}
            </button>
          </form>

          {createError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} />
              {createError}
            </div>
          )}
        </section>

        {/* =================================================
            GLOBAL ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
            <Loader2
              size={20}
              className="mr-2 animate-spin"
            />
            Loading classrooms...
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading &&
          !error &&
          classrooms.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Users
                  size={25}
                  className="text-slate-400"
                />
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-800">
                No classrooms yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first classroom above to start adding students.
              </p>
            </div>
          )}

        {/* =================================================
            CLASSROOM LIST
        ================================================= */}

        {!loading &&
          classrooms.length > 0 && (
            <div className="grid grid-cols-1 gap-5">

              {classrooms.map((classroom) => {
                const isExpanded =
                  expandedClassroomId ===
                  classroom.id;

                const students =
                  studentsByClassroom[
                    classroom.id
                  ] || [];

                const isStudentsLoading =
                  studentsLoading[
                    classroom.id
                  ];

                const studentError =
                  studentsError[
                    classroom.id
                  ];

                const isInvitationLoading =
                  invitationLoading[
                    classroom.id
                  ];

                const classroomInvitationError =
                  invitationError[
                    classroom.id
                  ];

                const invitation =
                  invitationsByClassroom[
                    classroom.id
                  ];

                // -------------------------------------------------
                // BULK DATA FOR THIS CLASSROOM
                // -------------------------------------------------

                const bulkStudents =
                  bulkStudentsByClassroom[
                    classroom.id
                  ] || [];

                const bulkFileName =
                  bulkFileNameByClassroom[
                    classroom.id
                  ] || "";

                const isBulkParsing =
                  bulkParseLoading[
                    classroom.id
                  ];

                const isBulkSending =
                  bulkSendLoading[
                    classroom.id
                  ];

                const currentBulkError =
                  bulkError[
                    classroom.id
                  ];

                const currentBulkResult =
                  bulkResults[
                    classroom.id
                  ];

                return (
                  <div
                    key={classroom.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >

                    {/* =================================
                        CLASSROOM DETAILS
                    ================================= */}

                    <div className="p-6">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {classroom.name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            Classroom ID:{" "}
                            {classroom.id}
                          </p>
                        </div>

                        <span className="w-fit rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          Active
                        </span>
                      </div>

                      {/* =================================
                          JOIN CODE
                      ================================= */}

                      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Student Join Code
                        </p>

                        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-2xl font-bold tracking-[0.2em] text-slate-900">
                            {classroom.joinCode}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCode(
                                classroom.joinCode
                              )
                            }
                            className="flex w-fit items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                          >
                            {copiedCode ===
                            classroom.joinCode ? (
                              <>
                                <CheckCircle2
                                  size={15}
                                />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={15} />
                                Copy
                              </>
                            )}
                          </button>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          Students can use this code to join the classroom.
                        </p>
                      </div>

                      {/* =================================
                          INVITATION
                      ================================= */}

                      <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-4">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600">
                              <Share2 size={18} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Invite Student
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Share a secure invitation link with students.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={
                              isInvitationLoading
                            }
                            onClick={() =>
                              handleCopyInvitation(
                                classroom
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isInvitationLoading ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : copiedInvitation ===
                              classroom.id ? (
                              <CheckCircle2
                                size={15}
                              />
                            ) : (
                              <Link2 size={15} />
                            )}

                            {isInvitationLoading
                              ? "Preparing..."
                              : copiedInvitation ===
                                  classroom.id
                                ? "Copied"
                                : "Copy Invitation"}
                          </button>
                        </div>

                        {/* INVITATION ACTIONS */}

                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">

                          <button
                            type="button"
                            disabled={
                              isInvitationLoading
                            }
                            onClick={() =>
                              handleWhatsApp(
                                classroom
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2.5 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isInvitationLoading ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <MessageCircle
                                size={15}
                              />
                            )}

                            WhatsApp
                          </button>

                          <button
                            type="button"
                            disabled={
                              isInvitationLoading
                            }
                            onClick={() =>
                              handleEmail(
                                classroom
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isInvitationLoading ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Mail size={15} />
                            )}

                            Email
                          </button>

                          <button
                            type="button"
                            disabled={
                              isInvitationLoading
                            }
                            onClick={() =>
                              handleCopyInvitation(
                                classroom
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isInvitationLoading ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Copy size={15} />
                            )}

                            Copy
                          </button>
                        </div>

                        {/* =================================
                            BULK INVITATIONS
                        ================================= */}

                        <div className="mt-5 rounded-xl border border-blue-200 bg-white p-4">

                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Upload size={18} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  Bulk Invitations
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  Upload an Excel or PDF student list and send invitation emails to everyone automatically.
                                </p>
                              </div>
                            </div>

                            {bulkStudents.length > 0 && (
                              <span className="w-fit rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                Students detected:{" "}
                                {bulkStudents.length}
                              </span>
                            )}
                          </div>

                          {/* FILE UPLOAD */}

                          <div className="mt-4">
                            <label className="flex min-h-[92px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
                              {isBulkParsing ? (
                                <>
                                  <Loader2
                                    size={23}
                                    className="animate-spin text-blue-600"
                                  />

                                  <p className="mt-2 text-xs font-semibold text-slate-700">
                                    Reading student file...
                                  </p>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <FileSpreadsheet
                                      size={20}
                                      className="text-emerald-600"
                                    />

                                    <FileText
                                      size={20}
                                      className="text-red-500"
                                    />
                                  </div>

                                  <p className="mt-2 text-xs font-semibold text-slate-700">
                                    Click to upload Excel or PDF
                                  </p>

                                  <p className="mt-1 text-[11px] text-slate-400">
                                    Supported: .xlsx and .pdf
                                  </p>
                                </>
                              )}

                              <input
                                type="file"
                                accept=".xlsx,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
                                className="hidden"
                                disabled={
                                  isBulkParsing ||
                                  isBulkSending
                                }
                                onChange={(event) =>
                                  handleBulkFileChange(
                                    event,
                                    classroom.id
                                  )
                                }
                              />
                            </label>

                            {bulkFileName && (
                              <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  {bulkFileName
                                    .toLowerCase()
                                    .endsWith(
                                      ".xlsx"
                                    ) ? (
                                    <FileSpreadsheet
                                      size={15}
                                      className="shrink-0 text-emerald-600"
                                    />
                                  ) : (
                                    <FileText
                                      size={15}
                                      className="shrink-0 text-red-500"
                                    />
                                  )}

                                  <span className="truncate text-xs font-medium text-slate-700">
                                    {bulkFileName}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleClearBulkData(
                                      classroom.id
                                    )
                                  }
                                  disabled={
                                    isBulkSending
                                  }
                                  className="ml-3 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-white hover:text-red-600 disabled:opacity-50"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </div>

                          {/* PREVIEW */}

                          {bulkStudents.length > 0 && (
                            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">

                              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                                <p className="text-xs font-semibold text-slate-800">
                                  Students detected
                                </p>

                                <p className="mt-1 text-[11px] text-slate-500">
                                  Review the imported names and email addresses before sending.
                                </p>
                              </div>

                              <div className="max-h-56 overflow-y-auto">

                                {bulkStudents.map(
                                  (student, index) => (
                                    <div
                                      key={`${student.email}-${index}`}
                                      className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
                                    >
                                      <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                                          {index + 1}
                                        </div>

                                        <div className="min-w-0">
                                          <p className="truncate text-xs font-semibold text-slate-800">
                                            {student?.name ||
                                              "Student"}
                                          </p>

                                          <p className="truncate text-[11px] text-slate-400">
                                            {student?.email ||
                                              "No email"}
                                          </p>
                                        </div>
                                      </div>

                                      <CheckCircle2
                                        size={16}
                                        className="shrink-0 text-emerald-500"
                                      />
                                    </div>
                                  )
                                )}

                              </div>
                            </div>
                          )}

                          {/* SEND BUTTON */}

                          <button
                            type="button"
                            disabled={
                              bulkStudents.length ===
                                0 ||
                              isBulkParsing ||
                              isBulkSending
                            }
                            onClick={() =>
                              handleSendBulkInvitations(
                                classroom
                              )
                            }
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBulkSending ? (
                              <>
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                                Sending invitations...
                              </>
                            ) : (
                              <>
                                <Send size={17} />
                                Send Invitations to All
                              </>
                            )}
                          </button>

                          {/* BULK ERROR */}

                          {currentBulkError && (
                            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-3 text-xs text-red-600">
                              <AlertCircle
                                size={15}
                                className="mt-0.5 shrink-0"
                              />

                              <span>
                                {currentBulkError}
                              </span>
                            </div>
                          )}

                          {/* BULK RESULT */}

                          {currentBulkResult && (
                            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                              <div className="flex items-start gap-3">
                                <CheckCircle2
                                  size={19}
                                  className="mt-0.5 shrink-0 text-emerald-600"
                                />

                                <div>
                                  <p className="text-sm font-semibold text-emerald-800">
                                    Bulk invitation process completed
                                  </p>

                                  <p className="mt-1 text-xs text-emerald-700">
                                    {currentBulkResult.sent || 0} sent,{" "}
                                    {currentBulkResult.failed || 0} failed out of{" "}
                                    {currentBulkResult.total || 0}.
                                  </p>
                                </div>
                              </div>

                              {Array.isArray(
                                currentBulkResult.results
                              ) &&
                                currentBulkResult
                                  .results.length > 0 && (
                                  <div className="mt-4 space-y-2">

                                    {currentBulkResult.results.map(
                                      (
                                        result,
                                        index
                                      ) => {
                                        const success =
                                          String(
                                            result?.status ||
                                              ""
                                          ).toUpperCase() ===
                                          "SENT";

                                        return (
                                          <div
                                            key={`${result?.email}-${index}`}
                                            className="flex flex-col gap-2 rounded-lg border border-white bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                                          >

                                            <div className="min-w-0">
                                              <p className="truncate text-xs font-semibold text-slate-800">
                                                {result?.name ||
                                                  "Student"}
                                              </p>

                                              <p className="truncate text-[11px] text-slate-400">
                                                {result?.email ||
                                                  "No email"}
                                              </p>
                                            </div>

                                            <span
                                              className={`w-fit rounded-md px-2 py-1 text-[10px] font-bold ${
                                                success
                                                  ? "bg-emerald-100 text-emerald-700"
                                                  : "bg-red-100 text-red-700"
                                              }`}
                                            >
                                              {result?.status ||
                                                "UNKNOWN"}
                                            </span>
                                          </div>
                                        );
                                      }
                                    )}

                                  </div>
                                )}
                            </div>
                          )}
                        </div>

                        {/* INVITATION EXPIRATION */}

                        {invitation && (
                          <div className="mt-4 rounded-lg border border-violet-100 bg-white px-3 py-2">
                            <p className="text-[11px] font-medium text-slate-400">
                              Invitation expires
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-700">
                              {invitation.expiresAt
                                ? new Date(
                                    invitation.expiresAt
                                  ).toLocaleString(
                                    "en-IN"
                                  )
                                : "24 hours from creation"}
                            </p>
                          </div>
                        )}

                        {classroomInvitationError && (
                          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                            <AlertCircle size={14} />
                            {classroomInvitationError}
                          </div>
                        )}
                      </div>

                      {/* =================================
                          VIEW STUDENTS
                      ================================= */}

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStudents(
                            classroom.id
                          )
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Users size={17} />

                        {isExpanded
                          ? "Hide Students"
                          : "View Students"}

                        {isExpanded ? (
                          <ChevronUp size={17} />
                        ) : (
                          <ChevronDown size={17} />
                        )}
                      </button>
                    </div>

                    {/* =================================
                        STUDENT LIST
                    ================================= */}

                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-50 px-6 py-5">

                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">
                              Enrolled Students
                            </h4>

                            <p className="mt-1 text-xs text-slate-500">
                              {isStudentsLoading
                                ? "Loading..."
                                : `${students.length} ${
                                    students.length ===
                                    1
                                      ? "student"
                                      : "students"
                                  } enrolled`}
                            </p>
                          </div>

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600">
                            <Users size={17} />
                          </div>
                        </div>

                        {/* STUDENT LOADING */}

                        {isStudentsLoading && (
                          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-8 text-sm text-slate-500">
                            <Loader2
                              size={18}
                              className="mr-2 animate-spin"
                            />

                            Loading students...
                          </div>
                        )}

                        {/* STUDENT ERROR */}

                        {!isStudentsLoading &&
                          studentError && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
                              <AlertCircle size={17} />
                              {studentError}
                            </div>
                          )}

                        {/* NO STUDENTS */}

                        {!isStudentsLoading &&
                          !studentError &&
                          students.length === 0 && (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                              <UserCircle2
                                size={28}
                                className="mx-auto text-slate-400"
                              />

                              <p className="mt-3 text-sm font-semibold text-slate-700">
                                No students enrolled yet
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Share the join code or invitation link with your students.
                              </p>
                            </div>
                          )}

                        {/* STUDENTS */}

                        {!isStudentsLoading &&
                          !studentError &&
                          students.length > 0 && (
                            <div className="space-y-3">

                              {students.map(
                                (enrollment) => {
                                  const student =
                                    enrollment?.student;

                                  const studentId =
                                    student?.id;

                                  const studentName =
                                    student?.name ||
                                    "Student";

                                  const studentKey = `${classroom.id}-${studentId}`;

                                  return (
                                    <div
                                      key={
                                        enrollment?.id
                                      }
                                      className="rounded-xl border border-slate-200 bg-white p-4"
                                    >
                                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                        <div className="flex items-center gap-3">
                                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                            <UserCircle2
                                              size={21}
                                            />
                                          </div>

                                          <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                              {studentName}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                              {student?.email ||
                                                "No email available"}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                          <span className="text-xs text-slate-400">
                                            Student ID:{" "}
                                            {studentId ||
                                              "—"}
                                          </span>

                                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                                            {enrollment?.status ||
                                              "ACTIVE"}
                                          </span>

                                          <button
                                            type="button"
                                            disabled={
                                              removingStudentKey ===
                                              studentKey
                                            }
                                            onClick={() =>
                                              handleRemoveStudent(
                                                classroom.id,
                                                studentId,
                                                studentName
                                              )
                                            }
                                            className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            {removingStudentKey ===
                                            studentKey ? (
                                              <Loader2
                                                size={14}
                                                className="animate-spin"
                                              />
                                            ) : (
                                              <UserMinus
                                                size={14}
                                              />
                                            )}

                                            {removingStudentKey ===
                                            studentKey
                                              ? "Removing..."
                                              : "Remove"}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}

                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}