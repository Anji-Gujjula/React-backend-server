import React, { useState } from 'react';

const App = () => {
    const [files, setFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('http://localhost:8086/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Files uploaded successfully');
                fetchUploadedFiles();
            } else {
                alert('Failed to upload files');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
        }

        setShowPopup(true);
    };

    const fetchUploadedFiles = async () => {
        try {
            const response = await fetch('http://localhost:8086/list_files');
            const files = await response.json();
            setUploadedFiles(files);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    return (
        <div>
            <input type="file" multiple onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload Files</button>

            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Uploaded Files</h3>
                        <ul>
                            {uploadedFiles.map((file, index) => (
                                <li key={index}>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                        {file.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowPopup(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
