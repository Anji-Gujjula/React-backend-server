import React, { useState, useEffect } from 'react';

const App = () => {
    const [files, setFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8086');
        setWs(socket);

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'file_list') {
                setUploadedFiles(message.files);
            } else if (message.type === 'file_download') {
                const fileBlob = new Blob([new Uint8Array(message.data)]);
                const fileUrl = URL.createObjectURL(fileBlob);

                // Create a link element and trigger download
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = message.name;
                link.click();

                // Clean up URL object
                URL.revokeObjectURL(fileUrl);
            }
        };

        return () => socket.close();
    }, []);

    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };

    const handleUpload = () => {
        if (!ws) return;

        // Request the list of uploaded files when the popup is triggered
        ws.send(JSON.stringify({ type: 'list_files' }));
        setShowPopup(true);
    };

    const handleDownload = (filename) => {
        if (!ws) return;
    
        ws.send(JSON.stringify({ type: 'download', name: filename }));
    };
    
    const handleSave = () => {
        if (!ws || files.length === 0) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const fileData = reader.result;
                ws.send(JSON.stringify({
                    type: 'upload',
                    name: file.name,
                    data: Array.from(new Uint8Array(fileData))
                }));
            };
            reader.readAsArrayBuffer(file);
        });

        // Clear file input and close popup after saving
        setFiles([]);
        setShowPopup(false);
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
                                    <button onClick={() => handleDownload(file.name)}>Download</button>
                                </li>
                            ))}
                        </ul>
                        <button onClick={handleSave}>Save Files</button>
                        <button onClick={() => setShowPopup(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
