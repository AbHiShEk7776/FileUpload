import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddContact from './AddContact';
import { Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [contactsPerPage] = useState(5);
  const debouncedSearchTerm = useDebounce(searchTerm, 300); 
  const [isEditing, setIsEditing] = useState(null);
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');
      console.log('Fetching contacts with token:', token);
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }
    
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
    
        if (decodedToken.exp < currentTime) {
          setError('Session expired. Please log in again.');
          sessionStorage.removeItem('token');
          return;
        }
        // 
        const { data } = await axios.get('http://localhost:5000/api/contacts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Contacts fetched successfully:', data);
        setContacts(data);
        setFilteredContacts(data);
      } catch (err) {
        if (err.response) {
          // Server responded with a status outside the 200 range
          if (err.response.status === 401) {
            setError('Unauthorized: Please log in again.');
          } else if (err.response.status === 403) {
            setError('Forbidden: You do not have permission to access this resource.');
          } else {
            setError('Failed to fetch contacts. Please try again later.');
          }
        } else if (err.request) {
          setError('No response from server. Please check your network connection.');
        } else {
          setError('An unexpected error occurred: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const deleteContact = async (id) => {
    const token =sessionStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/contacts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Add token to request headers
      },
    });
    setContacts(contacts.filter((contact) => contact.id !== id));
    setFilteredContacts(filteredContacts.filter((contact) => contact.id !== id));
  };

  const addContact = (newContact) => {
    setContacts((prevContacts) => [...prevContacts, newContact]); // Update the contact list with the new contact
    setFilteredContacts((prevContacts) => [...prevContacts, newContact]); 
  };
 
  useEffect(() => {
    const results = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        contact.phone.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        contact.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    setFilteredContacts(results);
    setCurrentPage(1); // Reset to the first page after search
  }, [debouncedSearchTerm, contacts]);
  const handleClear = () => {
    setSearchTerm('');
    setFilteredContacts(contacts); // Reset filtered contacts to show all contacts
  };

const editContact = async (id, updatedContact) => {
  const token = sessionStorage.getItem("token");
  try {
    const response = await axios.put(`http://localhost:5000/api/contacts/${id}`, updatedContact, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data); // Successful update message
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.id === id ? { ...contact, ...updatedContact } : contact
      )
    );
    setFilteredContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.id === id ? { ...contact, ...updatedContact } : contact
      )
    );
  } catch (err) {
    console.error("Error updating contact:", err);
  }
};
const [updatedContact, setUpdatedContact] = useState({
  name: "",
  phone: "",
  email: "",
  address: "",
});

// Handler to trigger the edit mode
const handleEdit = (contact) => {
  setIsEditing(contact.id);
  setUpdatedContact(contact);
};

// Form submission handler
const handleUpdateSubmit = (e) => {
  e.preventDefault();
  editContact(isEditing, updatedContact);
  setIsEditing(null); // Exit edit mode after submission
};
  // Pagination Logic
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div>Loading contacts...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg shadow-md">
      <h1 className="text-3xl text-teal-600 text-center mb-6">Contact List</h1>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search by name, email, phone, or address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-3 border border-teal-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
        />
        <button
          onClick={handleClear}
          className="bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition duration-200"
        >
          Clear
        </button>
      </div>
      
      <AddContact onContactAdded={addContact} /> {/* Include AddContact component */}

      {/* <ul className="mb-4">
        {currentContacts.map((contact) => (
          <li key={contact.id} className="flex justify-between items-center p-2 border-b border-teal-200">
            <span className="text-teal-800">
              {contact.name} - {contact.phone} - {contact.email} - {contact.address}
            </span>
            <button
              onClick={() => deleteContact(contact.id)}
              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-200"
            >
              Delete
            </button>
          </li>
        ))}
      </ul> */}
      <ul className="mb-4">
  {currentContacts.map((contact) => (
    <li key={contact.id} className="flex justify-between items-center p-2 border-b border-teal-200">
      {isEditing === contact.id ? (
        // Display form for editing the contact
        <form onSubmit={handleUpdateSubmit} className="flex-grow">
          <input
            type="text"
            value={updatedContact.name}
            onChange={(e) => setUpdatedContact({ ...updatedContact, name: e.target.value })}
            className="p-2 border border-teal-300 rounded"
            placeholder="Name"
          />
          <input
            type="text"
            value={updatedContact.phone}
            onChange={(e) => setUpdatedContact({ ...updatedContact, phone: e.target.value })}
            className="p-2 border border-teal-300 rounded"
            placeholder="Phone"
          />
          <input
            type="email"
            value={updatedContact.email}
            onChange={(e) => setUpdatedContact({ ...updatedContact, email: e.target.value })}
            className="p-2 border border-teal-300 rounded"
            placeholder="Email"
          />
          <input
            type="text"
            value={updatedContact.address}
            onChange={(e) => setUpdatedContact({ ...updatedContact, address: e.target.value })}
            className="p-2 border border-teal-300 rounded"
            placeholder="Address"
          />
          <button type="submit" className="bg-teal-500 text-white p-2 rounded-md hover:bg-teal-600">
            Save
          </button>
        </form>
      ) : (
        // Display contact details and buttons if not in edit mode
        <>
          <span className="text-teal-800">
            {contact.name} - {contact.phone} - {contact.email} - {contact.address}
          </span>
          <div>
            <button
              onClick={() => handleEdit(contact)}
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Edit
            </button>
            <button
              onClick={() => deleteContact(contact.id)}
              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-200 ml-2"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  ))}
</ul>

      {/* Pagination Controls */}
      <div className="flex justify-center mb-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            disabled={currentPage === index + 1}
            className={`mx-1 px-3 py-1 rounded-md transition duration-200 ${currentPage === index + 1 ? 'bg-teal-500 text-white' : 'bg-white text-teal-600 border border-teal-300 hover:bg-teal-200'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Navigation Buttons for Import and Export */}
      <div className="flex justify-center space-x-4">
        <Link to="/upload">
          <button className="bg-teal-500 text-white p-3 rounded-md hover:bg-teal-600 transition duration-200">
            Import Contacts
          </button>
        </Link>
        <Link to="/download">
          <button className="bg-teal-500 text-white p-3 rounded-md hover:bg-teal-600 transition duration-200">
            Export Contacts
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ContactList;
