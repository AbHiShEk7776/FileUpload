import React, { useState } from 'react';
import axios from 'axios';

const FileDownload = () => {
  const [message, setMessage] = useState('');

  const handleDownload = async () => {
    setMessage(''); // Clear message on new attempt

    try {
      const token = sessionStorage.getItem('token');

      // Make a request to download the CSV file
      const response = await axios.get('http://localhost:5000/api/contacts/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob' // Important to handle binary data
      });

      // Create a downloadable link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts.csv'); // Set filename for download
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setMessage('File downloaded successfully');
    } catch (error) {
      if (error.response && error.response.data) {
        console.error('Error details:', error.response.data);
      }
      setMessage('Error downloading file');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg shadow-md">
      <h1 className="text-3xl text-teal-600 text-center mb-6">Download Contacts</h1>
      <div className="flex flex-col items-center">
        <button onClick={handleDownload} className="bg-teal-500 text-white p-2 rounded-md hover:bg-teal-600 transition duration-200">
          Download Contacts
        </button>
      </div>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default FileDownload;