import React, { useState, useRef } from "react";
import openFolder from './assets/open-folder.png'

const FileUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            console.log("File selected:", e.target.files[0].name);
        }
    };

    const handleButtonClick = () => {
        if (!file) {
            // No file selected → open file dialog
            inputRef.current?.click();
        } else {
            // File selected → upload it
            handleUpload();
        }
    };

    const handleUpload = () => {
        if (!file) return alert("Please select a file first!");
        console.log("Uploading file:", file.name);
        // your upload logic here (e.g., send with fetch + FormData)
    };

    return (
        <div className="p-12 border-2 border-dashed border-gray-400 rounded-xl text-center">
            <p className="mb-4 text-lg text-gray-700">
                {file ? `Selected file: ${file.name}` : "Upload your file here"}
            </p>

            {/* Hidden input */}
            <input
                type="file"
                ref={inputRef}
                id="fileInput"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
            />
                <img src={openFolder} alt="Folder icon" width={"100"} className="mx-auto mb-4"/>

            {/* Combined button */}
            <button
                onClick={handleButtonClick}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
                {file ? "Upload" : "Browse File"}
            </button>
        </div>
    );
};

export default FileUpload;
