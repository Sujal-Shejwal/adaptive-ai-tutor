import React, {
  useEffect,
  useState,
} from "react";

import {
  Video,
  Users,
  Play,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

const API_URL =
  "http://localhost:8080";

const formatSeconds = (
  seconds
) => {
  const totalSeconds =
    Number(seconds) || 0;

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const remainingSeconds =
    totalSeconds % 60;

  return `${minutes}m ${String(
    remainingSeconds
  ).padStart(2, "0")}s`;
};

const getProgressColor = (
  percentage
) => {
  if (percentage >= 90) {
    return "bg-emerald-500";
  }

  if (percentage >= 50) {
    return "bg-blue-500";
  }

  return "bg-orange-500";
};

export default function TeacherVideoProgressPage() {

  // =====================================================
  // DATA
  // =====================================================

  const [subjects, setSubjects] =
    useState([]);

  const [units, setUnits] =
    useState([]);

  const [topics, setTopics] =
    useState([]);

  const [videos, setVideos] =
    useState([]);

  const [progressData, setProgressData] =
    useState([]);

  // =====================================================
  // SELECTIONS
  // =====================================================

  const [selectedSubjectId, setSelectedSubjectId] =
    useState("");

  const [selectedUnitId, setSelectedUnitId] =
    useState("");

  const [selectedTopicId, setSelectedTopicId] =
    useState("");

  const [selectedVideoId, setSelectedVideoId] =
    useState("");

  // =====================================================
  // LOADING
  // =====================================================

  const [loadingSubjects, setLoadingSubjects] =
    useState(false);

  const [loadingUnits, setLoadingUnits] =
    useState(false);

  const [loadingTopics, setLoadingTopics] =
    useState(false);

  const [loadingVideos, setLoadingVideos] =
    useState(false);

  const [loadingProgress, setLoadingProgress] =
    useState(false);

  // =====================================================
  // ERROR
  // =====================================================

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD SUBJECTS
  // =====================================================

  const fetchSubjects = async () => {

    try {

      setLoadingSubjects(
        true
      );

      const response =
        await fetch(
          `${API_URL}/api/subjects`
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load subjects."
        );
      }

      const data =
        await response.json();

      setSubjects(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Subjects error:",
        err
      );

      setError(
        err.message
      );

    } finally {

      setLoadingSubjects(
        false
      );
    }
  };

  // =====================================================
  // LOAD UNITS
  // =====================================================

  const fetchUnits = async (
    subjectId
  ) => {

    if (!subjectId) {

      setUnits([]);
      return;
    }

    try {

      setLoadingUnits(
        true
      );

      const response =
        await fetch(
          `${API_URL}/api/units/subject/${subjectId}`
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load units."
        );
      }

      const data =
        await response.json();

      setUnits(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Units error:",
        err
      );

      setError(
        err.message
      );

    } finally {

      setLoadingUnits(
        false
      );
    }
  };

  // =====================================================
  // LOAD TOPICS
  // =====================================================

  const fetchTopics = async (
    unitId
  ) => {

    if (!unitId) {

      setTopics([]);
      return;
    }

    try {

      setLoadingTopics(
        true
      );

      const response =
        await fetch(
          `${API_URL}/api/topics/unit/${unitId}`
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load topics."
        );
      }

      const data =
        await response.json();

      setTopics(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Topics error:",
        err
      );

      setError(
        err.message
      );

    } finally {

      setLoadingTopics(
        false
      );
    }
  };

  // =====================================================
  // LOAD VIDEOS
  // =====================================================

  const fetchVideos = async (
    topicId
  ) => {

    if (!topicId) {

      setVideos([]);
      return;
    }

    try {

      setLoadingVideos(
        true
      );

      const response =
        await fetch(
          `${API_URL}/api/videos/topic/${topicId}`
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load videos."
        );
      }

      const data =
        await response.json();

      setVideos(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Videos error:",
        err
      );

      setError(
        err.message
      );

    } finally {

      setLoadingVideos(
        false
      );
    }
  };

  // =====================================================
  // LOAD VIDEO PROGRESS
  // =====================================================

  const fetchProgress = async (
    videoId,
    showLoader = true
  ) => {

    if (!videoId) {

      setProgressData([]);
      return;
    }

    try {

      if (showLoader) {
        setLoadingProgress(
          true
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/video-progress/video/${videoId}`
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load video progress."
        );
      }

      const data =
        await response.json();

      setProgressData(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Video progress error:",
        err
      );

      setError(
        err.message
      );

    } finally {

      if (showLoader) {
        setLoadingProgress(
          false
        );
      }
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

  const handleSubjectChange =
    async (event) => {

      const subjectId =
        event.target.value;

      setSelectedSubjectId(
        subjectId
      );

      setSelectedUnitId("");
      setSelectedTopicId("");
      setSelectedVideoId("");

      setUnits([]);
      setTopics([]);
      setVideos([]);
      setProgressData([]);

      setError("");

      await fetchUnits(
        subjectId
      );
    };

  // =====================================================
  // UNIT CHANGE
  // =====================================================

  const handleUnitChange =
    async (event) => {

      const unitId =
        event.target.value;

      setSelectedUnitId(
        unitId
      );

      setSelectedTopicId("");
      setSelectedVideoId("");

      setTopics([]);
      setVideos([]);
      setProgressData([]);

      setError("");

      await fetchTopics(
        unitId
      );
    };

  // =====================================================
  // TOPIC CHANGE
  // =====================================================

  const handleTopicChange =
    async (event) => {

      const topicId =
        event.target.value;

      setSelectedTopicId(
        topicId
      );

      setSelectedVideoId("");

      setVideos([]);
      setProgressData([]);

      setError("");

      await fetchVideos(
        topicId
      );
    };

  // =====================================================
  // VIDEO CHANGE
  // =====================================================

  const handleVideoChange =
    async (event) => {

      const videoId =
        event.target.value;

      setSelectedVideoId(
        videoId
      );

      setProgressData([]);

      setError("");

      if (videoId) {

        await fetchProgress(
          videoId
        );
      }
    };

  // =====================================================
  // REAL-TIME REFRESH
  // =====================================================

  useEffect(() => {

    if (!selectedVideoId) {
      return undefined;
    }

    const interval =
      window.setInterval(
        () => {

          fetchProgress(
            selectedVideoId,
            false
          );

        },
        5000
      );

    return () => {

      window.clearInterval(
        interval
      );

    };

  }, [
    selectedVideoId,
  ]);

  // =====================================================
  // MANUAL REFRESH
  // =====================================================

  const handleRefresh =
    async () => {

      if (!selectedVideoId) {
        return;
      }

      await fetchProgress(
        selectedVideoId
      );
    };

  // =====================================================
  // SELECTED VIDEO
  // =====================================================

  const selectedVideo =
    videos.find(
      (video) =>
        String(video.id) ===
        String(selectedVideoId)
    );

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f8fafc] px-8 py-7">

      <div className="mx-auto max-w-[1100px]">

        {/* HEADER */}

        <div className="mb-7">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">

              <Video className="h-5 w-5 text-blue-600" />

            </div>

            <div>

              <h1 className="text-[25px] font-bold text-[#17233c]">
                Video Progress
              </h1>

              <p className="mt-1 text-[14px] text-[#64748b]">
                Track how much your students have watched.
              </p>

            </div>

          </div>

        </div>

        {/* FILTERS */}

        <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6">

          <div className="grid gap-5 md:grid-cols-4">

            {/* SUBJECT */}

            <div>

              <label className="mb-2 block text-[13px] font-medium text-[#334155]">
                Subject
              </label>

              <div className="relative">

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
                  className="h-11 w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] outline-none focus:border-blue-400"
                >

                  <option value="">
                    {loadingSubjects
                      ? "Loading..."
                      : "Select subject"}
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

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              </div>

            </div>

            {/* UNIT */}

            <div>

              <label className="mb-2 block text-[13px] font-medium text-[#334155]">
                Unit
              </label>

              <div className="relative">

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
                  className="h-11 w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] outline-none focus:border-blue-400 disabled:bg-gray-50"
                >

                  <option value="">
                    {!selectedSubjectId
                      ? "Select subject first"
                      : loadingUnits
                      ? "Loading..."
                      : "Select unit"}
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

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              </div>

            </div>

            {/* TOPIC */}

            <div>

              <label className="mb-2 block text-[13px] font-medium text-[#334155]">
                Topic
              </label>

              <div className="relative">

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
                  className="h-11 w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] outline-none focus:border-blue-400 disabled:bg-gray-50"
                >

                  <option value="">
                    {!selectedUnitId
                      ? "Select unit first"
                      : loadingTopics
                      ? "Loading..."
                      : "Select topic"}
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

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              </div>

            </div>

            {/* VIDEO */}

            <div>

              <label className="mb-2 block text-[13px] font-medium text-[#334155]">
                Video
              </label>

              <div className="relative">

                <select
                  value={
                    selectedVideoId
                  }
                  onChange={
                    handleVideoChange
                  }
                  disabled={
                    !selectedTopicId ||
                    loadingVideos
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-[#e2e8f0] bg-white px-4 pr-10 text-[13px] outline-none focus:border-blue-400 disabled:bg-gray-50"
                >

                  <option value="">
                    {!selectedTopicId
                      ? "Select topic first"
                      : loadingVideos
                      ? "Loading..."
                      : "Select video"}
                  </option>

                  {videos.map(
                    (video) => (

                      <option
                        key={
                          video.id
                        }
                        value={
                          video.id
                        }
                      >
                        {
                          video.title ||
                            "Video"
                        }
                      </option>

                    )
                  )}

                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              </div>

            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">

            <AlertCircle className="h-4 w-4" />

            {error}

          </div>
        )}

        {/* SELECTED VIDEO */}

        {selectedVideo && (

          <section className="mt-6 rounded-2xl border border-[#e2e8f0] bg-white p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">

                  <Video className="h-5 w-5 text-red-500" />

                </div>

                <div>

                  <h2 className="text-[16px] font-bold text-[#17233c]">
                    {
                      selectedVideo.title
                    }
                  </h2>

                  <p className="mt-1 text-[12px] text-gray-400">
                    Live student watch progress
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  loadingProgress
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dbe3ef] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#475569] hover:bg-gray-50 disabled:opacity-50"
              >

                <RefreshCw
                  className={`h-4 w-4 ${
                    loadingProgress
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh

              </button>

            </div>

          </section>
        )}

        {/* PROGRESS */}

        {selectedVideoId && (

          <section className="mt-6 rounded-2xl border border-[#e2e8f0] bg-white p-6">

            {loadingProgress ? (

              <div className="py-16 text-center">

                <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />

                <p className="mt-3 text-[13px] text-gray-500">
                  Loading student progress...
                </p>

              </div>

            ) : progressData.length ===
              0 ? (

              <div className="py-16 text-center">

                <Users className="mx-auto h-9 w-9 text-gray-300" />

                <h3 className="mt-4 text-[15px] font-semibold text-[#334155]">
                  No progress yet
                </h3>

                <p className="mt-1 text-[13px] text-gray-400">
                  No student has started this video yet.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {progressData.map(
                  (progress) => {

                    const percentage =
                      Math.min(
                        100,
                        Math.max(
                          0,
                          Number(
                            progress.progressPercentage ||
                              0
                          )
                        )
                      );

                    const studentName =
                      progress.student?.name ||
                      "Student";

                    const studentEmail =
                      progress.student?.email ||
                      "";

                    return (

                      <div
                        key={
                          progress.id
                        }
                        className="rounded-xl border border-[#e2e8f0] p-5"
                      >

                        <div className="flex flex-col gap-4 md:flex-row md:items-center">

                          {/* STUDENT */}

                          <div className="flex min-w-[220px] items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">

                              <Users className="h-4 w-4 text-blue-600" />

                            </div>

                            <div>

                              <p className="text-[14px] font-semibold text-[#17233c]">
                                {
                                  studentName
                                }
                              </p>

                              <p className="text-[11px] text-gray-400">
                                {
                                  studentEmail
                                }
                              </p>

                            </div>

                          </div>

                          {/* PROGRESS */}

                          <div className="min-w-0 flex-1">

                            <div className="mb-2 flex items-center justify-between">

                              <span className="text-[12px] font-medium text-gray-500">
                                Watch Progress
                              </span>

                              <span className="text-[13px] font-bold text-[#17233c]">
                                {
                                  percentage
                                }%
                              </span>

                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">

                              <div
                                className={`h-full rounded-full transition-all ${getProgressColor(
                                  percentage
                                )}`}
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />

                            </div>

                          </div>

                          {/* TIME */}

                          <div className="flex min-w-[100px] items-center gap-2">

                            <Clock3 className="h-4 w-4 text-gray-400" />

                            <div>

                              <p className="text-[12px] font-semibold text-[#334155]">
                                {
                                  formatSeconds(
                                    progress.watchedSeconds
                                  )
                                }
                              </p>

                              <p className="text-[10px] text-gray-400">
                                watched
                              </p>

                            </div>

                          </div>

                          {/* STATUS */}

                          <div className="min-w-[115px]">

                            {progress.completed ? (

                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600">

                                <CheckCircle2 className="h-3.5 w-3.5" />

                                Completed

                              </span>

                            ) : percentage >
                              0 ? (

                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-600">

                                <Play className="h-3.5 w-3.5" />

                                Watching

                              </span>

                            ) : (

                              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-semibold text-gray-500">

                                Not Started

                              </span>

                            )}

                          </div>

                        </div>

                        {/* LAST WATCHED */}

                        <div className="mt-4 border-t border-gray-100 pt-3">

                          <p className="text-[11px] text-gray-400">

                            Last watched:{" "}

                            {progress.lastWatchedAt
                              ? new Date(
                                  progress.lastWatchedAt
                                ).toLocaleString()
                              : "Not available"}

                          </p>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </section>
        )}

      </div>

    </div>
  );
}