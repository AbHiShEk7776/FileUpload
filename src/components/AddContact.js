// src/components/AddContact.js

import React, { useState } from 'react';
import axios from 'axios';

const AddContact = ({ onContactAdded }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/contacts', {
        name,
        phone,
        email,
        address,
      }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`, // Ensure the token is sent
        },
      });
      onContactAdded(response.data); // Call the addContact function passed as a prop
      // Reset form fields
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
};

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      <button type="submit">Add Contact</button>
    </form>
  );
};

export default AddContact;
