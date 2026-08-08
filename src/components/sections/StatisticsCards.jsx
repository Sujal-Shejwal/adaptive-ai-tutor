import {
    MessageSquare,
    ClipboardCheck,
    TrendingUp,
    BarChart3,
} from "lucide-react";

const StatisticsCards = () => {
    const statistics = [
        {
            icon: MessageSquare,
            value: "347",
            label: "Questions Asked",
            change: "+12 this week",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            changeColor: "text-blue-600",
        },
        {
            icon: ClipboardCheck,
            value: "28",
            label: "Quizzes Completed",
            change: "+3 this week",
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-500",
            changeColor: "text-emerald-500",
        },
        {
            icon: TrendingUp,
            value: "14 days",
            label: "Learning Streak",
            change: "Personal best!",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-500",
            changeColor: "text-amber-500",
        },
        {
            icon: BarChart3,
            value: "76%",
            label: "Avg Quiz Score",
            change: "+4% from last",
            iconBg: "bg-violet-100",
            iconColor: "text-violet-500",
            changeColor: "text-violet-500",
        },
    ];

    return (
        <section>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statistics.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-gray-200 bg-white p-5"
                        >
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
                            >
                                <Icon
                                    size={19}
                                    className={stat.iconColor}
                                />
                            </div>

                            <p className="mt-4 text-2xl font-bold text-gray-900">
                                {stat.value}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {stat.label}
                            </p>

                            <p className={`mt-1 text-xs ${stat.changeColor}`}>
                                {stat.change}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default StatisticsCards;