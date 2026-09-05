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
  ClipboardList,
  Trash2,
  BarChart3,
  XCircle,
  Award,
  Percent,
  Eye,
  X,
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
  // QUIZ ASSIGNMENT STATE
  // =====================================================

  const [teacherQuizzes, setTeacherQuizzes] = useState([]);
  const [teacherQuizzesLoading, setTeacherQuizzesLoading] = useState(false);
  const [teacherQuizzesError, setTeacherQuizzesError] = useState("");
  const [selectedQuizByClassroom, setSelectedQuizByClassroom] = useState({});
  const [assignedQuizzesByClassroom, setAssignedQuizzesByClassroom] = useState({});
  const [assignedQuizzesLoading, setAssignedQuizzesLoading] = useState({});
  const [quizAssigning, setQuizAssigning] = useState("");
  const [quizRemoving, setQuizRemoving] = useState("");
  const [quizAssignmentError, setQuizAssignmentError] = useState({});

  // =====================================================
  // CLASSROOM RESULTS STATE
  // =====================================================

  const [expandedResultsClassroomId, setExpandedResultsClassroomId] = useState(null);
  const [classroomResultsByClassroom, setClassroomResultsByClassroom] = useState({});
  const [resultsLoading, setResultsLoading] = useState({});
  const [resultsError, setResultsError] = useState({});

  // =====================================================
  // INDIVIDUAL STUDENT ANALYTICS STATE
  // =====================================================

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentAnalytics, setSelectedStudentAnalytics] = useState(null);
  const [studentAnalyticsLoading, setStudentAnalyticsLoading] = useState(false);
  const [studentAnalyticsError, setStudentAnalyticsError] = useState("");

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
  // LOAD TEACHER QUIZZES
  // =====================================================

  const loadTeacherQuizzes = async () => {
    const teacherId = getTeacherId();

    if (!teacherId) {
      setTeacherQuizzesError("Teacher account not found.");
      return;
    }

    try {
      setTeacherQuizzesLoading(true);
      setTeacherQuizzesError("");

      const response = await fetch(
        `${API_BASE}/api/quizzes/teacher/${teacherId}`
      );

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to load your quizzes."
        );
      }

      setTeacherQuizzes(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error(
        "Error loading teacher quizzes:",
        requestError
      );

      setTeacherQuizzesError(
        requestError?.message ||
          "Unable to load your quizzes."
      );
    } finally {
      setTeacherQuizzesLoading(false);
    }
  };

  // =====================================================
  // LOAD ASSIGNED QUIZZES FOR CLASSROOM
  // =====================================================

  const loadAssignedQuizzes = async (classroomId) => {
    const teacherId = getTeacherId();

    if (!teacherId) {
      return;
    }

    try {
      setAssignedQuizzesLoading((current) => ({
        ...current,
        [classroomId]: true,
      }));

      setQuizAssignmentError((current) => ({
        ...current,
        [classroomId]: "",
      }));

      const response = await fetch(
        `${API_BASE}/api/quiz-assignments/classroom/${classroomId}/teacher/${teacherId}`
      );

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to load assigned quizzes."
        );
      }

      setAssignedQuizzesByClassroom((current) => ({
        ...current,
        [classroomId]: Array.isArray(data) ? data : [],
      }));
    } catch (requestError) {
      console.error(
        "Error loading assigned quizzes:",
        requestError
      );

      setQuizAssignmentError((current) => ({
        ...current,
        [classroomId]:
          requestError?.message ||
          "Unable to load assigned quizzes.",
      }));
    } finally {
      setAssignedQuizzesLoading((current) => ({
        ...current,
        [classroomId]: false,
      }));
    }
  };

  // =====================================================
  // ASSIGN QUIZ TO CLASSROOM
  // =====================================================

  const handleAssignQuiz = async (classroom) => {
    const teacherId = getTeacherId();
    const quizId = Number(
      selectedQuizByClassroom[classroom.id]
    );

    if (!teacherId) {
      setQuizAssignmentError((current) => ({
        ...current,
        [classroom.id]: "Teacher account not found.",
      }));
      return;
    }

    if (!quizId || quizId <= 0) {
      setQuizAssignmentError((current) => ({
        ...current,
        [classroom.id]:
          "Please select a quiz before assigning it.",
      }));
      return;
    }

    const alreadyAssigned =
      (assignedQuizzesByClassroom[classroom.id] || []).some(
        (assignment) => Number(assignment?.quizId) === quizId
      );

    if (alreadyAssigned) {
      setQuizAssignmentError((current) => ({
        ...current,
        [classroom.id]:
          "This quiz is already assigned to this classroom.",
      }));
      return;
    }

    const assignmentKey = `${classroom.id}-${quizId}`;

    try {
      setQuizAssigning(assignmentKey);
      setQuizAssignmentError((current) => ({
        ...current,
        [classroom.id]: "",
      }));

      const response = await fetch(
        `${API_BASE}/api/quiz-assignments/classroom/${classroom.id}/quiz/${quizId}/teacher/${teacherId}`,
        {
          method: "POST",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to assign quiz to classroom."
        );
      }

      setAssignedQuizzesByClassroom((current) => ({
        ...current,
        [classroom.id]: [
          ...(current[classroom.id] || []),
          data,
        ],
      }));

      setSelectedQuizByClassroom((current) => ({
        ...current,
        [classroom.id]: "",
      }));
    } catch (requestError) {
      console.error(
        "Quiz assignment error:",
        requestError
      );

      setQuizAssignmentError((current) => ({
        ...current,
        [classroom.id]:
          requestError?.message ||
          "Unable to assign quiz to classroom.",
      }));
    } finally {
      setQuizAssigning("");
    }
  };

  // =====================================================
  // REMOVE QUIZ ASSIGNMENT
  // =====================================================

  const handleRemoveQuizAssignment = async (
    classroom,
    assignment
  ) => {
    const teacherId = getTeacherId();
    const quizId = assignment?.quizId;

    if (!teacherId || !quizId) {
      window.alert("Invalid teacher or quiz information.");
      return;
    }

    const confirmed = window.confirm(
      `Remove "${assignment?.quizTitle || "this quiz"}" from ${classroom.name}?`
    );

    if (!confirmed) {
      return;
    }

    const removeKey = `${classroom.id}-${quizId}`;

    try {
      setQuizRemoving(removeKey);
      setQuizAssignmentError((current) => ({
        ...current,
        [classroom.id]: "",
      }));

      const response = await fetch(
        `${API_BASE}/api/quiz-assignments/classroom/${classroom.id}/quiz/${quizId}/teacher/${teacherId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to remove quiz assignment."
        );
      }

      setAssignedQuizzesByClassroom((current) => ({
        ...current,
        [classroom.id]: (
          current[classroom.id] || []
        ).filter(
          (item) => Number(item?.quizId) !== Number(quizId)
        ),
      }));
    } catch (requestError) {
      console.error(
        "Quiz removal error:",
        requestError
      );

      setQuizAssignmentError((current) => ({
        ...current,
        [classroom.id]:
          requestError?.message ||
          "Unable to remove quiz assignment.",
      }));
    } finally {
      setQuizRemoving("");
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

      const loadedClassrooms =
        Array.isArray(data) ? data : [];

      setClassrooms(loadedClassrooms);

      await Promise.all(
        loadedClassrooms.map((classroom) =>
          loadAssignedQuizzes(classroom.id)
        )
      );
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
    loadTeacherQuizzes();
  }, []);

  // =====================================================
  // LOAD CLASSROOM RESULTS
  // =====================================================

  const loadClassroomResults = async (classroomId) => {
    const teacherId = getTeacherId();

    if (!teacherId) return;

    try {
      setResultsLoading((current) => ({ ...current, [classroomId]: true }));
      setResultsError((current) => ({ ...current, [classroomId]: "" }));

      const response = await fetch(
        `${API_BASE}/api/quiz-assignments/classroom/${classroomId}/results/teacher/${teacherId}`,
        { cache: "no-store" }
      );

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message || data?.error || "Unable to load classroom results."
        );
      }

      setClassroomResultsByClassroom((current) => ({
        ...current,
        [classroomId]: Array.isArray(data) ? data : [],
      }));
    } catch (requestError) {
      console.error("Error loading classroom results:", requestError);
      setResultsError((current) => ({
        ...current,
        [classroomId]: requestError?.message || "Unable to load classroom results.",
      }));
    } finally {
      setResultsLoading((current) => ({ ...current, [classroomId]: false }));
    }
  };

  // =====================================================
  // TOGGLE CLASSROOM RESULTS
  // =====================================================

  const handleToggleResults = async (classroomId) => {
    if (expandedResultsClassroomId === classroomId) {
      setExpandedResultsClassroomId(null);
      return;
    }

    setExpandedResultsClassroomId(classroomId);

    if (!Object.prototype.hasOwnProperty.call(classroomResultsByClassroom, classroomId)) {
      await loadClassroomResults(classroomId);
    }
  };

  // =====================================================
  // LOAD INDIVIDUAL STUDENT ANALYTICS
  // =====================================================

  const handleViewStudentAnalytics = async (student) => {
    if (!student?.studentId) {
      return;
    }

    setSelectedStudent(student);
    setSelectedStudentAnalytics(null);
    setStudentAnalyticsError("");

    try {
      setStudentAnalyticsLoading(true);

      const response = await fetch(
        `${API_BASE}/api/performance/student/${student.studentId}`,
        { cache: "no-store" }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message ||
                data?.error ||
                "Unable to load student analytics."
        );
      }

      setSelectedStudentAnalytics(data || {});
    } catch (requestError) {
      console.error(
        "Error loading individual student analytics:",
        requestError
      );
      setStudentAnalyticsError(
        requestError?.message ||
          "Unable to load student analytics."
      );
    } finally {
      setStudentAnalyticsLoading(false);
    }
  };

  // =====================================================
  // CLOSE INDIVIDUAL STUDENT ANALYTICS
  // =====================================================

  const handleCloseStudentAnalytics = () => {
    setSelectedStudent(null);
    setSelectedStudentAnalytics(null);
    setStudentAnalyticsError("");
    setStudentAnalyticsLoading(false);
  };

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

    if (
      !Object.prototype.hasOwnProperty.call(
        assignedQuizzesByClassroom,
        classroomId
      )
    ) {
      await loadAssignedQuizzes(classroomId);
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

                const isResultsExpanded =
                  expandedResultsClassroomId === classroom.id;

                const classroomResults =
                  classroomResultsByClassroom[classroom.id] || [];

                const isResultsLoading =
                  resultsLoading[classroom.id];

                const currentResultsError =
                  resultsError[classroom.id];

                const submittedResults = classroomResults.filter(
                  (result) =>
                    String(result?.status || "").toUpperCase() === "SUBMITTED"
                );

                const averageScore = submittedResults.length > 0
                  ? Math.round(
                      submittedResults.reduce(
                        (sum, result) => sum + (Number(result?.score) || 0),
                        0
                      ) / submittedResults.length
                    )
                  : 0;

                const uniqueStudentIds = new Set(
                  classroomResults.map((result) => result?.studentId).filter(Boolean)
                );

                const uniqueQuizIds = new Set(
                  classroomResults.map((result) => result?.quizId).filter(Boolean)
                );

                const completionRate = classroomResults.length > 0
                  ? Math.round(
                      (submittedResults.length / classroomResults.length) * 100
                    )
                  : 0;

                const highestScore = submittedResults.length > 0
                  ? Math.max(
                      ...submittedResults.map(
                        (result) => Number(result?.score) || 0
                      )
                    )
                  : null;

                const lowestScore = submittedResults.length > 0
                  ? Math.min(
                      ...submittedResults.map(
                        (result) => Number(result?.score) || 0
                      )
                    )
                  : null;

                const quizAnalytics = Array.from(
                  classroomResults.reduce(
                    (groups, result) => {
                      const key = result?.quizId;

                      if (!key) {
                        return groups;
                      }

                      if (!groups.has(key)) {
                        groups.set(key, {
                          quizId: key,
                          quizTitle: result?.quizTitle || "Quiz",
                          total: 0,
                          submitted: 0,
                          scores: [],
                        });
                      }

                      const group = groups.get(key);
                      group.total += 1;

                      if (
                        String(result?.status || "").toUpperCase() ===
                        "SUBMITTED"
                      ) {
                        group.submitted += 1;
                        group.scores.push(Number(result?.score) || 0);
                      }

                      return groups;
                    },
                    new Map()
                  ).values()
                ).map((group) => ({
                  ...group,
                  completionRate: group.total > 0
                    ? Math.round((group.submitted / group.total) * 100)
                    : 0,
                  averageScore: group.scores.length > 0
                    ? Math.round(
                        group.scores.reduce((sum, score) => sum + score, 0) /
                          group.scores.length
                      )
                    : null,
                }));

                const studentAnalytics = Array.from(
                  classroomResults.reduce(
                    (groups, result) => {
                      const key = result?.studentId;

                      if (!key) {
                        return groups;
                      }

                      if (!groups.has(key)) {
                        groups.set(key, {
                          studentId: key,
                          studentName: result?.studentName || "Student",
                          studentEmail: result?.studentEmail || "No email",
                          assigned: 0,
                          submitted: 0,
                          scores: [],
                        });
                      }

                      const group = groups.get(key);
                      group.assigned += 1;

                      if (
                        String(result?.status || "").toUpperCase() ===
                        "SUBMITTED"
                      ) {
                        group.submitted += 1;
                        group.scores.push(Number(result?.score) || 0);
                      }

                      return groups;
                    },
                    new Map()
                  ).values()
                ).map((group) => ({
                  ...group,
                  completionRate: group.assigned > 0
                    ? Math.round((group.submitted / group.assigned) * 100)
                    : 0,
                  averageScore: group.scores.length > 0
                    ? Math.round(
                        group.scores.reduce((sum, score) => sum + score, 0) /
                          group.scores.length
                      )
                    : null,
                })).sort((a, b) => {
                  if (b.submitted !== a.submitted) {
                    return b.submitted - a.submitted;
                  }

                  return String(a.studentName).localeCompare(
                    String(b.studentName)
                  );
                });

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
                          QUIZ ASSIGNMENTS
                      ================================= */}

                      <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600">
                              <ClipboardList size={18} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Quiz Assignments
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Assign one of your quizzes to this classroom.
                              </p>
                            </div>
                          </div>

                          <span className="w-fit rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-amber-700">
                            {(
                              assignedQuizzesByClassroom[classroom.id] || []
                            ).length} assigned
                          </span>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <select
                            value={
                              selectedQuizByClassroom[classroom.id] || ""
                            }
                            onChange={(event) => {
                              setSelectedQuizByClassroom((current) => ({
                                ...current,
                                [classroom.id]: event.target.value,
                              }));

                              setQuizAssignmentError((current) => ({
                                ...current,
                                [classroom.id]: "",
                              }));
                            }}
                            disabled={
                              teacherQuizzesLoading ||
                              teacherQuizzes.length === 0 ||
                              !!quizAssigning
                            }
                            className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            <option value="">
                              {teacherQuizzesLoading
                                ? "Loading your quizzes..."
                                : teacherQuizzes.length === 0
                                  ? "No quizzes found"
                                  : "Select a quiz to assign"}
                            </option>

                            {teacherQuizzes.map((quiz) => {
                              const isAlreadyAssigned =
                                (
                                  assignedQuizzesByClassroom[
                                    classroom.id
                                  ] || []
                                ).some(
                                  (assignment) =>
                                    Number(assignment?.quizId) ===
                                    Number(quiz?.id)
                                );

                              return (
                                <option
                                  key={quiz.id}
                                  value={quiz.id}
                                  disabled={isAlreadyAssigned}
                                >
                                  {quiz.title}
                                  {isAlreadyAssigned
                                    ? " (Already assigned)"
                                    : ""}
                                </option>
                              );
                            })}
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              handleAssignQuiz(classroom)
                            }
                            disabled={
                              !selectedQuizByClassroom[classroom.id] ||
                              teacherQuizzesLoading ||
                              !!quizAssigning
                            }
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {quizAssigning ? (
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <ClipboardList size={17} />
                            )}

                            {quizAssigning
                              ? "Assigning..."
                              : "Assign Quiz"}
                          </button>
                        </div>

                        {teacherQuizzesError && (
                          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                            <AlertCircle size={14} />
                            {teacherQuizzesError}
                          </div>
                        )}

                        {quizAssignmentError[classroom.id] && (
                          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                            <AlertCircle size={14} />
                            {quizAssignmentError[classroom.id]}
                          </div>
                        )}

                        <div className="mt-4">
                          {assignedQuizzesLoading[classroom.id] ? (
                            <div className="flex items-center justify-center rounded-xl border border-white bg-white py-7 text-sm text-slate-500">
                              <Loader2
                                size={18}
                                className="mr-2 animate-spin"
                              />
                              Loading assigned quizzes...
                            </div>
                          ) : (
                            <>
                              {(
                                assignedQuizzesByClassroom[
                                  classroom.id
                                ] || []
                              ).length === 0 ? (
                                <div className="rounded-xl border border-dashed border-amber-200 bg-white px-5 py-7 text-center">
                                  <ClipboardList
                                    size={27}
                                    className="mx-auto text-amber-400"
                                  />

                                  <p className="mt-3 text-sm font-semibold text-slate-700">
                                    No quizzes assigned yet
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    Select a quiz above to make it available to enrolled students.
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {(
                                    assignedQuizzesByClassroom[
                                      classroom.id
                                    ] || []
                                  ).map((assignment) => {
                                    const removeKey =
                                      `${classroom.id}-${assignment?.quizId}`;

                                    return (
                                      <div
                                        key={
                                          assignment?.assignmentId ||
                                          `${classroom.id}-${assignment?.quizId}`
                                        }
                                        className="rounded-xl border border-white bg-white p-4"
                                      >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                          <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                              <ClipboardList size={18} />
                                            </div>

                                            <div className="min-w-0">
                                              <p className="text-sm font-semibold text-slate-800">
                                                {assignment?.quizTitle ||
                                                  "Untitled Quiz"}
                                              </p>

                                              <div className="mt-2 flex flex-wrap gap-2">
                                                <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                                                  {assignment?.subjectName ||
                                                    "Subject"}
                                                </span>

                                                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                                                  {assignment?.duration || 0} minutes
                                                </span>

                                                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                                  {assignment?.status ||
                                                    "ACTIVE"}
                                                </span>

                                                {assignment?.dueAt && (
                                                  <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                                                    Due {new Date(
                                                      assignment.dueAt
                                                    ).toLocaleString(
                                                      "en-IN"
                                                    )}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveQuizAssignment(
                                                classroom,
                                                assignment
                                              )
                                            }
                                            disabled={
                                              quizRemoving === removeKey
                                            }
                                            className="flex w-fit items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            {quizRemoving === removeKey ? (
                                              <Loader2
                                                size={14}
                                                className="animate-spin"
                                              />
                                            ) : (
                                              <Trash2 size={14} />
                                            )}

                                            {quizRemoving === removeKey
                                              ? "Removing..."
                                              : "Remove"}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* =================================
                          CLASSROOM RESULTS
                      ================================= */}

                      <button
                        type="button"
                        onClick={() => handleToggleResults(classroom.id)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <BarChart3 size={17} />
                        {isResultsExpanded ? "Hide Results" : "View Results"}
                        {isResultsExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                      </button>

                      {isResultsExpanded && (
                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">Classroom Results</h4>
                              <p className="mt-1 text-xs text-slate-500">
                                Submission status and scores for students in this classroom.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => loadClassroomResults(classroom.id)}
                              className="w-fit rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                            >
                              Refresh Results
                            </button>
                          </div>

                          {isResultsLoading ? (
                            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-8 text-sm text-slate-500">
                              <Loader2 size={18} className="mr-2 animate-spin" />
                              Loading classroom results...
                            </div>
                          ) : currentResultsError ? (
                            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
                              <AlertCircle size={17} />
                              {currentResultsError}
                            </div>
                          ) : classroomResults.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
                              <BarChart3 size={27} className="mx-auto text-slate-400" />
                              <p className="mt-3 text-sm font-semibold text-slate-700">No result data yet</p>
                              <p className="mt-1 text-xs text-slate-500">
                                Assign a quiz and enroll students to start tracking classroom performance.
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                                <div className="rounded-xl border border-white bg-white p-4">
                                  <p className="text-[11px] font-medium text-slate-400">Students</p>
                                  <p className="mt-1 text-2xl font-bold text-slate-900">{uniqueStudentIds.size}</p>
                                </div>
                                <div className="rounded-xl border border-white bg-white p-4">
                                  <p className="text-[11px] font-medium text-slate-400">Assigned Quizzes</p>
                                  <p className="mt-1 text-2xl font-bold text-blue-600">{uniqueQuizIds.size}</p>
                                </div>
                                <div className="rounded-xl border border-white bg-white p-4">
                                  <p className="text-[11px] font-medium text-slate-400">Total Records</p>
                                  <p className="mt-1 text-2xl font-bold text-slate-900">{classroomResults.length}</p>
                                </div>
                                <div className="rounded-xl border border-white bg-white p-4">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    <p className="text-[11px] font-medium text-slate-400">Submitted</p>
                                  </div>
                                  <p className="mt-1 text-2xl font-bold text-emerald-600">{submittedResults.length}</p>
                                </div>
                                <div className="rounded-xl border border-white bg-white p-4">
                                  <p className="text-[11px] font-medium text-slate-400">Not Submitted</p>
                                  <p className="mt-1 text-2xl font-bold text-amber-600">
                                    {classroomResults.length - submittedResults.length}
                                  </p>
                                </div>
                                <div className="rounded-xl border border-white bg-white p-4">
                                  <div className="flex items-center gap-2">
                                    <Percent size={14} className="text-blue-500" />
                                    <p className="text-[11px] font-medium text-slate-400">Completion Rate</p>
                                  </div>
                                  <p className="mt-1 text-2xl font-bold text-blue-600">{completionRate}%</p>
                                </div>
                                <div className="rounded-xl border border-white bg-white p-4">
                                  <p className="text-[11px] font-medium text-slate-400">Average Score</p>
                                  <p className="mt-1 text-2xl font-bold text-blue-600">
                                    {submittedResults.length > 0 ? `${averageScore}%` : "—"}
                                  </p>
                                </div>
                                <div className="rounded-xl border border-white bg-white p-4">
                                  <div className="flex items-center gap-2">
                                    <Award size={14} className="text-amber-500" />
                                    <p className="text-[11px] font-medium text-slate-400">Highest / Lowest</p>
                                  </div>
                                  <p className="mt-1 text-xl font-bold text-slate-900">
                                    {highestScore !== null ? `${highestScore}% / ${lowestScore}%` : "—"}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                  <div className="mb-3 flex items-center gap-2">
                                    <BarChart3 size={17} className="text-blue-600" />
                                    <div>
                                      <h5 className="text-sm font-semibold text-slate-900">Quiz Performance</h5>
                                      <p className="mt-1 text-[11px] text-slate-400">Completion and score for each assigned quiz.</p>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    {quizAnalytics.map((quiz) => (
                                      <div key={quiz.quizId} className="rounded-lg bg-slate-50 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                          <p className="text-xs font-semibold text-slate-800">{quiz.quizTitle}</p>
                                          <span className="text-[11px] font-bold text-blue-600">{quiz.averageScore !== null ? `${quiz.averageScore}% avg` : "No score"}</span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                                          <span>{quiz.submitted} / {quiz.total} submitted</span>
                                          <span>{quiz.completionRate}% complete</span>
                                        </div>
                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                          <div
                                            className="h-full rounded-full bg-blue-500 transition-all"
                                            style={{ width: `${quiz.completionRate}%` }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                  <div className="mb-3 flex items-center gap-2">
                                    <Users size={17} className="text-indigo-600" />
                                    <div>
                                      <h5 className="text-sm font-semibold text-slate-900">Student Performance</h5>
                                      <p className="mt-1 text-[11px] text-slate-400">Individual completion and average score.</p>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    {studentAnalytics.map((student) => (
                                      <div
                                        key={student.studentId}
                                        className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-3"
                                      >
                                        <div className="min-w-0">
                                          <p className="truncate text-xs font-semibold text-slate-800">
                                            {student.studentName}
                                          </p>
                                          <p className="mt-1 truncate text-[11px] text-slate-400">
                                            {student.studentEmail}
                                          </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-3">
                                          <div className="text-right">
                                            <p className="text-xs font-bold text-slate-800">
                                              {student.averageScore !== null
                                                ? `${student.averageScore}%`
                                                : "—"}
                                            </p>
                                            <p className="mt-1 text-[10px] text-slate-400">
                                              {student.submitted}/{student.assigned} submitted
                                            </p>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleViewStudentAnalytics(student)
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100"
                                          >
                                            <Eye size={13} />
                                            View Details
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                <table className="w-full min-w-[820px] text-left">
                                  <thead className="bg-slate-50">
                                    <tr>
                                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Student</th>
                                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Quiz</th>
                                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Score</th>
                                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted At</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {classroomResults.map((result, index) => {
                                      const submitted =
                                        String(result?.status || "").toUpperCase() === "SUBMITTED";

                                      return (
                                        <tr
                                          key={`${result?.assignmentId}-${result?.studentId}-${index}`}
                                          className="border-t border-slate-100"
                                        >
                                          <td className="px-4 py-3">
                                            <p className="text-xs font-semibold text-slate-800">
                                              {result?.studentName || "Student"}
                                            </p>
                                            <p className="mt-1 text-[11px] text-slate-400">
                                              {result?.studentEmail || "No email"}
                                            </p>
                                          </td>
                                          <td className="px-4 py-3 text-xs font-medium text-slate-700">
                                            {result?.quizTitle || "Quiz"}
                                          </td>
                                          <td className="px-4 py-3">
                                            <span
                                              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold ${
                                                submitted
                                                  ? "bg-emerald-100 text-emerald-700"
                                                  : "bg-amber-100 text-amber-700"
                                              }`}
                                            >
                                              {submitted ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                              {submitted ? "SUBMITTED" : "NOT SUBMITTED"}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-xs font-bold text-slate-800">
                                            {submitted ? `${result?.score ?? 0}%` : "—"}
                                          </td>
                                          <td className="px-4 py-3 text-xs text-slate-500">
                                            {submitted && result?.submittedAt
                                              ? new Date(result.submittedAt).toLocaleString("en-IN")
                                              : "—"}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          )}
                        </div>
                      )}

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
        {/* =================================================
            INDIVIDUAL STUDENT ANALYTICS MODAL
        ================================================= */}

        {selectedStudent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={handleCloseStudentAnalytics}
          >
            <div
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserCircle2 size={21} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedStudent.studentName}</h3>
                    <p className="mt-1 text-xs text-slate-400">{selectedStudent.studentEmail}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseStudentAnalytics}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close analytics"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="p-6">
                {studentAnalyticsLoading && (
                  <div className="py-12 text-center text-sm text-slate-500">
                    <Loader2 size={28} className="mx-auto animate-spin text-blue-600" />
                    <p className="mt-3">Loading student analytics...</p>
                  </div>
                )}

                {!studentAnalyticsLoading && studentAnalyticsError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{studentAnalyticsError}</span>
                  </div>
                )}

                {!studentAnalyticsLoading && !studentAnalyticsError && selectedStudentAnalytics && (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-[11px] font-medium text-slate-500">Average Score</p>
                        <p className="mt-1 text-2xl font-bold text-blue-600">
                          {Number(selectedStudentAnalytics?.averageScore ?? selectedStudent.averageScore ?? 0).toFixed(0)}%
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[11px] font-medium text-slate-500">Completed Quizzes</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                          {Number(selectedStudentAnalytics?.totalQuizzes ?? selectedStudent.submitted ?? 0)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="text-[11px] font-medium text-slate-500">Learning Level</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-700">
                          {selectedStudentAnalytics?.learningLevel || "Developing"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
                        <h4 className="text-sm font-semibold text-slate-900">Weak Topics</h4>
                        {Array.isArray(selectedStudentAnalytics?.weakTopics) && selectedStudentAnalytics.weakTopics.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {selectedStudentAnalytics.weakTopics.map((topic, index) => (
                              <div key={`${topic?.topicId || index}-weak`} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                                <span className="text-xs font-medium text-slate-700">{topic?.topicName || "Topic"}</span>
                                <span className="text-xs font-bold text-red-600">{Number(topic?.averageScore ?? 0).toFixed(0)}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-slate-500">No weak topics identified yet.</p>
                        )}
                      </div>

                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                        <h4 className="text-sm font-semibold text-slate-900">Strong Topics</h4>
                        {Array.isArray(selectedStudentAnalytics?.strongTopics) && selectedStudentAnalytics.strongTopics.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {selectedStudentAnalytics.strongTopics.map((topic, index) => (
                              <div key={`${topic?.topicId || index}-strong`} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                                <span className="text-xs font-medium text-slate-700">{topic?.topicName || "Topic"}</span>
                                <span className="text-xs font-bold text-emerald-600">{Number(topic?.averageScore ?? 0).toFixed(0)}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-slate-500">No strong topics identified yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <BarChart3 size={17} className="text-blue-600" />
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">Quiz History</h4>
                          <p className="mt-1 text-[11px] text-slate-400">Recent quiz performance for this student.</p>
                        </div>
                      </div>

                      {Array.isArray(selectedStudentAnalytics?.quizPerformance) && selectedStudentAnalytics.quizPerformance.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudentAnalytics.quizPerformance.map((quiz, index) => (
                            <div key={`${quiz?.quizId || index}-history`} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-3">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-slate-800">{quiz?.quizTitle || "Quiz"}</p>
                                <p className="mt-1 text-[11px] text-slate-400">{quiz?.topicName || quiz?.subjectName || "Performance record"}</p>
                              </div>
                              <span className="shrink-0 text-xs font-bold text-blue-600">
                                {quiz?.score !== null && quiz?.score !== undefined ? `${Number(quiz.score).toFixed(0)}%` : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No detailed quiz performance is available yet.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}