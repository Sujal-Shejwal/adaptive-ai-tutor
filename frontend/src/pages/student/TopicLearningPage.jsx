import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  ExternalLink,
  LibraryBig,
  Loader2,
  AlertCircle,
  Video,
} from "lucide-react";

const API_URL = "http://localhost:8080";

const getYouTubeVideoId = (url) => {
  if (!url) return null;

  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
  );

  return match ? match[1] : null;
};

const loadYouTubeAPI = () => {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const existingScript = document.getElementById(
      "youtube-iframe-api"
    );

    const previousCallback =
      window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === "function") {
        previousCallback();
      }

      resolve();
    };

    if (!existingScript) {
      const script = document.createElement("script");

      script.id =
        "youtube-iframe-api";

      script.src =
        "https://www.youtube.com/iframe_api";

      document.body.appendChild(script);
    }
  });
};

const TopicLearningPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] =
    useState(null);

  const [notes, setNotes] =
    useState([]);

  const [videos, setVideos] =
    useState([]);

  const [videoProgress, setVideoProgress] =
    useState({});

  const [videoProgressLoading, setVideoProgressLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [completed, setCompleted] =
    useState(false);

  const [progressLoading, setProgressLoading] =
    useState(false);

  const playerRefs =
    useRef({});

  const progressIntervals =
    useRef({});

  const videoProgressRef =
    useRef({});

  // =====================================================
  // GET LOGGED-IN USER ID
  // =====================================================

  const getUserId = () => {
    try {
      const storedId =
        localStorage.getItem("userId");

      if (storedId) {
        return storedId;
      }

      const storedUser =
        JSON.parse(
          localStorage.getItem("user") ||
            "null"
        );

      return storedUser?.id
        ? String(storedUser.id)
        : null;

    } catch (err) {

      console.error(
        "Unable to read logged-in user:",
        err
      );

      return null;
    }
  };

  // =====================================================
  // KEEP LATEST VIDEO PROGRESS
  // =====================================================

  useEffect(() => {
    videoProgressRef.current =
      videoProgress;
  }, [videoProgress]);

  // =====================================================
  // STOP PROGRESS TIMER
  // =====================================================

  const stopProgressTracking = (
    videoId
  ) => {

    const intervalId =
      progressIntervals.current[
        videoId
      ];

    if (intervalId) {

      clearInterval(
        intervalId
      );

      delete progressIntervals.current[
        videoId
      ];
    }
  };

  // =====================================================
  // SAVE VIDEO PROGRESS
  // =====================================================

  const saveVideoProgress = async (
    videoId,
    player,
    logErrors = false
  ) => {

    if (!player) {
      return;
    }

    const duration =
      player.getDuration();

    const currentTime =
      player.getCurrentTime();

    if (
      !duration ||
      duration <= 0
    ) {
      return;
    }

    const watchedSeconds =
      Math.max(
        0,
        Math.floor(
          currentTime
        )
      );

    const progressPercentage =
      Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (currentTime /
              duration) *
              100
          )
        )
      );

    const completedVideo =
      progressPercentage >= 95;

    const userId =
      getUserId();

    if (!userId) {
      return;
    }

    try {

      const response =
        await fetch(
          `${API_URL}/api/video-progress`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body:
              new URLSearchParams({
                videoId:
                  String(videoId),

                studentId:
                  String(userId),

                watchedSeconds:
                  String(
                    watchedSeconds
                  ),

                progressPercentage:
                  String(
                    progressPercentage
                  ),

                completed:
                  String(
                    completedVideo
                  ),
              }),
          }
        );

      if (!response.ok) {

        throw new Error(
          `Progress API returned ${response.status}`
        );
      }

      setVideoProgress(
        (current) => ({
          ...current,

          [videoId]: {
            ...(current[videoId] ||
              {}),

            watchedSeconds,

            progressPercentage,

            completed:
              completedVideo,
          },
        })
      );

    } catch (progressError) {

      if (logErrors) {

        console.error(
          "Unable to save video progress:",
          progressError
        );
      }
    }
  };

  // =====================================================
  // START PROGRESS TRACKING
  // =====================================================

  const startProgressTracking = (
    videoId,
    player
  ) => {

    if (
      progressIntervals.current[
        videoId
      ]
    ) {
      return;
    }

    progressIntervals.current[
      videoId
    ] =
      window.setInterval(
        () => {

          saveVideoProgress(
            videoId,
            player
          );

        },
        5000
      );
  };

  // =====================================================
  // HANDLE YOUTUBE PLAYER STATE
  // =====================================================

  const handlePlayerStateChange = (
    videoId,
    event
  ) => {

    const player =
      playerRefs.current[
        videoId
      ];

    if (
      !player ||
      !window.YT
    ) {
      return;
    }

    if (
      event.data ===
      window.YT.PlayerState.PLAYING
    ) {

      startProgressTracking(
        videoId,
        player
      );

      return;
    }

    stopProgressTracking(
      videoId
    );

    saveVideoProgress(
      videoId,
      player,
      true
    );
  };

  // =====================================================
  // LOAD TOPIC DATA
  // =====================================================

  const loadTopicData =
    async () => {

      try {

        setLoading(true);
        setError("");

        setVideoProgress({});
        setVideoProgressLoading(
          false
        );

        // ---------------------------------------------
        // GET TOPIC
        // ---------------------------------------------

        const topicResponse =
          await fetch(
            `${API_URL}/api/topics/${topicId}`
          );

        if (
          !topicResponse.ok
        ) {
          throw new Error(
            "Unable to load topic"
          );
        }

        const topicData =
          await topicResponse.json();

        setTopic(
          topicData
        );

        // ---------------------------------------------
        // GET NOTES
        // ---------------------------------------------

        const notesResponse =
          await fetch(
            `${API_URL}/api/notes/topic/${topicId}`
          );

        if (
          !notesResponse.ok
        ) {
          throw new Error(
            "Unable to load learning materials"
          );
        }

        const notesData =
          await notesResponse.json();

        setNotes(
          Array.isArray(
            notesData
          )
            ? notesData
            : []
        );

        // ---------------------------------------------
        // GET VIDEOS
        // ---------------------------------------------

        let topicVideos =
          [];

        try {

          const videosResponse =
            await fetch(
              `${API_URL}/api/videos/topic/${topicId}`
            );

          if (
            videosResponse.ok
          ) {

            const videosData =
              await videosResponse.json();

            topicVideos =
              Array.isArray(
                videosData
              )
                ? videosData
                : [];

          } else {

            console.warn(
              "Unable to load topic videos:",
              videosResponse.status
            );
          }

        } catch (
          videoError
        ) {

          console.error(
            "Topic videos loading error:",
            videoError
          );
        }

        setVideos(
          topicVideos
        );

        // ---------------------------------------------
        // GET USER ID
        // ---------------------------------------------

        const userId =
          getUserId();

        // ---------------------------------------------
        // GET VIDEO PROGRESS
        // ---------------------------------------------

        if (
          userId &&
          topicVideos.length > 0
        ) {

          setVideoProgressLoading(
            true
          );

          try {

            const progressEntries =
              await Promise.all(
                topicVideos.map(
                  async (
                    video
                  ) => {

                    try {

                      const response =
                        await fetch(
                          `${API_URL}/api/video-progress/video/${video.id}/student/${userId}`
                        );

                      if (
                        !response.ok
                      ) {
                        return [
                          video.id,
                          null,
                        ];
                      }

                      return [
                        video.id,
                        await response.json(),
                      ];

                    } catch (
                      progressError
                    ) {

                      console.error(
                        "Unable to load video progress:",
                        progressError
                      );

                      return [
                        video.id,
                        null,
                      ];
                    }
                  }
                )
              );

            setVideoProgress(
              Object.fromEntries(
                progressEntries
              )
            );

          } finally {

            setVideoProgressLoading(
              false
            );
          }

        } else {

          setVideoProgress(
            {}
          );

          setVideoProgressLoading(
            false
          );
        }

        // ---------------------------------------------
        // GET TOPIC PROGRESS
        // ---------------------------------------------

        if (userId) {

          const progressResponse =
            await fetch(
              `${API_URL}/api/progress/user/${userId}/topic/${topicId}`
            );

          if (
            progressResponse.ok
          ) {

            const progressData =
              await progressResponse.json();

            setCompleted(
              progressData?.completed ===
                true ||
                progressData?.isCompleted ===
                  true
            );

          } else if (
            progressResponse.status ===
            404
          ) {

            setCompleted(
              false
            );

          } else {

            throw new Error(
              "Unable to load topic progress."
            );
          }

        } else {

          console.warn(
            "No logged-in user ID found."
          );

          setCompleted(
            false
          );
        }

      } catch (err) {

        console.error(
          "Topic loading error:",
          err
        );

        setVideos([]);

        setError(
          err.message ||
            "Something went wrong while loading the topic."
        );

      } finally {

        setLoading(
          false
        );
      }
    };

  // =====================================================
  // LOAD WHEN TOPIC CHANGES
  // =====================================================

  useEffect(() => {

    loadTopicData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  // =====================================================
  // INITIALIZE YOUTUBE PLAYERS
  // =====================================================

  useEffect(() => {

    if (
      videos.length === 0 ||
      videoProgressLoading
    ) {
      return undefined;
    }

    let cancelled =
      false;

    const initializePlayers =
      async () => {

        try {

          await loadYouTubeAPI();

          if (
            cancelled
          ) {
            return;
          }

          videos.forEach(
            (video) => {

              const youtubeVideoId =
                getYouTubeVideoId(
                  video.videoUrl
                );

              if (
                !youtubeVideoId ||
                playerRefs.current[
                  video.id
                ]
              ) {
                return;
              }

              const containerId =
                `youtube-player-${video.id}`;

              if (
                !document.getElementById(
                  containerId
                )
              ) {
                return;
              }

              playerRefs.current[
                video.id
              ] =
                new window.YT.Player(
                  containerId,
                  {
                    videoId:
                      youtubeVideoId,

                    width:
                      "100%",

                    height:
                      "100%",

                    playerVars: {
                      rel: 0,
                      playsinline: 1,
                    },

                    events: {

                      onReady: (
                        event
                      ) => {

                        const saved =
                          videoProgressRef.current[
                            video.id
                          ];

                        const watchedSeconds =
                          Number(
                            saved?.watchedSeconds ||
                              0
                          );

                        if (
                          watchedSeconds >
                          0
                        ) {

                          event.target.seekTo(
                            watchedSeconds,
                            true
                          );
                        }
                      },

                      onStateChange: (
                        event
                      ) => {

                        handlePlayerStateChange(
                          video.id,
                          event
                        );
                      },
                    },
                  }
                );
            }
          );

        } catch (
          playerError
        ) {

          console.error(
            "Unable to initialize YouTube player:",
            playerError
          );
        }
      };

    initializePlayers();

    return () => {

      cancelled =
        true;

      Object.keys(
        progressIntervals.current
      ).forEach(
        (videoId) => {

          stopProgressTracking(
            videoId
          );
        }
      );

      Object.keys(
        playerRefs.current
      ).forEach(
        (videoId) => {

          try {

            playerRefs.current[
              videoId
            ]?.destroy();

          } catch (
            playerError
          ) {

            console.error(
              "Unable to destroy YouTube player:",
              playerError
            );
          }
        }
      );

      playerRefs.current = {};
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    videos,
    videoProgressLoading,
  ]);

  // =====================================================
  // OPEN PDF
  // =====================================================

  const openPdf = (
    noteId
  ) => {

    const pdfUrl =
      `${API_URL}/api/notes/${noteId}/file`;

    window.open(
      pdfUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // MARK TOPIC COMPLETE
  // =====================================================

  const handleMarkComplete =
    async () => {

      try {

        const userId =
          getUserId();

        if (!userId) {

          alert(
            "User session not found. Please login again."
          );

          return;
        }

        setProgressLoading(
          true
        );

        const response =
          await fetch(
            `${API_URL}/api/progress/user/${userId}/topic/${topicId}/complete`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (
          !response.ok
        ) {

          const errorText =
            await response.text();

          throw new Error(
            errorText ||
              "Unable to mark topic as complete"
          );
        }

        await response.json();

        setCompleted(
          true
        );

      } catch (
        progressError
      ) {

        console.error(
          "Progress error:",
          progressError
        );

        alert(
          progressError.message ||
            "Something went wrong while saving progress."
        );

      } finally {

        setProgressLoading(
          false
        );
      }
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="flex min-h-[70vh] items-center justify-center">

        <div className="flex items-center gap-3 text-slate-500">

          <Loader2
            className="h-5 w-5 animate-spin text-blue-600"
          />

          <span className="text-sm font-medium">
            Loading topic...
          </span>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">

        <div className="flex max-w-md items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

          <AlertCircle
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
          />

          <div>

            <p className="text-sm font-semibold text-red-700">
              Unable to load topic
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={
                loadTopicData
              }
              className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // TOPIC NOT FOUND
  // =====================================================

  if (!topic) {

    return (
      <div className="flex min-h-[70vh] items-center justify-center">

        <p className="text-sm text-slate-500">
          Topic not found.
        </p>

      </div>
    );
  }

  const totalResources =
    notes.length +
    videos.length;

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-7 pt-[96px]">

      {/* =================================================
          BACK TO UNIT
      ================================================= */}

      <button
        onClick={() =>
          navigate(-1)
        }
        className="mb-6 flex items-center gap-2 border-none bg-transparent p-0 text-sm font-medium text-blue-600 transition hover:text-blue-700"
      >

        <ArrowLeft className="h-4 w-4" />

        Back to Unit

      </button>

      {/* =================================================
          TOPIC HEADER
      ================================================= */}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="flex items-center gap-5">

          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100">

            <BookOpen className="h-8 w-8 text-blue-600" />

          </div>

          <div className="min-w-0">

            <p className="mb-1 text-sm font-medium text-blue-600">
              Topic {topic.topicNumber}
            </p>

            <h1 className="text-2xl font-bold leading-tight text-slate-900 md:text-[28px]">
              {topic.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">

              {topic.unit
                ? `Unit ${topic.unit.unitNumber} · ${topic.unit.title}`
                : "Learning Topic"}

            </p>

          </div>

        </div>

      </section>

      {/* =================================================
          ABOUT THIS TOPIC
      ================================================= */}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="mb-5 flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">

            <FileText className="h-5 w-5 text-blue-600" />

          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            About This Topic
          </h2>

        </div>

        <p className="text-[15px] leading-7 text-slate-500">

          {topic.description ||
            "Learn the basic concepts and principles covered in this topic."}

        </p>

      </section>

      {/* =================================================
          LEARNING CONTENT
      ================================================= */}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="mb-6 flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">

              <LibraryBig className="h-5 w-5 text-emerald-600" />

            </div>

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Learning Content
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Study materials uploaded by your teacher
              </p>

            </div>

          </div>

          {totalResources >
            0 && (

            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">

              {totalResources}{" "}

              {totalResources ===
              1
                ? "Resource"
                : "Resources"}

            </div>
          )}

        </div>

        {totalResources >
        0 ? (

          <div className="space-y-5">

            {/* =================================================
                PDF NOTES
            ================================================= */}

            {notes.map(
              (note) => (

                <div
                  key={`note-${note.id}`}
                  className="group flex items-center justify-between gap-5 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-slate-50"
                >

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">

                      <FileText className="h-5 w-5 text-red-500" />

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-slate-900">
                        {note.fileName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        PDF · Learning Material
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      openPdf(
                        note.id
                      )
                    }
                    className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >

                    <ExternalLink className="h-4 w-4" />

                    View PDF

                  </button>

                </div>
              )
            )}

            {/* =================================================
                VIDEOS
            ================================================= */}

            {videos.map(
              (video) => {

                const savedProgress =
                  videoProgress[
                    video.id
                  ];

                const progressPercentage =
                  savedProgress?.progressPercentage ||
                  0;

                return (
                  <div
                    key={`video-${video.id}`}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-red-200"
                  >

                    <div className="p-4">

                      <div className="mb-4 flex items-center gap-4">

                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">

                          <Video className="h-5 w-5 text-red-500" />

                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {video.title ||
                              "Video"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            YouTube · Tracked Video Resource
                          </p>

                        </div>

                      </div>

                      {/* YOUTUBE PLAYER */}

                      <div className="overflow-hidden rounded-xl bg-black">

                        <div className="relative aspect-video w-full">

                          <div
                            id={`youtube-player-${video.id}`}
                            className="absolute inset-0 h-full w-full"
                          />

                        </div>

                      </div>

                      {/* VIDEO PROGRESS */}

                      <div className="mt-4">

                        <div className="mb-2 flex items-center justify-between gap-3">

                          <span className="text-xs font-medium text-slate-500">
                            Watch Progress
                          </span>

                          <span className="text-xs font-bold text-blue-600">
                            {progressPercentage}%
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                            style={{
                              width:
                                `${progressPercentage}%`,
                            }}
                          />

                        </div>

                        <p className="mt-2 text-xs text-slate-400">

                          {savedProgress?.completed
                            ? "Video completed."
                            : progressPercentage >
                              0
                            ? "Your video progress is saved automatically."
                            : "Start watching to track your progress."}

                        </p>

                      </div>

                      {/* DIRECT YOUTUBE LINK */}

                      <div className="mt-4">

                        <a
                          href={
                            video.videoUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700"
                        >

                          <ExternalLink className="h-4 w-4" />

                          Open on YouTube

                        </a>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        ) : (

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">

              <LibraryBig className="h-8 w-8 text-emerald-600" />

            </div>

            <h3 className="text-base font-semibold text-slate-800">
              No learning content yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Your teacher has not uploaded notes or added a video for this topic yet.
            </p>

          </div>
        )}

      </section>

      {/* =================================================
          TOPIC PROGRESS
      ================================================= */}

      <section className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white px-7 py-5 shadow-sm">

        <div>

          <h3 className="text-base font-semibold text-slate-900">
            Topic Progress
          </h3>

          <p className="mt-1 text-xs text-slate-400">

            {completed
              ? "You have completed this topic."
              : "Complete this topic after studying the learning material."}

          </p>

        </div>

        <button
          onClick={
            handleMarkComplete
          }
          disabled={
            completed ||
            progressLoading
          }
          className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition ${
            completed
              ? "cursor-default bg-emerald-600"
              : "bg-blue-600 hover:bg-blue-700"
          } ${
            progressLoading
              ? "cursor-wait opacity-70"
              : ""
          }`}
        >

          {progressLoading ? (

            <>

              <Loader2 className="h-4 w-4 animate-spin" />

              Saving...

            </>

          ) : completed ? (

            <>

              <CheckCircle2 className="h-4 w-4" />

              Completed

            </>

          ) : (

            <>

              <CheckCircle2 className="h-4 w-4" />

              Mark Complete

            </>

          )}

        </button>

      </section>

    </div>
  );
};

export default TopicLearningPage;