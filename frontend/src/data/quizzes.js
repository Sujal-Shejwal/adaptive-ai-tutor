const quizzes = {
    dbms: {
        title: "Database Management System Quiz",
        duration: 10,

        questions: [
            {
                id: 1,
                question:
                    "Which SQL command is used to retrieve data from a database?",
                options: [
                    "INSERT",
                    "SELECT",
                    "UPDATE",
                    "DELETE",
                ],
                correctAnswer: 1,
            },
            {
                id: 2,
                question:
                    "Which key uniquely identifies each record in a table?",
                options: [
                    "Foreign Key",
                    "Candidate Key",
                    "Primary Key",
                    "Alternate Key",
                ],
                correctAnswer: 2,
            },
            {
                id: 3,
                question:
                    "Which normal form removes partial dependency?",
                options: [
                    "1NF",
                    "2NF",
                    "3NF",
                    "BCNF",
                ],
                correctAnswer: 1,
            },
            {
                id: 4,
                question:
                    "Which SQL command removes a table completely?",
                options: [
                    "DELETE",
                    "REMOVE",
                    "DROP",
                    "CLEAR",
                ],
                correctAnswer: 2,
            },
            {
                id: 5,
                question:
                    "Which of the following is a database management system?",
                options: [
                    "MySQL",
                    "HTML",
                    "CSS",
                    "JavaScript",
                ],
                correctAnswer: 0,
            },
        ],
    },

    os: {
        title: "Operating System Quiz",
        duration: 10,

        questions: [
            {
                id: 1,
                question:
                    "Which scheduling algorithm uses a time quantum?",
                options: [
                    "FCFS",
                    "SJF",
                    "Round Robin",
                    "Priority",
                ],
                correctAnswer: 2,
            },
            {
                id: 2,
                question:
                    "Which of the following is a necessary condition for deadlock?",
                options: [
                    "Mutual Exclusion",
                    "Compilation",
                    "Caching",
                    "Indexing",
                ],
                correctAnswer: 0,
            },
            {
                id: 3,
                question:
                    "Which memory management technique divides memory into fixed-size pages?",
                options: [
                    "Paging",
                    "Segmentation",
                    "Spooling",
                    "Swapping",
                ],
                correctAnswer: 0,
            },
            {
                id: 4,
                question:
                    "Which component manages processes and memory?",
                options: [
                    "Compiler",
                    "Operating System",
                    "Browser",
                    "Database",
                ],
                correctAnswer: 1,
            },
            {
                id: 5,
                question:
                    "Which of the following is a process synchronization problem?",
                options: [
                    "Producer-Consumer",
                    "Sorting",
                    "Searching",
                    "Compilation",
                ],
                correctAnswer: 0,
            },
        ],
    },
};

export default quizzes;