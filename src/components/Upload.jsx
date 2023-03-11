import React, { useState } from 'react';

const Upload = ({ setCurrentScript, titles, setTitles }) => {
  const MAX_FILESIZE_BYTES = 50 * 1024 * 1024; // 50MB If updating, change constant in scriptController.js too
  const [file, setFile] = useState();
  const [uploadMessage, setUploadMessage] = useState({ message: '', error: false });

  const handleFileChange = (e) => {
    e.preventDefault();
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

  const handleUploadClick = () => {
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
          throw new Error('script already exists');
        }
        return response.json();
      })
      .then((title) => {
        // set the current script to the newly uploaded script
        setCurrentScript(title);
        setTitles([...titles, title]);
        // reset error message
        setUploadMessage({ message: 'Successfully Uploaded', error: false });
        setFile(null);
      })
      .catch((err) => {
        if (err.message === 'script already exists') {
          setUploadMessage({ message: 'That script title already exists.', error: true });
        } else {
          setUploadMessage({ message: 'File was not uploaded. Try again.', error: true });
          console.error(`error: ${err} when uploading script`);
        }
      });
  };

  return (
    <div>
      <input type="file" accept=".txt,*" onChange={handleFileChange} />
      <p> {file && `${file.name} - ${file.type}`} </p>
      <button onClick={handleUploadClick}>Upload</button>
      {uploadMessage.message.length > 0 && (
        <div style={uploadMessage.error === true ? { color: 'red' } : { color: 'black' }}>{uploadMessage.message}</div>
      )}
    </div>
  );
};

export default Upload;
