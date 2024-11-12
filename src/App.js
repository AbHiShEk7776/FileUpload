import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';        // Ensure this path is correct
import Register from './components/Register';  // Ensure this path is correct
import ContactList from './components/ContactList'; // Ensure this path is correct
import FileUpload from './components/FileUpload'; // Ensure this path is correct
import FileDownload from './components/FileDownload'; // Ensure this path is correct
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
function App() {
  return (
   
    <Router>
      <Navbar />
       <AuthProvider>
      
        <Routes>
          <Route path="/" element={<Register />} /> {/* Register page as default */}
          <Route path="/login" element={<Login />} /> {/* Login page */}
          <Route path="/contacts" element={<ProtectedRoute element={<ContactList />} />} />
          <Route path="/upload" element={<ProtectedRoute element={<FileUpload />} />} />
          <Route path="/download" element={<ProtectedRoute element={<FileDownload />} />} />
        </Routes>
      
      </AuthProvider>
    </Router>
    
  );
}

export default App;
