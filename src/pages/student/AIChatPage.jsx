import {
    ArrowLeft,
    MessageSquare,
    Plus,
    Send,
    MoreVertical,
    Pencil,
    Trash2,
    Check,
    X,
    GraduationCap,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";



/* ========================================================= */
/* RECENT CONVERSATIONS */
/* ========================================================= */



/* ========================================================= */
/* BACKEND API HELPERS */
/* ========================================================= */

const API_BASE =
    "http://localhost:8080";

const formatTime = (value) => {

    if (!value) {
        return "Just now";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Just now";
    }

    const difference =
        Date.now() -
        date.getTime();

    const seconds =
        Math.floor(
            difference / 1000
        );

    if (seconds < 60) {
        return "Just now";
    }

    const minutes =
        Math.floor(
            seconds / 60
        );

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days =
        Math.floor(
            hours / 24
        );

    if (days === 1) {
        return "Yesterday";
    }

    return `${days}d ago`;
};


/* ========================================================= */
/* AI TUTOR LOGO */
/* ========================================================= */

function AITutorLogo({ small = false }) {

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-xl bg-blue-600 ${
                small
                    ? "h-9 w-9"
                    : "h-11 w-11"
            }`}
        >

            <GraduationCap
                size={small ? 18 : 22}
                strokeWidth={2}
                className="text-white"
            />

        </div>
    );
}

/* ========================================================= */
/* SIMPLE GEMINI MARKDOWN RENDERER */
/* ========================================================= */

function renderInlineMarkdown(text) {

    const parts =
        String(text || "").split(
            /(\*\*[^*]+\*\*|`[^`]+`)/
        );


    return parts.map(
        (part, index) => {

            if (
                part.startsWith("**") &&
                part.endsWith("**")
            ) {

                return (
                    <strong
                        key={index}
                        className="font-semibold text-slate-900"
                    >
                        {part.slice(2, -2)}
                    </strong>
                );
            }


            if (
                part.startsWith("`") &&
                part.endsWith("`")
            ) {

                return (
                    <code
                        key={index}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800"
                    >
                        {part.slice(1, -1)}
                    </code>
                );
            }


            return (
                <span key={index}>
                    {part}
                </span>
            );
        }
    );
}


function renderGeminiResponse(text) {

    const normalized =
        String(text || "")
            .replace(/\r\n/g, "\n")
            .replace(/\\n/g, "\n")
            .replace(/^```[a-zA-Z0-9_-]*\n?/, "")
            .replace(/\n?```$/, "")
            .trim();


    const lines =
        normalized.split("\n");


    const elements = [];

    let paragraphLines = [];
    let unorderedItems = [];
    let orderedItems = [];


    const flushParagraph = () => {

        if (
            paragraphLines.length === 0
        ) {
            return;
        }


        const textValue =
            paragraphLines.join(" ").trim();


        if (textValue) {

            elements.push(
                <p
                    key={`paragraph-${elements.length}`}
                    className="text-[15px] leading-7 text-slate-700"
                >
                    {renderInlineMarkdown(textValue)}
                </p>
            );
        }


        paragraphLines = [];
    };


    const flushUnordered = () => {

        if (
            unorderedItems.length === 0
        ) {
            return;
        }


        elements.push(
            <ul
                key={`unordered-${elements.length}`}
                className="ml-5 list-disc space-y-2 text-[15px] leading-7 text-slate-700"
            >
                {unorderedItems.map(
                    (item, index) => (
                        <li key={index}>
                            {renderInlineMarkdown(item)}
                        </li>
                    )
                )}
            </ul>
        );


        unorderedItems = [];
    };


    const flushOrdered = () => {

        if (
            orderedItems.length === 0
        ) {
            return;
        }


        elements.push(
            <ol
                key={`ordered-${elements.length}`}
                className="ml-5 list-decimal space-y-2 text-[15px] leading-7 text-slate-700"
            >
                {orderedItems.map(
                    (item, index) => (
                        <li key={index}>
                            {renderInlineMarkdown(item)}
                        </li>
                    )
                )}
            </ol>
        );


        orderedItems = [];
    };


    const flushLists = () => {

        flushUnordered();
        flushOrdered();
    };


    lines.forEach(
        (line, index) => {

            const trimmed =
                line.trim();


            if (!trimmed) {

                flushParagraph();
                flushLists();

                return;
            }


            // Remove markdown-only horizontal rules.
            if (
                /^---+$/.test(trimmed)
            ) {

                flushParagraph();
                flushLists();

                elements.push(
                    <hr
                        key={`hr-${index}`}
                        className="border-slate-200"
                    />
                );

                return;
            }


            const heading =
                trimmed.match(
                    /^(#{1,3})\s+(.+)$/
                );


            if (heading) {

                flushParagraph();
                flushLists();

                const level =
                    heading[1].length;


                const className =
                    level === 1
                        ? "text-xl font-bold text-slate-900"
                        : level === 2
                            ? "text-lg font-semibold text-slate-900"
                            : "text-base font-semibold text-slate-900";


                elements.push(
                    <h3
                        key={`heading-${index}`}
                        className={className}
                    >
                        {renderInlineMarkdown(
                            heading[2]
                        )}
                    </h3>
                );

                return;
            }


            const unordered =
                trimmed.match(
                    /^[-*]\s+(.+)$/
                );


            if (unordered) {

                flushParagraph();
                flushOrdered();

                unorderedItems.push(
                    unordered[1]
                );

                return;
            }


            const ordered =
                trimmed.match(
                    /^\d+\.\s+(.+)$/
                );


            if (ordered) {

                flushParagraph();
                flushUnordered();

                orderedItems.push(
                    ordered[1]
                );

                return;
            }


            paragraphLines.push(
                trimmed
            );
        }
    );


    flushParagraph();
    flushLists();


    return (
        <div className="space-y-3">
            {elements}
        </div>
    );
}


/* ========================================================= */
/* AI CHAT PAGE */
/* ========================================================= */

function AIChatPage() {

    const { subjectId } = useParams();

    const studentId = Number(
        localStorage.getItem("userId")
    );

    const [subjects, setSubjects] =
        useState([]);

    const [subjectsLoading, setSubjectsLoading] =
        useState(true);

    /* ===================================================== */
    /* LOAD SUBJECTS FROM BACKEND */
    /* ===================================================== */

    useEffect(() => {
        let cancelled = false;

        const loadSubjects = async () => {
            try {
                setSubjectsLoading(true);

                const response =
                    await fetch(
                        `${API_BASE}/api/subjects`
                    );

                const data =
                    await response
                        .json()
                        .catch(() => []);

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Unable to load subjects."
                    );
                }

                if (!cancelled) {
                    setSubjects(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                }

            } catch (error) {

                console.error(
                    "Subject loading error:",
                    error
                );

                if (!cancelled) {
                    setSubjects([]);
                }

            } finally {

                if (!cancelled) {
                    setSubjectsLoading(false);
                }
            }
        };

        loadSubjects();

        return () => {
            cancelled = true;
        };

    }, []);


    /* ===================================================== */
    /* CURRENT SUBJECT */
    /* ===================================================== */

    const normalizedSubjectRoute =
        String(subjectId || "")
            .trim()
            .toLowerCase();

    const subject = subjects.find((item) => {
        const id =
            String(item?.id ?? "")
                .trim()
                .toLowerCase();

        const code =
            String(item?.code ?? "")
                .trim()
                .toLowerCase();

        const name =
            String(item?.name ?? "")
                .trim()
                .toLowerCase();

        return (
            id === normalizedSubjectRoute ||
            code === normalizedSubjectRoute ||
            name === normalizedSubjectRoute
        );
    });

    const resolvedSubjectName =
        subject?.name ||
        subject?.code ||
        "AI";


    /* ===================================================== */
    /* CHAT STATE */
    /* ===================================================== */

    const createWelcomeMessage = () => {
        const storedName =
            localStorage.getItem("userName");

        const userName =
            storedName?.trim() || "Student";

        return [
            {
                id:
                    `welcome-${Date.now()}`,
                type:
                    "ai",
                text:
                    `Hello ${userName}! I'm your AI Tutor. I can help you with ${
                        subject?.name || "your subjects"
                    }. What would you like to learn today?`,
                time:
                    "Now",
            },
        ];
    };


    const [messages, setMessages] =
        useState(
            createWelcomeMessage()
        );


    const [message, setMessage] =
        useState("");

    const [isSending, setIsSending] =
        useState(false);

    const [chatError, setChatError] =
        useState("");


    /* ===================================================== */
    /* CONVERSATION STATE */
    /* ===================================================== */

    const [conversations, setConversations] =
        useState([]);


    const [selectedConversationId, setSelectedConversationId] =
        useState(null);


    const [openMenuId, setOpenMenuId] =
        useState(null);


    /* ===================================================== */
    /* USER MESSAGE EDIT STATE */
    /* ===================================================== */

    const [editingMessageId, setEditingMessageId] =
        useState(null);


    const [editingMessageText, setEditingMessageText] =
        useState("");


    /* ===================================================== */
    /* CONVERSATION EDIT STATE */
    /* ===================================================== */

    const [editingConversationId, setEditingConversationId] =
        useState(null);


    const [editingConversationTitle, setEditingConversationTitle] =
        useState("");


    /* ===================================================== */
    /* CREATE CONVERSATION */
    /* ===================================================== */

    const createConversation =
        async (
            title,
            subjectName
        ) => {

            const response =
                await fetch(
                    `${API_BASE}/api/conversations`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                title,
                                subject:
                                    subjectName,
                            }),
                    }
                );

            const data =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to create conversation."
                );
            }

            return data;
        };


    /* ===================================================== */
    /* LOAD CONVERSATION MESSAGES */
    /* ===================================================== */

    const getConversationCacheKey =
        (conversationId) =>
            `adaptiveAiChat_${studentId}_${conversationId}`;

    const saveConversationCache =
        (conversationId, chatMessages) => {
            try {
                localStorage.setItem(
                    getConversationCacheKey(
                        conversationId
                    ),
                    JSON.stringify(
                        Array.isArray(chatMessages)
                            ? chatMessages
                            : []
                    )
                );
            } catch (error) {
                console.warn(
                    "Unable to cache conversation:",
                    error
                );
            }
        };

    const getConversationCache =
        (conversationId) => {
            try {
                const raw =
                    localStorage.getItem(
                        getConversationCacheKey(
                            conversationId
                        )
                    );

                if (!raw) {
                    return [];
                }

                const parsed =
                    JSON.parse(raw);

                return Array.isArray(parsed)
                    ? parsed
                    : [];

            } catch {
                return [];
            }
        };

    const normalizeConversationMessages =
        (payload) => {

            const rawMessages =
                Array.isArray(payload)
                    ? payload
                    : Array.isArray(
                          payload?.messages
                      )
                        ? payload.messages
                        : Array.isArray(
                              payload?.data
                          )
                            ? payload.data
                            : Array.isArray(
                                  payload?.content
                              )
                                ? payload.content
                                : [];

            return rawMessages
                .filter(
                    (item) =>
                        item &&
                        typeof item ===
                            "object" &&
                        item.content != null
                )
                .map(
                    (item) => ({
                        id:
                            item.id ||
                            `cached-${Date.now()}-${Math.random()}`,

                        type:
                            String(
                                item.role || ""
                            ).toLowerCase() ===
                            "user"
                                ? "user"
                                : "ai",

                        text:
                            String(
                                item.content
                            ),

                        time:
                            formatTime(
                                item.createdAt
                            ),
                    })
                );
        };

    const loadConversationMessages =
        async (
            conversationId
        ) => {

            let serverMessages = [];

            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/conversations/${conversationId}/messages`
                    );

                const data =
                    await response
                        .json()
                        .catch(
                            () => []
                        );

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Unable to load conversation messages."
                    );
                }

                serverMessages =
                    normalizeConversationMessages(
                        data
                    );

            } catch (error) {

                console.error(
                    "Conversation message loading error:",
                    error
                );
            }

            if (
                serverMessages.length > 0
            ) {

                setMessages(
                    serverMessages
                );

                saveConversationCache(
                    conversationId,
                    serverMessages
                );

                return serverMessages;
            }

            const cachedMessages =
                getConversationCache(
                    conversationId
                );

            if (
                cachedMessages.length > 0
            ) {

                setMessages(
                    cachedMessages
                );

                return cachedMessages;
            }

            setMessages(
                createWelcomeMessage()
            );

            return [];
        };


    /* ===================================================== */
    /* LOAD CONVERSATIONS WHEN SUBJECT CHANGES */
    /* ===================================================== */

    useEffect(() => {

        if (subjectsLoading || !subject) {
            return;
        }

        let cancelled = false;

        const loadConversations =
            async () => {

                setMessage("");
                setChatError("");
                setOpenMenuId(null);

                setEditingMessageId(null);
                setEditingMessageText("");

                setEditingConversationId(null);
                setEditingConversationTitle("");

                setSelectedConversationId(
                    null
                );

                try {

                    const response =
                        await fetch(
                            `${API_BASE}/api/conversations`
                        );

                    const data =
                        await response
                            .json()
                            .catch(
                                () => []
                            );

                    if (!response.ok) {

                        throw new Error(
                            "Unable to load conversations."
                        );
                    }

                    const subjectName =
                        resolvedSubjectName;

                    const filtered =
                        Array.isArray(data)
                            ? data.filter(
                                  (item) => {

                                      const conversationSubject =
                                          String(
                                              item?.subject ||
                                              ""
                                          )
                                              .trim()
                                              .toLowerCase();

                                      const fullName =
                                          String(
                                              subject?.name ||
                                              ""
                                          )
                                              .trim()
                                              .toLowerCase();

                                      const code =
                                          String(
                                              subject?.code ||
                                              ""
                                          )
                                              .trim()
                                              .toLowerCase();

                                      const resolvedName =
                                          String(
                                              subjectName ||
                                              ""
                                          )
                                              .trim()
                                              .toLowerCase();

                                      return (
                                          conversationSubject ===
                                          fullName ||
                                          conversationSubject ===
                                          code ||
                                          conversationSubject ===
                                          resolvedName
                                      );
                                  }
                              )
                            : [];

                    if (cancelled) {
                        return;
                    }

                    const mapped =
                        filtered.map(
                            (item) => ({
                                id:
                                    item.id,

                                title:
                                    item.title,

                                subject:
                                    item.subject,

                                time:
                                    formatTime(
                                        item.updatedAt
                                    ),
                            })
                        );

                    setConversations(
                        mapped
                    );

                    if (
                        mapped.length > 0
                    ) {

                        const storedConversationId =
                            localStorage.getItem(
                                `adaptiveAiConversation_${studentId}_${subjectId}`
                            );

                        const storedConversation =
                            storedConversationId
                                ? mapped.find(
                                      (item) =>
                                          String(
                                              item.id
                                          ) ===
                                          String(
                                              storedConversationId
                                          )
                                  )
                                : null;

                        const firstConversation =
                            storedConversation ||
                            mapped[0];

                        setSelectedConversationId(
                            firstConversation.id
                        );

                        localStorage.setItem(
                            `adaptiveAiConversation_${studentId}_${subjectId}`,
                            String(
                                firstConversation.id
                            )
                        );

                        await loadConversationMessages(
                            firstConversation.id
                        );

                    } else {

                        const created =
                            await createConversation(
                                "New Conversation",
                                subjectName
                            );

                        if (cancelled) {
                            return;
                        }

                        const newConversation = {
                            id:
                                created.id,

                            title:
                                created.title,

                            subject:
                                created.subject,

                            time:
                                "Just now",
                        };

                        setConversations([
                            newConversation,
                        ]);

                        setSelectedConversationId(
                            created.id
                        );

                        localStorage.setItem(
                            `adaptiveAiConversation_${studentId}_${subjectId}`,
                            String(created.id)
                        );

                        setMessages(
                            createWelcomeMessage()
                        );
                    }

                } catch (error) {

                    if (cancelled) {
                        return;
                    }

                    console.error(
                        "Conversation loading error:",
                        error
                    );

                    setChatError(
                        error?.message ||
                        "Unable to load conversations."
                    );

                    setConversations([]);
                    setSelectedConversationId(
                        null
                    );

                    setMessages(
                        createWelcomeMessage()
                    );
                }
            };

        loadConversations();

        return () => {
            cancelled = true;
        };

    }, [
        subjectId,
        subject,
        subjectsLoading,
        resolvedSubjectName,
    ]);


    /* ===================================================== */
    /* LOADING SUBJECT */
    /* ===================================================== */

    if (subjectsLoading) {

        return (
            <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

                        <p className="text-sm font-medium text-slate-600">
                            Loading subject...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    /* ===================================================== */
    /* INVALID SUBJECT */
    /* ===================================================== */

    if (!subjectsLoading && !subject) {

        return (
            <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                    <h1 className="text-2xl font-bold text-slate-900">
                        Subject Not Found
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        The subject you are trying to access does not exist.
                    </p>

                    <Link
                        to="/student/subjects"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Back to Subjects
                    </Link>

                </div>

            </div>
        );
    }


    /* ===================================================== */
    /* NEW CHAT */
    /* ===================================================== */

    const handleNewChat =
        async () => {

            try {

                const subjectName =
                    resolvedSubjectName;

                const created =
                    await createConversation(
                        "New Conversation",
                        subjectName
                    );

                const newConversation = {
                    id:
                        created.id,

                    title:
                        created.title,

                    subject:
                        created.subject,

                    time:
                        "Just now",
                };

                setConversations(
                    (previousConversations) => [
                        newConversation,
                        ...previousConversations,
                    ]
                );

                setSelectedConversationId(
                    created.id
                );

                localStorage.setItem(
                    `adaptiveAiConversation_${studentId}_${subjectId}`,
                    String(created.id)
                );

                setMessages(
                    createWelcomeMessage()
                );

                setMessage("");
                setChatError("");

                setEditingMessageId(null);
                setEditingMessageText("");

                setEditingConversationId(null);
                setEditingConversationTitle("");

                setOpenMenuId(null);

            } catch (error) {

                console.error(
                    "Create conversation error:",
                    error
                );

                setChatError(
                    error?.message ||
                    "Unable to create conversation."
                );
            }
        };


    /* ===================================================== */
    /* SELECT CONVERSATION */
    /* ===================================================== */

    const handleConversationSelect =
        async (
            conversation
        ) => {

            setSelectedConversationId(
                conversation.id
            );

            localStorage.setItem(
                `adaptiveAiConversation_${studentId}_${subjectId}`,
                String(conversation.id)
            );

            setOpenMenuId(null);

            setEditingConversationId(null);
            setEditingConversationTitle("");

            setMessage("");
            setChatError("");

            try {

                await loadConversationMessages(
                    conversation.id
                );

            } catch (error) {

                console.error(
                    "Conversation selection error:",
                    error
                );

                setChatError(
                    error?.message ||
                    "Unable to load conversation."
                );
            }
        };


    /* ===================================================== */
    /* SEND MESSAGE */
    /* ===================================================== */

    const handleSend =
        async () => {

            const trimmedMessage =
                message.trim();

            if (
                !trimmedMessage ||
                isSending
            ) {
                return;
            }

            setChatError("");
            setIsSending(true);

            try {

                let conversationId =
                    selectedConversationId;

                // -----------------------------------------
                // CREATE A REAL CONVERSATION IF NEEDED
                // -----------------------------------------

                if (!conversationId) {

                    const subjectName =
                        resolvedSubjectName;

                    const created =
                        await createConversation(
                            "New Conversation",
                            subjectName
                        );

                    conversationId =
                        created.id;

                    const newConversation = {
                        id:
                            created.id,

                        title:
                            created.title,

                        subject:
                            created.subject,

                        time:
                            "Just now",
                    };

                    setConversations(
                        (previous) => [
                            newConversation,
                            ...previous,
                        ]
                    );

                    setSelectedConversationId(
                        created.id
                    );

                    localStorage.setItem(
                        `adaptiveAiConversation_${studentId}_${subjectId}`,
                        String(created.id)
                    );
                }

                // -----------------------------------------
                // SHOW USER MESSAGE IMMEDIATELY
                // -----------------------------------------

                const userMessage = {
                    id:
                        `temp-user-${Date.now()}`,

                    type:
                        "user",

                    text:
                        trimmedMessage,

                    time:
                        "Now",
                };

                setMessages(
                    (previousMessages) => {
                        const updatedMessages = [
                            ...previousMessages,
                            userMessage,
                        ];

                        saveConversationCache(
                            conversationId,
                            updatedMessages
                        );

                        return updatedMessages;
                    }
                );

                setMessage("");

                // -----------------------------------------
                // SEND TO BACKEND
                // -----------------------------------------

                const response =
                    await fetch(
                        `${API_BASE}/api/ai/chat`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({
                                    conversationId:
                                        conversationId,

                                    studentId:
                                        studentId,

                                    message:
                                        trimmedMessage,
                                }),
                        }
                    );

                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );

                if (!response.ok) {

                    throw new Error(
                        data?.message ||
                        `AI request failed (${response.status}).`
                    );
                }

                const reply =
                    typeof data?.reply ===
                    "string"
                        ? data.reply.trim()
                        : "";

                if (!reply) {

                    throw new Error(
                        "AI returned an empty response."
                    );
                }

                // -----------------------------------------
                // SHOW AI RESPONSE
                // -----------------------------------------

                const aiMessage = {
                    id:
                        `temp-ai-${Date.now()}`,

                    type:
                        "ai",

                    text:
                        reply,

                    time:
                        "Now",
                };

                setMessages(
                    (previousMessages) => {
                        const updatedMessages =
                            previousMessages.map(
                                (item) =>
                                    item.id ===
                                    userMessage.id
                                        ? {
                                              ...item,
                                              id:
                                                  data?.userMessageId ||
                                                  item.id,
                                          }
                                        : item
                            );

                        updatedMessages.push({
                            ...aiMessage,
                            id:
                                data?.assistantMessageId ||
                                aiMessage.id,
                        });

                        saveConversationCache(
                            conversationId,
                            updatedMessages
                        );

                        return updatedMessages;
                    }
                );

                // -----------------------------------------
                // MOVE CURRENT CONVERSATION TO TOP
                // -----------------------------------------

                setConversations(
                    (previous) => {

                        const current =
                            previous.find(
                                (item) =>
                                    item.id ===
                                    conversationId
                            );

                        if (!current) {
                            return previous;
                        }

                        return [
                            {
                                ...current,
                                time:
                                    "Just now",
                            },

                            ...previous.filter(
                                (item) =>
                                    item.id !==
                                    conversationId
                            ),
                        ];
                    }
                );

            } catch (error) {

                console.error(
                    "AI chat error:",
                    error
                );

                setChatError(
                    error?.message ||
                    "Unable to get an AI response. Please try again."
                );

            } finally {

                setIsSending(false);
            }
        };


    /* ===================================================== */
    /* ENTER TO SEND */
    /* ===================================================== */

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSend();
        }
    };


    /* ===================================================== */
    /* START EDITING USER MESSAGE */
    /* ===================================================== */

    const handleEditMessageStart = (
        item
    ) => {

        setEditingMessageId(
            item.id
        );

        setEditingMessageText(
            item.text
        );
    };


    /* ===================================================== */
    /* CANCEL MESSAGE EDIT */
    /* ===================================================== */

    const handleEditMessageCancel = () => {

        setEditingMessageId(null);

        setEditingMessageText("");
    };


    /* ===================================================== */
    /* SAVE EDITED USER MESSAGE + REGENERATE AI RESPONSE */
    /* ===================================================== */

    const handleEditMessageSave =
        async (
            messageId
        ) => {

            const trimmedText =
                editingMessageText.trim();

            if (!trimmedText) {
                return;
            }

            const messageIndex =
                messages.findIndex(
                    (item) =>
                        item.id ===
                        messageId
                );

            if (
                messageIndex === -1
            ) {
                return;
            }

            if (
                !selectedConversationId
            ) {

                setChatError(
                    "Conversation ID is required."
                );

                return;
            }

            setChatError("");
            setIsSending(true);

            try {

                /*
                 * Update the existing user message, remove the old
                 * messages after it, generate a fresh AI answer, and
                 * save that answer on the backend.
                 */

                const response =
                    await fetch(
                        `${API_BASE}/api/ai/regenerate/${selectedConversationId}/${messageId}`,
                        {
                            method:
                                "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({
                                    content:
                                        trimmedText,
                                    studentId:
                                        studentId,
                                }),
                        }
                    );

                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );

                if (!response.ok) {

                    throw new Error(
                        data?.message ||
                        `Unable to regenerate AI response (${response.status}).`
                    );
                }

                setEditingMessageId(null);
                setEditingMessageText("");

                /*
                 * Reload the complete conversation from PostgreSQL.
                 * This guarantees that the edited user message and the
                 * newly generated assistant response are both displayed
                 * exactly as stored by the backend.
                 */

                await loadConversationMessages(
                    selectedConversationId
                );

                setConversations(
                    (previous) =>
                        previous.map(
                            (conversation) =>
                                conversation.id ===
                                selectedConversationId
                                    ? {
                                          ...conversation,
                                          time:
                                              "Just now",
                                      }
                                    : conversation
                        )
                );

                /*
                 * The response itself is not directly inserted into local
                 * state because loadConversationMessages() fetches the
                 * authoritative messages from the database immediately
                 * after regeneration.
                 */
                void data;

            } catch (error) {

                console.error(
                    "Regenerate AI response error:",
                    error
                );

                setChatError(
                    error?.message ||
                    "Unable to regenerate the AI response."
                );

            } finally {

                setIsSending(false);
            }
        };


    /* ===================================================== */
    /* START EDITING CONVERSATION */
    /* ===================================================== */

    const handleConversationEditStart = (
        conversation
    ) => {

        setEditingConversationId(
            conversation.id
        );

        setEditingConversationTitle(
            conversation.title
        );

        setOpenMenuId(null);
    };


    /* ===================================================== */
    /* SAVE CONVERSATION TITLE */
    /* ===================================================== */

    const handleConversationEditSave =
        async (
            conversationId
        ) => {

            const trimmedTitle =
                editingConversationTitle.trim();

            if (!trimmedTitle) {
                return;
            }

            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/conversations/${conversationId}`,
                        {
                            method:
                                "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({
                                    title:
                                        trimmedTitle,
                                }),
                        }
                    );

                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );

                if (!response.ok) {

                    throw new Error(
                        data?.message ||
                        "Unable to rename conversation."
                    );
                }

                setConversations(
                    (previousConversations) =>
                        previousConversations.map(
                            (conversation) =>
                                conversation.id ===
                                conversationId
                                    ? {
                                          ...conversation,
                                          title:
                                              data.title ||
                                              trimmedTitle,
                                      }
                                    : conversation
                        )
                );

                setEditingConversationId(
                    null
                );

                setEditingConversationTitle(
                    ""
                );

                setChatError("");

            } catch (error) {

                console.error(
                    "Rename conversation error:",
                    error
                );

                setChatError(
                    error?.message ||
                    "Unable to rename conversation."
                );
            }
        };


    /* ===================================================== */
    /* CANCEL CONVERSATION EDIT */
    /* ===================================================== */

    const handleConversationEditCancel = () => {

        setEditingConversationId(null);

        setEditingConversationTitle("");
    };


    /* ===================================================== */
    /* DELETE CONVERSATION */
    /* ===================================================== */

    const handleConversationDelete =
        async (
            conversationId
        ) => {

            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/conversations/${conversationId}`,
                        {
                            method:
                                "DELETE",
                        }
                    );

                if (
                    !response.ok &&
                    response.status !== 204
                ) {

                    throw new Error(
                        "Unable to delete conversation."
                    );
                }

                const remaining =
                    conversations.filter(
                        (conversation) =>
                            conversation.id !==
                            conversationId
                    );

                setConversations(
                    remaining
                );

                setOpenMenuId(null);

                if (
                    selectedConversationId ===
                    conversationId
                ) {

                    if (
                        remaining.length > 0
                    ) {

                        const nextConversation =
                            remaining[0];

                        setSelectedConversationId(
                            nextConversation.id
                        );

                        await loadConversationMessages(
                            nextConversation.id
                        );

                    } else {

                        const subjectName =
                            resolvedSubjectName;

                        const created =
                            await createConversation(
                                "New Conversation",
                                subjectName
                            );

                        const newConversation = {
                            id:
                                created.id,

                            title:
                                created.title,

                            subject:
                                created.subject,

                            time:
                                "Just now",
                        };

                        setConversations([
                            newConversation,
                        ]);

                        setSelectedConversationId(
                            created.id
                        );

                        setMessages(
                            createWelcomeMessage()
                        );
                    }
                }

            } catch (error) {

                console.error(
                    "Delete conversation error:",
                    error
                );

                setChatError(
                    error?.message ||
                    "Unable to delete conversation."
                );
            }
        };


    /* ===================================================== */
    /* RENDER */
    /* ===================================================== */

    return (
        <div className="mt-[80px] flex h-[calc(100vh-80px)] min-h-0 bg-slate-50">


            {/* ================================================= */}
            {/* CHAT SIDEBAR */}
            
            {/* ================================================= */}

            <aside className="flex w-[255px] shrink-0 flex-col border-r border-slate-200 bg-white">


                {/* ================================================= */}
                {/* NEW CHAT */}
                {/* ================================================= */}

                <div className="shrink-0 border-b border-slate-200 p-4">

                    <button
                        type="button"
                        onClick={handleNewChat}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >

                        <Plus
                            size={18}
                            strokeWidth={2}
                        />

                        <span>
                            New Chat
                        </span>

                    </button>

                </div>


                {/* ================================================= */}
                {/* RECENT CONVERSATIONS */}
                {/* ================================================= */}

                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">

                    <p className="mb-4 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Recent Conversations
                    </p>


                    <div className="space-y-1">

                        {conversations.map(
                            (conversation) => {

                                const isSelected =
                                    selectedConversationId ===
                                    conversation.id;


                                const isEditing =
                                    editingConversationId ===
                                    conversation.id;


                                return (
                                    <div
                                        key={
                                            conversation.id
                                        }
                                        className={`group relative rounded-xl transition ${
                                            isSelected
                                                ? "bg-blue-50"
                                                : "hover:bg-slate-50"
                                        }`}
                                    >

                                        {/* ================================= */}
                                        {/* CONVERSATION ROW */}
                                        {/* ================================= */}

                                        <div
                                            className="flex cursor-pointer items-start gap-2.5 px-3 py-3"
                                            onClick={() =>
                                                handleConversationSelect(
                                                    conversation
                                                )
                                            }
                                        >

                                            <MessageSquare
                                                size={15}
                                                className={`mt-0.5 shrink-0 ${
                                                    isSelected
                                                        ? "text-blue-600"
                                                        : "text-slate-400"
                                                }`}
                                            />


                                            <div className="min-w-0 flex-1">

                                                {isEditing ? (

                                                    <div className="flex items-center gap-1">

                                                        <input
                                                            autoFocus
                                                            value={
                                                                editingConversationTitle
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setEditingConversationTitle(
                                                                    event.target.value
                                                                )
                                                            }
                                                            onClick={(event) =>
                                                                event.stopPropagation()
                                                            }
                                                            onKeyDown={(
                                                                event
                                                            ) => {

                                                                if (
                                                                    event.key ===
                                                                    "Enter"
                                                                ) {

                                                                    handleConversationEditSave(
                                                                        conversation.id
                                                                    );
                                                                }


                                                                if (
                                                                    event.key ===
                                                                    "Escape"
                                                                ) {

                                                                    handleConversationEditCancel();
                                                                }

                                                            }}
                                                            className="min-w-0 flex-1 rounded-md border border-blue-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
                                                        />


                                                        <button
                                                            type="button"
                                                            onClick={(event) => {

                                                                event.stopPropagation();

                                                                handleConversationEditSave(
                                                                    conversation.id
                                                                );

                                                            }}
                                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-green-600 hover:bg-green-50"
                                                        >
                                                            <Check
                                                                size={14}
                                                            />
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={(event) => {

                                                                event.stopPropagation();

                                                                handleConversationEditCancel();

                                                            }}
                                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"
                                                        >
                                                            <X
                                                                size={14}
                                                            />
                                                        </button>

                                                    </div>

                                                ) : (

                                                    <>
                                                        <p
                                                            className={`truncate text-sm font-medium ${
                                                                isSelected
                                                                    ? "text-blue-700"
                                                                    : "text-slate-700"
                                                            }`}
                                                        >
                                                            {
                                                                conversation.title
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-[11px] text-slate-400">
                                                            {
                                                                conversation.subject
                                                            }
                                                            {" "}
                                                            ·{" "}
                                                            {
                                                                conversation.time
                                                            }
                                                        </p>
                                                    </>

                                                )}

                                            </div>


                                            {/* ================================= */}
                                            {/* THREE-DOT MENU */}
                                            {/* ================================= */}

                                            {!isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={(
                                                        event
                                                    ) => {

                                                        event.stopPropagation();

                                                        setOpenMenuId(
                                                            openMenuId ===
                                                                conversation.id
                                                                ? null
                                                                : conversation.id
                                                        );

                                                    }}
                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition ${
                                                        openMenuId ===
                                                        conversation.id
                                                            ? "bg-slate-200 opacity-100"
                                                            : "opacity-0 group-hover:opacity-100"
                                                    } hover:bg-slate-200 hover:text-slate-700`}
                                                    title="Conversation options"
                                                >
                                                    <MoreVertical
                                                        size={16}
                                                    />
                                                </button>
                                            )}

                                        </div>


                                        {/* ================================= */}
                                        {/* EDIT / DELETE MENU */}
                                        {/* ================================= */}

                                        {openMenuId ===
                                            conversation.id && (
                                            <div className="absolute right-2 top-11 z-50 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleConversationEditStart(
                                                            conversation
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                >
                                                    <Pencil
                                                        size={14}
                                                    />

                                                    Edit

                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleConversationDelete(
                                                            conversation.id
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2
                                                        size={14}
                                                    />

                                                    Delete

                                                </button>

                                            </div>
                                        )}

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>

            </aside>


            {/* ================================================= */}
            {/* MAIN CHAT AREA */}
            {/* ================================================= */}

            <section className="flex min-w-0 flex-1 flex-col">


                {/* ================================================= */}
                {/* CHAT HEADER */}
                {/* ================================================= */}

                <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">

                    {/* AI TUTOR */}
                    <div className="flex items-center gap-3">

                        <AITutorLogo />

                        <div>

                            <h1 className="text-lg font-semibold text-slate-900">
                                AI Tutor
                            </h1>

                            <div className="mt-0.5 flex items-center gap-1.5">

                                <span className="h-2 w-2 rounded-full bg-green-500" />

                                <span className="text-xs font-medium text-green-600">
                                    Online · Ready to help
                                </span>

                            </div>

                        </div>

                    </div>


                </header>


                {/* ================================================= */}
                {/* CHAT MESSAGES */}
                {/* ================================================= */}

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-6 py-7">

                    <div className="mx-auto max-w-4xl space-y-7">

                        {chatError && (

                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                                {chatError}

                            </div>

                        )}

                        {messages.map(
                            (item) => {

                                const isUser =
                                    item.type ===
                                    "user";


                                const isEditing =
                                    editingMessageId ===
                                    item.id;


                                return (
                                    <div
                                        key={item.id}
                                        className={`group flex ${
                                            isUser
                                                ? "justify-end"
                                                : "items-start gap-3"
                                        }`}
                                    >

                                        {/* ================================= */}
                                        {/* AI MESSAGE */}
                                        {/* ================================= */}

                                        {!isUser && (
                                            <>
                                                <AITutorLogo
                                                    small
                                                />

                                                <div className="max-w-[78%]">

                                                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

                                                        {renderGeminiResponse(
                                                            item.text
                                                        )}

                                                    </div>


                                                    <p className="mt-2 text-[11px] text-slate-400">
                                                        {
                                                            item.time
                                                        }
                                                    </p>

                                                </div>

                                            </>
                                        )}


                                        {/* ================================= */}
                                        {/* USER MESSAGE */}
                                        {/* ================================= */}

                                        {isUser && (

                                            <div className="relative max-w-[75%]">

                                                {/* EDIT BUTTON */}

                                                {!isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditMessageStart(
                                                                item
                                                            )
                                                        }
                                                        title="Edit message"
                                                        className="absolute -left-10 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-slate-50 hover:text-slate-700"
                                                    >
                                                        <Pencil
                                                            size={15}
                                                        />
                                                    </button>
                                                )}


                                                {/* EDIT MODE */}

                                                {isEditing ? (

                                                    <div className="rounded-2xl border border-blue-300 bg-white p-2 shadow-sm">

                                                        <textarea
                                                            autoFocus
                                                            value={
                                                                editingMessageText
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setEditingMessageText(
                                                                    event.target.value
                                                                )
                                                            }
                                                            rows={3}
                                                            className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none"
                                                        />


                                                        <div className="flex items-center justify-end gap-2 px-2 pb-1">

                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    handleEditMessageCancel
                                                                }
                                                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                                                            >
                                                                Cancel
                                                            </button>


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEditMessageSave(
                                                                        item.id
                                                                    )
                                                                }
                                                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                                            >
                                                                Save
                                                            </button>

                                                        </div>

                                                    </div>

                                                ) : (

                                                    /* NORMAL USER MESSAGE */

                                                    <div className="rounded-2xl bg-blue-600 px-5 py-3.5 text-white shadow-sm">

                                                        <p className="text-[15px] leading-7">
                                                            {
                                                                item.text
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-[11px] text-blue-100">
                                                            {
                                                                item.time
                                                            }
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                        )}

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>


                {/* ================================================= */}
                {/* MESSAGE COMPOSER */}
                {/* ================================================= */}

                <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">

                    <div className="mx-auto max-w-5xl">

                        <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

                            <textarea
                                value={message}
                                onChange={(event) =>
                                    setMessage(
                                        event.target.value
                                    )
                                }
                                onKeyDown={
                                    handleKeyDown
                                }
                                rows={1}
                                placeholder={`Ask anything about ${subject.name}...`}
                                className="max-h-32 min-h-[46px] flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                            />


                            <button
                                type="button"
                                onClick={
                                    handleSend
                                }
                                disabled={
                                    !message.trim() ||
                                    isSending
                                }
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200"
                                title={
                                    isSending
                                        ? "Waiting for AI..."
                                        : "Send message"
                                }
                            >
                                {isSending ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <Send size={17} />
                                )}
                            </button>

                        </div>


                        <p className="mt-2 text-center text-[11px] text-slate-400">
                            {isSending
                                ? "AI is thinking..."
                                : "AI responses are based on uploaded course materials. Press Enter to send."}
                        </p>

                    </div>

                </div>

            </section>

        </div>
    );
}


export default AIChatPage;