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

import subjects from "../../data/subjects";


/* ========================================================= */
/* RECENT CONVERSATIONS */
/* ========================================================= */

const initialConversations = [
    {
        id: 1,
        title: "SQL Joins Explained",
        subject: "DBMS",
        time: "2h ago",
    },
    {
        id: 2,
        title: "Process vs Thread",
        subject: "OS",
        time: "5h ago",
    },
    {
        id: 3,
        title: "TCP/IP Model Layers",
        subject: "CN",
        time: "Yesterday",
    },
    {
        id: 4,
        title: "Java OOP Polymorphism",
        subject: "Java",
        time: "Yesterday",
    },
    {
        id: 5,
        title: "Deadlock Prevention",
        subject: "OS",
        time: "2d ago",
    },
    {
        id: 6,
        title: "ER Diagram Basics",
        subject: "DBMS",
        time: "3d ago",
    },
];


/* ========================================================= */
/* SUBJECT SHORT NAMES */
/* ========================================================= */

const subjectShortNames = {
    dbms: "DBMS",
    os: "OS",
    cn: "CN",
    java: "Java",
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
/* AI CHAT PAGE */
/* ========================================================= */

function AIChatPage() {

    const { subjectId } = useParams();


    /* ===================================================== */
    /* CURRENT SUBJECT */
    /* ===================================================== */

    const subject = subjects.find(
        (item) => item.id === subjectId
    );


    /* ===================================================== */
    /* CHAT STATE */
    /* ===================================================== */

    const createWelcomeMessage = () => [
        {
            id: Date.now(),
            type: "ai",
            text: `Hello Sujal! I'm your AI Tutor. I can help you with ${
                subject?.name || "your subjects"
            }. What would you like to learn today?`,
            time: "10:00 AM",
        },
    ];


    const [messages, setMessages] = useState(
        createWelcomeMessage()
    );


    const [message, setMessage] = useState("");


    /* ===================================================== */
    /* CONVERSATION STATE */
    /* ===================================================== */

    const [conversations, setConversations] = useState(
        initialConversations
    );


    const [selectedConversationId, setSelectedConversationId] =
        useState(1);


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
    /* RESET CHAT WHEN SUBJECT CHANGES */
    /* ===================================================== */

    useEffect(() => {

        if (!subject) {
            return;
        }


        setMessages([
            {
                id: Date.now(),
                type: "ai",
                text: `Hello Sujal! I'm your AI Tutor. I can help you with ${subject.name}. What would you like to learn today?`,
                time: "10:00 AM",
            },
        ]);


        setMessage("");

        setEditingMessageId(null);

        setEditingMessageText("");

        setEditingConversationId(null);

        setEditingConversationTitle("");

        setOpenMenuId(null);

        setSelectedConversationId(null);

    }, [subjectId]);


    /* ===================================================== */
    /* INVALID SUBJECT */
    /* ===================================================== */

    if (!subject) {

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

    const handleNewChat = () => {

        const newConversation = {
            id: Date.now(),
            title: "New Conversation",
            subject:
                subjectShortNames[subjectId] || "AI",
            time: "Just now",
        };


        setConversations(
            (previousConversations) => [
                newConversation,
                ...previousConversations,
            ]
        );


        setSelectedConversationId(
            newConversation.id
        );


        setMessages([
            {
                id: Date.now() + 1,
                type: "ai",
                text: `Hello Sujal! I'm your AI Tutor. I can help you with ${subject.name}. What would you like to learn today?`,
                time: "Now",
            },
        ]);


        setMessage("");

        setEditingMessageId(null);

        setEditingMessageText("");

        setEditingConversationId(null);

        setEditingConversationTitle("");

        setOpenMenuId(null);
    };


    /* ===================================================== */
    /* SELECT CONVERSATION */
    /* ===================================================== */

    const handleConversationSelect = (
        conversation
    ) => {

        setSelectedConversationId(
            conversation.id
        );


        setOpenMenuId(null);


        setEditingConversationId(null);

        setEditingConversationTitle("");


        /*
         * Temporary conversation loading.
         * Real conversation history will come
         * from the backend/database later.
         */

        setMessages([
            {
                id: Date.now(),
                type: "ai",
                text: `Hello Sujal! Let's continue with ${conversation.title}. What would you like to learn?`,
                time: "10:00 AM",
            },
        ]);


        setMessage("");
    };


    /* ===================================================== */
    /* SEND MESSAGE */
    /* ===================================================== */

    const handleSend = () => {

        const trimmedMessage =
            message.trim();


        if (!trimmedMessage) {
            return;
        }


        const userMessage = {
            id: Date.now(),
            type: "user",
            text: trimmedMessage,
            time: "Now",
        };


        setMessages(
            (previousMessages) => [
                ...previousMessages,
                userMessage,
            ]
        );


        setMessage("");


        /* Temporary AI response */
        setTimeout(() => {

            const aiMessage = {
                id: Date.now() + 1,
                type: "ai",
                text: `I received your question about ${subject.name}. The real AI API will be connected in a later development stage.`,
                time: "Now",
            };


            setMessages(
                (previousMessages) => [
                    ...previousMessages,
                    aiMessage,
                ]
            );

        }, 700);
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
    /* SAVE EDITED USER MESSAGE */
    /* ===================================================== */

    const handleEditMessageSave = (
        messageId
    ) => {

        const trimmedText =
            editingMessageText.trim();


        if (!trimmedText) {
            return;
        }


        setMessages(
            (previousMessages) => {

                const messageIndex =
                    previousMessages.findIndex(
                        (item) =>
                            item.id ===
                            messageId
                    );


                if (messageIndex === -1) {
                    return previousMessages;
                }


                /*
                 * Keep all messages before the edited
                 * user message and replace the edited one.
                 * The previous AI reply is removed because
                 * the question has changed.
                 */

                return [
                    ...previousMessages.slice(
                        0,
                        messageIndex
                    ),

                    {
                        id: messageId,
                        type: "user",
                        text: trimmedText,
                        time: "Now",
                    },
                ];
            }
        );


        setEditingMessageId(null);

        setEditingMessageText("");


        /* Temporary new AI response */
        setTimeout(() => {

            const aiMessage = {
                id: Date.now(),
                type: "ai",
                text: `Updated question received. The real AI API will generate the answer for "${trimmedText}" later.`,
                time: "Now",
            };


            setMessages(
                (previousMessages) => [
                    ...previousMessages,
                    aiMessage,
                ]
            );

        }, 700);
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

    const handleConversationEditSave = (
        conversationId
    ) => {

        const trimmedTitle =
            editingConversationTitle.trim();


        if (!trimmedTitle) {
            return;
        }


        setConversations(
            (previousConversations) =>
                previousConversations.map(
                    (conversation) =>
                        conversation.id ===
                        conversationId
                            ? {
                                ...conversation,
                                title: trimmedTitle,
                            }
                            : conversation
                )
        );


        setEditingConversationId(null);

        setEditingConversationTitle("");
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

    const handleConversationDelete = (
        conversationId
    ) => {

        setConversations(
            (previousConversations) =>
                previousConversations.filter(
                    (conversation) =>
                        conversation.id !==
                        conversationId
                )
        );


        if (
            selectedConversationId ===
            conversationId
        ) {

            setSelectedConversationId(null);

            setMessages([
                {
                    id: Date.now(),
                    type: "ai",
                    text: `Hello Sujal! I'm your AI Tutor. I can help you with ${subject.name}. What would you like to learn today?`,
                    time: "Now",
                },
            ]);
        }


        setOpenMenuId(null);
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


                    {/* SUBJECT FILTERS */}
                    <div className="flex items-center gap-2">

                        {Object.entries(
                            subjectShortNames
                        ).map(
                            ([id, name]) => {

                                const isActive =
                                    id === subjectId;


                                return (
                                    <Link
                                        key={id}
                                        to={`/student/chat/${id}`}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                            isActive
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {name}
                                    </Link>
                                );
                            }
                        )}

                    </div>

                </header>


                {/* ================================================= */}
                {/* CHAT MESSAGES */}
                {/* ================================================= */}

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-6 py-7">

                    <div className="mx-auto max-w-4xl space-y-7">

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

                                                        <p className="text-[15px] leading-7 text-slate-700">
                                                            {
                                                                item.text
                                                            }
                                                        </p>

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
                                                                Save & Submit
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
                                    !message.trim()
                                }
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200"
                                title="Send message"
                            >
                                <Send size={17} />
                            </button>

                        </div>


                        <p className="mt-2 text-center text-[11px] text-slate-400">
                            AI responses are based on uploaded course materials. Press Enter to send.
                        </p>

                    </div>

                </div>

            </section>

        </div>
    );
}


export default AIChatPage;