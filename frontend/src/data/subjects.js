const subjects = [
    {
        id: "dbms",
        name: "Database Management System",
        shortName: "DBMS",
        units: 8,
        topics: 47,
        questions: 124,
        description:
            "Learn database concepts, SQL, normalization, transactions and database design.",
        progress: 68,
        color: "blue",

        study: {
            units: [
                {
                    id: 1,
                    title: "Introduction to Database Systems",
                    topics: 6,
                },
                {
                    id: 2,
                    title: "Relational Model",
                    topics: 7,
                },
                {
                    id: 3,
                    title: "SQL",
                    topics: 8,
                },
                {
                    id: 4,
                    title: "Normalization",
                    topics: 6,
                },
                {
                    id: 5,
                    title: "Transactions",
                    topics: 5,
                },
                {
                    id: 6,
                    title: "Concurrency Control",
                    topics: 5,
                },
                {
                    id: 7,
                    title: "Database Recovery",
                    topics: 5,
                },
                {
                    id: 8,
                    title: "Database Security",
                    topics: 5,
                },
            ],
        },
    },

    {
        id: "os",
        name: "Operating System",
        shortName: "OS",
        units: 10,
        topics: 58,
        questions: 98,
        description:
            "Understand processes, memory management, scheduling, file systems and more.",
        progress: 52,
        color: "green",

        study: {
            units: [
                {
                    id: 1,
                    title: "Introduction to Operating Systems",
                    topics: 5,
                },
                {
                    id: 2,
                    title: "Process Management",
                    topics: 7,
                },
                {
                    id: 3,
                    title: "Process Scheduling",
                    topics: 6,
                },
                {
                    id: 4,
                    title: "Threads",
                    topics: 5,
                },
                {
                    id: 5,
                    title: "Deadlocks",
                    topics: 6,
                },
                {
                    id: 6,
                    title: "Memory Management",
                    topics: 7,
                },
                {
                    id: 7,
                    title: "Virtual Memory",
                    topics: 6,
                },
                {
                    id: 8,
                    title: "File Systems",
                    topics: 6,
                },
                {
                    id: 9,
                    title: "I/O Systems",
                    topics: 5,
                },
                {
                    id: 10,
                    title: "Security",
                    topics: 5,
                },
            ],
        },
    },

    {
        id: "cn",
        name: "Computer Networks",
        shortName: "CN",
        units: 9,
        topics: 52,
        questions: 87,
        description:
            "Explore networking concepts, protocols, TCP/IP, routing and network security.",
        progress: 41,
        color: "orange",

        study: {
            units: [
                {
                    id: 1,
                    title: "Introduction to Computer Networks",
                    topics: 5,
                },
                {
                    id: 2,
                    title: "OSI Model",
                    topics: 6,
                },
                {
                    id: 3,
                    title: "TCP/IP Model",
                    topics: 6,
                },
                {
                    id: 4,
                    title: "Data Link Layer",
                    topics: 5,
                },
                {
                    id: 5,
                    title: "Network Layer",
                    topics: 7,
                },
                {
                    id: 6,
                    title: "Transport Layer",
                    topics: 6,
                },
                {
                    id: 7,
                    title: "Application Layer",
                    topics: 6,
                },
                {
                    id: 8,
                    title: "Routing",
                    topics: 6,
                },
                {
                    id: 9,
                    title: "Network Security",
                    topics: 5,
                },
            ],
        },
    },

    {
        id: "java",
        name: "Java Programming",
        shortName: "JAVA",
        units: 12,
        topics: 68,
        questions: 156,
        description:
            "Master Java programming, OOP concepts, collections, exceptions and more.",
        progress: 75,
        color: "purple",

        study: {
            units: [
                {
                    id: 1,
                    title: "Java Fundamentals",
                    topics: 6,
                },
                {
                    id: 2,
                    title: "Variables and Data Types",
                    topics: 5,
                },
                {
                    id: 3,
                    title: "Control Statements",
                    topics: 5,
                },
                {
                    id: 4,
                    title: "Arrays and Strings",
                    topics: 6,
                },
                {
                    id: 5,
                    title: "Classes and Objects",
                    topics: 6,
                },
                {
                    id: 6,
                    title: "Inheritance",
                    topics: 5,
                },
                {
                    id: 7,
                    title: "Polymorphism",
                    topics: 5,
                },
                {
                    id: 8,
                    title: "Interfaces and Abstraction",
                    topics: 6,
                },
                {
                    id: 9,
                    title: "Exception Handling",
                    topics: 5,
                },
                {
                    id: 10,
                    title: "Collections",
                    topics: 7,
                },
                {
                    id: 11,
                    title: "Multithreading",
                    topics: 6,
                },
                {
                    id: 12,
                    title: "File Handling",
                    topics: 6,
                },
            ],
        },
    },

    {
        id: "data-structures",
        name: "Data Structures",
        shortName: "DS",
        units: 10,
        topics: 55,
        questions: 110,
        description:
            "Learn arrays, linked lists, stacks, queues, trees, graphs and algorithms.",
        progress: 60,
        color: "blue",

        study: {
            units: [
                {
                    id: 1,
                    title: "Introduction to Data Structures",
                    topics: 5,
                },
                {
                    id: 2,
                    title: "Arrays",
                    topics: 6,
                },
                {
                    id: 3,
                    title: "Linked Lists",
                    topics: 6,
                },
                {
                    id: 4,
                    title: "Stacks",
                    topics: 5,
                },
                {
                    id: 5,
                    title: "Queues",
                    topics: 5,
                },
                {
                    id: 6,
                    title: "Trees",
                    topics: 7,
                },
                {
                    id: 7,
                    title: "Binary Search Trees",
                    topics: 5,
                },
                {
                    id: 8,
                    title: "Graphs",
                    topics: 6,
                },
                {
                    id: 9,
                    title: "Sorting",
                    topics: 5,
                },
                {
                    id: 10,
                    title: "Searching",
                    topics: 5,
                },
            ],
        },
    },

    {
        id: "software-engineering",
        name: "Software Engineering",
        shortName: "SE",
        units: 8,
        topics: 42,
        questions: 85,
        description:
            "Understand software development models, requirements, testing and project management.",
        progress: 35,
        color: "green",

        study: {
            units: [
                {
                    id: 1,
                    title: "Introduction to Software Engineering",
                    topics: 5,
                },
                {
                    id: 2,
                    title: "Software Development Models",
                    topics: 6,
                },
                {
                    id: 3,
                    title: "Requirements Engineering",
                    topics: 6,
                },
                {
                    id: 4,
                    title: "Software Design",
                    topics: 5,
                },
                {
                    id: 5,
                    title: "Software Testing",
                    topics: 6,
                },
                {
                    id: 6,
                    title: "Project Management",
                    topics: 5,
                },
                {
                    id: 7,
                    title: "Software Maintenance",
                    topics: 4,
                },
                {
                    id: 8,
                    title: "Software Quality",
                    topics: 5,
                },
            ],
        },
    },
];

export default subjects;