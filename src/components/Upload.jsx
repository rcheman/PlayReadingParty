import React, { useState } from 'react';

const Upload = ({ setCurrentScript, titles, setTitles }) => {
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

  const handleUploadClick = (e) => {
    e.preventDefault()
    if (!file) {
      return;
    }

    // set the file as Form Data and send it to the server
    const formData = new FormData();
    formData.append('scriptFormField', file);

    fetch('/script', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.status === 409) {
          throw new Error('Script title already exists');
        }
        if (response.status === 452) {
          throw new Error('Could not find a title, potentially invalid file type');
        }
        if (response.status === 500) {
          throw new Error(
            "File was not uploaded. Make sure the file name doesn't start with an underscore and only uses numbers, letters, and these symbols: ' . _ - "
          );
        }
        return response.json();
      })
      .then((script) => {
        // set the current script to the newly uploaded script
        setCurrentScript(script.id);
        setTitles([...titles, script]);
        // reset error message
        setUploadMessage({ message: 'Successfully Uploaded', error: false });
        setFile(null);
        e.target.reset()
      })
      .catch((err) => {
        setUploadMessage({ message: err.message, error: true });
      });
  };

  return (
    <div>
      <h3>Upload a new script</h3>
      <form onSubmit={handleUploadClick}>
        <input type="file" accept=".txt,*" onChange={handleFileChange} />
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
