import React, { useState } from 'react';
import axios from 'axios';

function UploadForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileInput = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', selectedFile);
      console.log(selectedFile)
    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus(`File uploaded successfully: ${response.data}`);
    } catch (error) {
      console.log(error);
      setUploadStatus('Error uploading file.');
    }
  };

  return (
    <div>
      <h1>Upload a Video to S3 Bucket</h1>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileInput} />
        <button type="submit">Upload</button>
      </form>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
}

export default UploadForm