const getCurrentUserName = () => {

    try {

        const storedUser =
            JSON.parse(
                localStorage.getItem("user") ||
                "null"
            );

        return (
            storedUser?.name ||
            storedUser?.fullName ||
            storedUser?.username ||
            localStorage.getItem("userName") ||
            "Student"
        );

    } catch {

        return (
            localStorage.getItem("userName") ||
            "Student"
        );

    }

};


const WelcomeSection = () => {

    // Get current date and time
    const now = new Date();

    // Get current hour
    const hour = now.getHours();

    // Get current user name
    const userName =
        getCurrentUserName();

    // Dynamic greeting
    let greeting;

    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }

    // Format current date
    const formattedDate =
        now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
        });


    return (
        <section className="mb-8">

            <h1 className="text-2xl font-bold text-gray-900">
                {greeting}, {userName} 👋
            </h1>

            <p className="mt-1 text-sm text-gray-500">
                Here's your learning summary for today, {formattedDate}.
            </p>

        </section>
    );
};


export default WelcomeSection;