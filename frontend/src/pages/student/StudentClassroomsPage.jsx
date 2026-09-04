import {
  useEffect,
  useState,
} from "react";

import {
  Users,
  LogIn,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_BASE = "http://localhost:8080";

export default function StudentClassroomsPage() {

  const [classrooms, setClassrooms] =
    useState([]);

  const [joinCode, setJoinCode] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [joining, setJoining] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // GET STUDENT ID
  // =====================================================

  const getStudentId = () => {

    const storedId =
      localStorage.getItem("userId");

    if (storedId) {

      const parsedId =
        Number(storedId);

      if (
        !Number.isNaN(parsedId) &&
        parsedId > 0
      ) {
        return parsedId;
      }
    }

    try {

      const storedUser =
        JSON.parse(
          localStorage.getItem("user") ||
          "null"
        );

      const parsedId =
        storedUser?.id
          ? Number(storedUser.id)
          : null;

      return parsedId &&
        !Number.isNaN(parsedId)
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

    const studentId =
      getStudentId();

    if (!studentId) {

      setError(
        "Student account not found."
      );

      setLoading(false);

      return;
    }

    try {

      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_BASE}/api/classrooms/student/${studentId}`
        );

      const data =
        await response
          .json()
          .catch(() => []);

      if (!response.ok) {

        throw new Error(
          data?.error ||
          "Unable to load classrooms."
        );
      }

      setClassrooms(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (requestError) {

      console.error(
        "Error loading student classrooms:",
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
  // JOIN CLASSROOM
  // =====================================================

  const handleJoinClassroom =
    async (event) => {

      event.preventDefault();

      const trimmedCode =
        joinCode.trim().toUpperCase();

      if (!trimmedCode) {

        setError(
          "Enter a classroom join code."
        );

        setSuccess("");

        return;
      }

      const studentId =
        getStudentId();

      if (!studentId) {

        setError(
          "Student account not found."
        );

        setSuccess("");

        return;
      }

      try {

        setJoining(true);
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_BASE}/api/classrooms/join`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                joinCode: trimmedCode,
                studentId,
              }),
            }
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {

          throw new Error(
            data?.error ||
            "Unable to join classroom."
          );
        }

        setJoinCode("");

        setSuccess(
          `Successfully joined ${data?.classroom?.name || "the classroom"}.`
        );

        setClassrooms(
          (current) => [
            data,
            ...current,
          ]
        );

      } catch (requestError) {

        console.error(
          "Error joining classroom:",
          requestError
        );

        setError(
          requestError?.message ||
          "Unable to join classroom."
        );

      } finally {

        setJoining(false);
      }
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

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Classrooms
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Join classrooms and access your enrolled learning spaces.
          </p>

        </div>

        {/* =================================================
            JOIN CLASSROOM
        ================================================= */}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

              <LogIn
                size={20}
                className="text-blue-600"
              />

            </div>

            <div>

              <h2 className="text-base font-semibold text-slate-900">
                Join a Classroom
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Enter the join code shared by your teacher.
              </p>

            </div>

          </div>

          <form
            onSubmit={handleJoinClassroom}
            className="flex flex-col gap-3 sm:flex-row"
          >

            <input
              type="text"
              value={joinCode}
              onChange={(event) =>
                setJoinCode(
                  event.target.value
                    .toUpperCase()
                )
              }
              placeholder="Enter 6-character join code"
              maxLength={6}
              className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold tracking-[0.12em] uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={joining}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {joining ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <LogIn
                  size={17}
                />
              )}

              {joining
                ? "Joining..."
                : "Join Classroom"}

            </button>

          </form>

          {success && (

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

              <CheckCircle2
                size={17}
              />

              {success}

            </div>

          )}

          {error && (

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">

              <AlertCircle
                size={17}
              />

              {error}

            </div>

          )}

        </section>

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
            EMPTY
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
                Join your first classroom using the code from your teacher.
              </p>

            </div>

          )}

        {/* =================================================
            CLASSROOM LIST
        ================================================= */}

        {!loading &&
          classrooms.length > 0 && (

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {classrooms.map(
                (enrollment) => {

                  const classroom =
                    enrollment?.classroom;

                  return (

                    <div
                      key={
                        enrollment?.id ||
                        classroom?.id
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <h3 className="text-lg font-semibold text-slate-900">
                            {classroom?.name ||
                              "Classroom"}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            Teacher:{" "}
                            {classroom?.teacher?.name ||
                              "Not available"}
                          </p>

                        </div>

                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          {enrollment?.status ||
                            "ACTIVE"}
                        </span>

                      </div>

                      <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                        <div>

                          <p className="text-xs text-slate-400">
                            Joined
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {enrollment?.joinedAt
                              ? new Date(
                                  enrollment.joinedAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "Recently"}

                          </p>

                        </div>

                        <Users
                          size={19}
                          className="text-blue-600"
                        />

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

      </div>

    </div>
  );
}