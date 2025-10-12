import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Planner() {
    const navigate = useNavigate();
    const [topic, setTopic] = useState("");
    const [midtermDate, setMidtermDate] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !topic || !midtermDate) {
            setError("Please fill out all fields and select a file.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("topic", topic);
        formData.append("midterm_date", midtermDate);

        try {
            const response = await fetch("http://127.0.0.1:5000/generate_plan", {
                method: "POST",
                body: formData,
            });
            
            const result = await response.json();

            if (response.ok) {
                // Redirect to the dashboard and pass the new session info
                navigate('/dashboard', { 
                    state: { 
                        session_id: result.session_id, 
                        session_name: result.session_name
                    } 
                });
            } else {
                setError(result.error || "An unknown error occurred during plan generation.");
            }
        } catch (err) {
            setError("Network Error: Could not connect to the backend to generate the plan.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative">
            <div className="relative z-10 w-full px-6 lg:px-12 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-white text-center">
                        AI Test Planner
                    </h1>
                    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="topic" className="block text-gray-300 text-sm font-medium mb-2">
                                    Topic
                                </label>
                                <input
                                    id="topic"
                                    type="text"
                                    placeholder="e.g., Math"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400"
                                />
                            </div>
                            <div>
                                <label htmlFor="midterm-date" className="block text-gray-300 text-sm font-medium mb-2">
                                    Midterm Date
                                </label>
                                <input
                                    id="midterm-date"
                                    type="date"
                                    value={midtermDate}
                                    onChange={(e) => setMidtermDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="notes-file" className="block text-gray-300 text-sm font-medium mb-2">
                                    Notes (PDF)
                                </label>
                                <input
                                    id="notes-file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-4 rounded-xl font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Generating Plan..." : "Generate Plan"}
                            </button>
                            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Planner;