import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import axios from 'axios';
import './AddressManager.css';

const AddressManager = ({ onSelectAddress }) => {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ label: '', flat: '', street: '', city: '', state: '', zip: '', country: '', isDefault: false });
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form._id) {
        await api.put(`/users/addresses/${form._id}`, form);
      } else {
        await api.post('/users/addresses', form);
      }
      setForm({ label: '', flat: '', street: '', city: '', state: '', zip: '', country: '', isDefault: false });
      fetchAddresses();
    } catch (error) {
      console.error('Error adding or updating address:', error);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      setAddresses(addresses.filter((addr) => addr._id !== id));
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const address = response.data.address;
          setForm({
            label: '',
            flat: '',
            street: address.road || address.street || address.residential || '',
            city: address.city || address.state_district || address.town || '',
            state: address.state || '',
            zip: address.postcode || '',
            country: address.country || '',
            isDefault: false
          });
        } catch (error) {
          console.error('Error fetching current location:', error);
        }
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    onSelectAddress(addr);
  };

  return (
    <div className="address-manager">
      <h2>Manage Delivery Addresses</h2>
      <form onSubmit={handleSubmit} className="address-form">
        <input type="text" name="label" value={form.label} onChange={handleChange} placeholder="Label (e.g., Home, Work)" required />
        <input type="text" name="flat" value={form.flat} onChange={handleChange} placeholder="Flat" required />
        <input type="text" name="street" value={form.street} onChange={handleChange} placeholder="Street" required />
        <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="City" required />
        <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="State" required />
        <input type="text" name="zip" value={form.zip} onChange={handleChange} placeholder="Zip Code" required />
        <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="Country" required />
        <label>
          <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
          Set as Default
        </label>
        <button type="button" onClick={handleUseCurrentLocation}>Use Current Location</button>
        <button type="submit">{form._id ? 'Update' : 'Add'} Address</button>
      </form>
      <ul className="address-list">
        {addresses.map((addr) => (
          <li key={addr._id} className={selectedAddress?._id === addr._id ? 'selected' : ''}>
            <span>{addr.label}: {addr.flat}, {addr.street}, {addr.city}, {addr.state}, {addr.zip}, {addr.country}</span>
            <div className="address-actions">
              <button onClick={() => setForm(addr)}>Edit</button>
              <button onClick={() => handleDeleteAddress(addr._id)}>Delete</button>
              <button onClick={() => handleSelectAddress(addr)}>{selectedAddress ? 'Selected' : 'Select'}</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddressManager;
