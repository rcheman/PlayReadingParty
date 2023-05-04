import React, { useState } from 'react';
import { uploadScript } from './api';

const Upload = ({ setCurrentScript, scripts, setScripts }) => {
  const MAX_FILESIZE_BYTES = 50 * 1024 * 1024; // 50MB If updating, change constant in scriptController.js too
  const [file, setFile] = useState();
  const [uploadMessage, setUploadMessage] = useState({ message: '', error: false });

  const handleFileChange = (e) => {
    // check that the file size is less than 50 before allowing the upload
    if (e.target.files) {
      if (e.target.files[0].size > MAX_FILESIZE_BYTES) {
        setUploadMessage({ message: 'Selected file is too large. Max size is 50MB', error: true });
        setFile(null);
      } else {
        setFile(e.target.files[0]);
        setUploadMessage({ message: '', error: false });
      }
    }
  };

  const handleUploadClick = async (e) => {
    e.preventDefault();
    if (!file) {
      return;
    }
    // set the file as Form Data and send it to the server
    const formData = new FormData();
    formData.append('scriptFormField', file);

    // Upload the script and display any error messages
    const result = await uploadScript(formData);
    if (result.success) {
      setCurrentScript(result.data.id);
      setScripts([...scripts, result.data]);
      setUploadMessage({ message: 'Uploaded Successfully', error: false });
      setFile(null);
      e.target.reset();
    } else {
      setUploadMessage({ message: result.data, error: true })
    }
  };

  return (
    <div>
      <h3>Upload a new script</h3>
      <form onSubmit={handleUploadClick}>
        <input type='file' accept='.txt,*' onChange={handleFileChange} />
        <p> {file && `${file.name} - ${file.type}`} </p>
        <button type='submit'>Upload</button>
      </form>
      {uploadMessage.message.length > 0 && (
        <div style={uploadMessage.error === true ? { color: 'red' } : { color: 'black' }}>{uploadMessage.message}</div>
      )}
    </div>
  );
};

export default Upload;
