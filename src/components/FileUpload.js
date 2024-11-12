// FileUpload.js
import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear message on new submission

    if (!file) {
      setMessage('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file); // Ensure 'csvFile' matches the Multer field name

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/contacts/import', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Contacts imported successfully');
      console.log(response.data);
    } catch (error) {
      // Log the detailed error response for debugging
      if (error.response && error.response.data) {
        console.error('Error details:', error.response.data);
      }
      setMessage('Error importing contacts');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg shadow-md">
      <h1 className="text-3xl text-teal-600 text-center mb-6">Import Contacts</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mb-4 p-2 border border-teal-300 rounded-md"
        />
        <button type="submit" className="bg-teal-500 text-white p-2 rounded-md hover:bg-teal-600 transition duration-200">
          Upload
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default FileUpload;
