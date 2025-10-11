import React, { useState } from 'react';

const FileUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) return alert("Please select a file first!");
        // Here you can handle uploading (e.g., send to backend or process locally)
        console.log("Uploading file:", file.name);
    };

    return (
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
    <input
        type="file" accept=".pdf"
    onChange={handleFileChange}
    style={{ marginBottom: '1rem' }}
    />
    <br />
    <button onClick={handleUpload}>Upload</button>

    </div>
);
};

export default FileUpload;