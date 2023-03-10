import React, { useState } from 'react';

const Upload = ({ setCurrentScript, titles, setTitles }) => {
  const MAXFILESIZE = 50 * 1024 * 1024; // 50MB
  const [file, setFile] = useState();
  const [errMessage, setErrMessage] = useState({ message: '', display: 'none', color: 'red' });

  const handleFileChange = (e) => {
    e.preventDefault();
    // check that the file size is less than 50 before allowing the upload
    if (e.target.files) {
      if (e.target.files[0].size > MAXFILESIZE) {
        setErrMessage({ message: 'Selected file is too large. Max size is 50MB', display: 'block', color: 'red' });
        setFile(null);
      } else {
        setFile(e.target.files[0]);
        setErrMessage({ message: '', display: 'none' });
      }
    }
  };

  const handleUploadClick = () => {
    if (!file) {
      return;
    }

    // set the file as Form Data and send it to the server
    const formData = new FormData();
    formData.append('newScript', file);

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
        if (title) {
          // set the current script to the newly uploaded script
          setCurrentScript(title);
          setTitles([...titles, title]);
          // reset error message
          setErrMessage({ message: 'Successfully Uploaded', display: 'block', color: 'black' });
          setFile(null);
        }
      })
      .catch((err) => {
        if (err.message === 'script already exists') {
          setErrMessage({ message: 'That script title already exists.', display: 'block', color: 'red' });
        } else {
          setErrMessage({ message: 'File was not uploaded. Try again.', display: 'block', color: 'red' });
          console.error(`error: ${err} when uploading script`);
        }
      });
  };

  return (
    <div>
      <input type="file" accept=".txt,*" onChange={handleFileChange} />
      <p> {file && `${file.name} - ${file.type}`} </p>
      <button onClick={handleUploadClick}>Upload</button>
      <p style={{ display: errMessage.display, color: errMessage.color }}>{errMessage.message}</p>
    </div>
  );
};

export default Upload;
