import {
    MessageSquare,
    ClipboardCheck,
    BookOpen,
} from "lucide-react";

const RecentActivity = () => {
    const activities = [
        {
            icon: MessageSquare,
            title: "Asked about SQL Joins in DBMS",
            time: "2 hours ago",
            color: "blue",
        },
        {
            icon: ClipboardCheck,
            title: "Completed Quiz: Process Scheduling",
            time: "5 hours ago",
            color: "green",
        },
        {
            icon: BookOpen,
            title: "Studied Unit 3: TCP/IP Model",
            time: "Yesterday",
            color: "orange",
        },
        {
            icon: ClipboardCheck,
            title: "Completed Quiz: Java OOP Concepts",
            time: "Yesterday",
            color: "green",
        },
        {
            icon: MessageSquare,
            title: "Asked about Deadlock Prevention",
            time: "2 days ago",
            color: "blue",
        },
    ];

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
            </h2>

            <div className="mt-5 space-y-4">
                {activities.map((activity) => {
                    const Icon = activity.icon;

                    return (
                        <div
                            key={activity.title}
                            className="flex items-start gap-3"
                        >
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    activity.color === "blue"
                                        ? "bg-blue-100 text-blue-600"
                                        : activity.color === "green"
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "bg-orange-100 text-orange-600"
                                }`}
                            >
                                <Icon size={16} />
                            </div>

                            <div>
                                <p className="text-sm text-gray-700">
                                    {activity.title}
                                </p>

                                <span className="text-xs text-gray-400">
                                    {activity.time}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default RecentActivity;