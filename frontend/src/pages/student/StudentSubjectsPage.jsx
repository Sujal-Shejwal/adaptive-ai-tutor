import { useEffect, useState } from "react";

export default function StudentSubjectsPage() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://localhost:8080/api/subjects")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load subjects");
                }

                return response.json();
            })
            .then((data) => {
                setSubjects(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError("Unable to load subjects");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={{ padding: "40px" }}>
                Loading subjects...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "40px", color: "red" }}>
                {error}
            </div>
        );
    }

    return (
        <div style={{ padding: "40px" }}>
            <h1>My Subjects</h1>

            <p>
                Select a subject to start learning.
            </p>

            {subjects.length === 0 ? (
                <p>No subjects available.</p>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "20px",
                        marginTop: "30px",
                    }}
                >
                    {subjects.map((subject) => (
                        <div
                            key={subject.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "12px",
                                padding: "24px",
                                background: "white",
                            }}
                        >
                            <h2>{subject.name}</h2>

                            <p>{subject.code}</p>

                            <p>
                                {subject.description}
                            </p>

                            <button
                                style={{
                                    marginTop: "15px",
                                    padding: "10px 18px",
                                    border: "none",
                                    borderRadius: "8px",
                                    background: "#2563eb",
                                    color: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Start Learning
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}