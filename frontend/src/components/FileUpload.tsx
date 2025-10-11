import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import openFolder from '../assets/open-folder.png'
import xIcon from '../assets/x.png'

// Define the expected structure of the AI response
interface StudyMaterial {
    flashcards: { term: string; definition: string }[];
    quiz: { question: string; options: string[]; answer: string }[];
}

const FileUpload: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Ensure this URL matches your running Flask backend
    const BACKEND_URL = 'http://127.0.0.1:5000'; 

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            console.log("File selected:", e.target.files[0].name);
        }
    };

    const openFileDialog = () => {
        inputRef.current?.click(); 
    };

    // Refined click handler: opens dialog if no file, uploads if file exists
    const handleButtonClick = () => {
        if (!file) {
            openFileDialog();
        } else {
            handleUpload();
        }
    };
    
    // Core function to send the file and handle the response
    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);
        
        const formData = new FormData();
        // 'file' key must match Python backend's request.files['file']
        formData.append('file', file); 

        try {
            console.log(`Sending file to: ${BACKEND_URL}/upload`);
            
            const response = await fetch(`${BACKEND_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            
            console.log("Backend Response Status:", response.status);

            if (!response.ok) {
                // Handle server-side errors (e.g., Gemini error, failed PDF extraction)
                console.error('Backend Error:', result.error);
                setError(result.error || "An unknown error occurred during processing.");
                return;
            }

            const studyMaterial: StudyMaterial = result;
            console.log('Successfully generated material:', studyMaterial);

            // SUCCESS & REDIRECT: Use navigate to push data to the Dashboard page
            navigate('/dashboard', { 
                state: { 
                    studyMaterial, 
                    sessionName: file.name.replace('.pdf', '') 
                } 
            });

        } catch (e: any) {
            console.error('Network or General Error:', e.message);
            // This error means Flask isn't running or CORS is misconfigured
            setError(`Could not connect to backend. Is the server running on ${BACKEND_URL}?`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear =() => {
        setFile(null);
        setError(null);
        setIsLoading(false);
    }

    const buttonText = isLoading 
        ? "Processing..." 
        : (file ? "Upload" : "Browse");


    return (
        <div className="p-12 border-2 border-dashed border-gray-400 rounded-xl text-center">
            {error && (
                 <div className="mb-4 p-3 bg-red-800 text-white rounded-lg text-sm">
                    Error: {error}
                </div>
            )}
            <p className="mb-4 text-lg text-gray-700 max-w-[169px] mx-auto truncate">
                {file ? `${file.name}` : "Upload your file here"}
            </p>

            {/* Hidden input - The ref MUST be here for the button to click it */}
            <input
                type="file"
                ref={inputRef} 
                id="fileInput"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
            />
            
            {/* Folder Icon */}
            <img 
                src={openFolder} 
                alt="Folder icon" 
                width={"100"} 
                className={`mx-auto mb-4 ${isLoading ? 'animate-pulse' : ''}`}
            />

            {/* Combined button */}
            <div className="flex gap-6">
                <div className="flex-1">
                <button
                    onClick={handleButtonClick}
                    disabled={isLoading} 
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {buttonText}
                </button>
                    </div>
                <div className="flex-1">
                <img src={xIcon} alt="Remove icon" width={"50"} className="mx-auto mb-4 cursor-pointer"
                onClick={handleClear}
                />

                </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-500">
                {isLoading ? "Analyzing PDF with Gemini AI..." : "Click Browse or Upload to proceed."}
            </p>
        </div>
    );
};

export default FileUpload;