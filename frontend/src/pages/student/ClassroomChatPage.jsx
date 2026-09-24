import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";

const API_BASE = "http://localhost:8080";
const WS_URL = "ws://localhost:8080/ws";

function getCurrentUserId() {
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

    const parsedId = storedUser?.id ? Number(storedUser.id) : null;

    return parsedId && !Number.isNaN(parsedId) ? parsedId : null;
  } catch {
    return null;
  }
}

function getCurrentUserName() {
  try {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    return (
      storedUser?.name ||
      storedUser?.username ||
      localStorage.getItem("userName") ||
      "You"
    );
  } catch {
    return localStorage.getItem("userName") || "You";
  }
}

function normalizeMessage(item, currentUserId) {
  const senderId =
    item?.senderId ??
    item?.userId ??
    item?.sender?.id ??
    item?.createdBy?.id ??
    null;

  const senderName =
    item?.senderName ??
    item?.userName ??
    item?.sender?.name ??
    item?.createdBy?.name ??
    item?.username ??
    "User";

  const text =
    item?.message ??
    item?.content ??
    item?.text ??
    "";

  const createdAt =
    item?.createdAt ??
    item?.timestamp ??
    item?.sentAt ??
    item?.created_at ??
    null;

  return {
    id:
      item?.id ??
      `${senderId || "user"}-${createdAt || Date.now()}-${Math.random()}`,
    senderId: senderId != null ? Number(senderId) : null,
    senderName,
    text,
    createdAt,
    type:
      senderId != null && Number(senderId) === Number(currentUserId)
        ? "user"
        : "other",
    role: item?.role ?? item?.senderRole ?? null,
  };
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClassroomChatPage() {
  const { classroomId } = useParams();
  const navigate = useNavigate();

  const currentUserId = getCurrentUserId();
  const currentUserName = getCurrentUserName();
  const currentRole = (
    localStorage.getItem("userRole") || "student"
  ).toLowerCase();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [connected, setConnected] = useState(false);
  const [classroomName, setClassroomName] = useState("Classroom Chat");

  const rootRef = useRef(null);
  const stompClientRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    // DashboardLayout can use its own scrolling container.
    // Reset the nearest scrollable parent too.
    let parent = rootRef.current?.parentElement;

    while (parent) {
      const styles = window.getComputedStyle(parent);
      const canScroll =
        ["auto", "scroll", "overlay"].includes(styles.overflowY) &&
        parent.scrollHeight > parent.clientHeight;

      if (canScroll) {
        parent.scrollTop = 0;
        break;
      }

      parent = parent.parentElement;
    }
  }, [classroomId]);

  useEffect(() => {
    let cancelled = false;

    const loadChatHistory = async () => {
      if (!classroomId || !currentUserId) {
        setChatError("Classroom or user information is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setChatError("");

        const response = await fetch(
          `${API_BASE}/api/classroom-chat/${classroomId}/messages/user/${currentUserId}`,
          { cache: "no-store" }
        );

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to load classroom chat."
          );
        }

        if (cancelled) {
          return;
        }

        const rawMessages = Array.isArray(data)
          ? data
          : Array.isArray(data?.messages)
            ? data.messages
            : [];

        const normalized = rawMessages.map((item) =>
          normalizeMessage(item, currentUserId)
        );

        setMessages(normalized);

        const firstClassroomName =
          data?.classroomName ||
          data?.classroom?.name ||
          "Classroom Chat";

        if (
          typeof firstClassroomName === "string" &&
          firstClassroomName.trim()
        ) {
          setClassroomName(firstClassroomName);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Classroom chat history error:", error);
          setChatError(
            error?.message ||
              "Unable to load classroom chat."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadChatHistory();

    return () => {
      cancelled = true;
    };
  }, [classroomId, currentUserId]);

  useEffect(() => {
    if (!classroomId || !currentUserId) {
      return undefined;
    }

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        setConnected(true);
        setChatError("");

        client.subscribe(
          `/topic/classrooms/${classroomId}/chat`,
          (frame) => {
            try {
              const incoming = JSON.parse(frame.body);
              const normalized = normalizeMessage(
                incoming,
                currentUserId
              );

              setMessages((current) => {
                const exists = current.some(
                  (item) => String(item.id) === String(normalized.id)
                );

                return exists ? current : [...current, normalized];
              });
            } catch (error) {
              console.error(
                "Unable to parse classroom chat message:",
                error
              );
            }
          }
        );
      },

      onDisconnect: () => {
        setConnected(false);
      },

      onWebSocketClose: () => {
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error("STOMP classroom chat error:", frame);
        setConnected(false);
      },

      onWebSocketError: (event) => {
        console.error("WebSocket classroom chat error:", event);
        setConnected(false);
      },
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      setConnected(false);

      if (stompClientRef.current === client) {
        stompClientRef.current = null;
      }

      client.deactivate().catch((error) => {
        console.error("Unable to close classroom chat socket:", error);
      });
    };
  }, [classroomId, currentUserId]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = 0;
  }, [classroomId]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    if (distanceFromBottom < 180) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (event) => {
    event?.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    if (!classroomId || !currentUserId) {
      setChatError("Classroom or user information is missing.");
      return;
    }

    const client = stompClientRef.current;

    if (!client?.connected) {
      setChatError("Chat connection is not ready. Please try again.");
      return;
    }

    try {
      setSending(true);
      setChatError("");

      client.publish({
        destination: `/app/classrooms/${classroomId}/chat`,
        body: JSON.stringify({
          classroomId: Number(classroomId),
          senderId: Number(currentUserId),
          userId: Number(currentUserId),
          senderName: currentUserName,
          message: trimmedMessage,
          content: trimmedMessage,
          role: currentRole,
        }),
      });

      setMessageText("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Send classroom chat message error:", error);
      setChatError(
        error?.message ||
          "Unable to send the message."
      );
    } finally {
      setSending(false);
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(event);
    }
  };

  return (
    <div
      ref={rootRef}
      className="mt-[80px] flex h-[calc(100vh-80px)] min-h-0 w-full overflow-hidden bg-slate-50"
    >
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              aria-label="Go back"
            >
              <ArrowLeft size={17} />
            </button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MessageCircle size={20} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-slate-900 md:text-lg">
                {classroomName}
              </h1>

              <p className="mt-0.5 text-xs text-slate-500">
                Teacher and classmates only
              </p>
            </div>
          </div>

          <div
            className={`ml-4 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
              connected
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
            {connected ? "Live" : "Offline"}
          </div>
        </header>

        <div
          ref={messagesContainerRef}
          className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-5 py-6 md:px-6 md:py-7"
        >
          <div className="mx-auto w-full max-w-5xl">
            {chatError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {chatError}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-500">
                <Loader2 size={19} className="mr-2 animate-spin" />
                Loading classroom chat...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="max-w-sm text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                    <MessageCircle size={22} />
                  </div>

                  <h2 className="mt-4 text-base font-semibold text-slate-800">
                    No messages yet
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Start the classroom conversation by sending a message below.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((item) => {
                  const isUser = item.type === "user";

                  return (
                    <div
                      key={item.id}
                      className={`flex w-full ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[78%] md:max-w-[70%] ${
                          isUser ? "items-end" : "items-start"
                        } flex flex-col`}
                      >
                        <div className="mb-1 flex items-center gap-2 px-1">
                          <span className="text-xs font-semibold text-slate-700">
                            {isUser ? currentUserName : item.senderName}
                          </span>

                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-400">
                            {isUser ? "Student" : item.role || "Member"}
                          </span>
                        </div>

                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                            isUser
                              ? "rounded-br-md bg-blue-600 text-white"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {item.text}
                        </div>

                        <span className="mt-1 px-1 text-[10px] text-slate-400">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 md:px-5 md:py-4">
          <form
            onSubmit={handleSendMessage}
            className="mx-auto w-full max-w-5xl"
          >
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={handleInputKeyDown}
                rows={2}
                placeholder="Type a message..."
                className="min-h-[64px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="submit"
                disabled={!messageText.trim() || sending || !connected}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 size={19} className="animate-spin" />
                ) : (
                  <Send size={19} />
                )}
              </button>
            </div>

            <p className="mt-1.5 text-[10px] text-slate-400">
              Press Enter to send. Shift + Enter for a new line.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
