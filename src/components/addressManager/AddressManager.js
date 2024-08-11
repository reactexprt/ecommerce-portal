import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './AddressManager.css';

const AddressManager = ({ onSelectAddress }) => {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({
    label: '',
    firstName: '',
    lastName: '',
    flat: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    countryCode: 'in', // Default country code
    phoneNumber: '',
    isDefault: false
  });
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});

  useEffect(() => {
    fetchAddresses();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!form.label) newErrors.label = 'Label is required';
    if (!form.firstName) newErrors.firstName = 'First Name is required';
    if (!form.lastName) newErrors.lastName = 'Last Name is required';
    if (!form.flat) newErrors.flat = 'Flat is required';
    if (!form.street) newErrors.street = 'Street is required';
    if (!form.city) newErrors.city = 'City is required';
    if (!form.state) newErrors.state = 'State is required';
    if (!form.zip) newErrors.zip = 'Zip Code is required';
    if (!form.country) newErrors.country = 'Country is required';

    if (form.phoneNumber) {
      let formattedPhoneNumber = form.phoneNumber;
      if (!formattedPhoneNumber.startsWith('+')) {
        formattedPhoneNumber = `+${formattedPhoneNumber}`;
      }
      const match = formattedPhoneNumber.match(/^\+(\d{1,3})(\d{10})$/);
      if (match) {
        const localPhoneNumber = match[2];
        if (localPhoneNumber.length !== 10) {
          newErrors.phoneNumber = 'Phone number must be exactly 10 digits long';
        }
      } else {
        newErrors.phoneNumber = 'Phone number must include a valid country code and 10-digit local number';
      }
    } else {
      newErrors.phoneNumber = 'Phone number is required';
    }

    setErrors(newErrors);

    // Focus on the first error field and ensure it scrolls into view
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const inputField = inputRefs.current[firstErrorField];

      if (inputField) {
        inputField.focus({ preventScroll: true });
        inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

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
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhoneNumberChange = (value) => {
    setForm((prevForm) => ({
      ...prevForm,
      phoneNumber: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    let fullPhoneNumber = form.phoneNumber;
    const numericCountryCode = form.countryCode.replace(/^\D+/g, '');
    if (!fullPhoneNumber.startsWith('+')) {
      fullPhoneNumber = `+${numericCountryCode}${form.phoneNumber}`;
    }

    try {
      const submitData = { ...form, phoneNumber: fullPhoneNumber };
      if (form._id) {
        await api.put(`/users/addresses/${form._id}`, submitData);
      } else {
        await api.post('/users/addresses', submitData);
      }
      setForm({
        label: '',
        firstName: '',
        lastName: '',
        flat: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        countryCode: 'in',
        phoneNumber: '',
        isDefault: false
      });
      setErrors({});
      fetchAddresses();
    } catch (error) {
      console.error('Error adding or updating address');
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
            label: form.label || '',
            firstName: form.firstName || '',
            lastName: form.lastName || '',
            flat: form.flat || '',
            street: address.road || address.street || address.residential || '',
            city: address.city || address.state_district || address.town || '',
            state: address.state || '',
            zip: address.postcode || '',
            country: address.country || '',
            countryCode: 'in',
            phoneNumber: form.phoneNumber,
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

  const handleEdit = (address) => {
    const fullPhoneNumber = address.phoneNumber;
    setForm({
      ...address,
      phoneNumber: fullPhoneNumber,
      countryCode: ''
    });
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    onSelectAddress(addr);
  };

  return (
    <div className="address-manager">
      <h2>Manage Delivery Addresses</h2>
      <form onSubmit={handleSubmit} className="address-form">

        <input
          type="text"
          name="label"
          value={form.label}
          onChange={handleChange}
          placeholder="Label (e.g., Home, Work)"
          className={errors.label ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.label = el)}
          required
        />
        {errors.label && <span className="error-message">{errors.label}</span>}

        <input
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className={errors.firstName ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.firstName = el)}
          required
        />
        {errors.firstName && <span className="error-message">{errors.firstName}</span>}

        <input
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className={errors.lastName ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.lastName = el)}
          required
        />
        {errors.lastName && <span className="error-message">{errors.lastName}</span>}

        <input
          type="text"
          name="flat"
          value={form.flat}
          onChange={handleChange}
          placeholder="Flat"
          className={errors.flat ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.flat = el)}
          required
        />
        {errors.flat && <span className="error-message">{errors.flat}</span>}

        <input
          type="text"
          name="street"
          value={form.street}
          onChange={handleChange}
          placeholder="Street"
          className={errors.street ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.street = el)}
          required
        />
        {errors.street && <span className="error-message">{errors.street}</span>}

        <input
          type="text"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="City"
          className={errors.city ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.city = el)}
          required
        />
        {errors.city && <span className="error-message">{errors.city}</span>}

        <input
          type="text"
          name="state"
          value={form.state}
          onChange={handleChange}
          placeholder="State"
          className={errors.state ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.state = el)}
          required
        />
        {errors.state && <span className="error-message">{errors.state}</span>}

        <input
          type="text"
          name="zip"
          value={form.zip}
          onChange={handleChange}
          placeholder="Zip Code"
          className={errors.zip ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.zip = el)}
          required
        />
        {errors.zip && <span className="error-message">{errors.zip}</span>}

        <input
          type="text"
          name="country"
          value={form.country}
          onChange={handleChange}
          placeholder="Country"
          className={errors.country ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.country = el)}
          required
        />
        {errors.country && <span className="error-message">{errors.country}</span>}

        <div className="phone-input-container">
          <PhoneInput
            country={form.countryCode || 'in'}
            value={form.phoneNumber}
            onChange={handlePhoneNumberChange}
            inputStyle={{ width: 'calc(100% - 50px)', height: '40px', backgroundColor: '#e9d9c9' }}
            containerStyle={{ marginBottom: '15px' }}
            placeholder="Phone Number"
            inputRef={(el) => (inputRefs.current.phoneNumber = el)}
          />
          {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
        </div>

        <label className="checkbox-label">
          <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
          Set as Default
        </label>
        <button type="button" onClick={handleUseCurrentLocation} className="location-button">
          Use Current Location
        </button>
        <button type="submit" className="submit-button">
          {form._id ? 'Update' : 'Add'} Address
        </button>
      </form>
      <ul className="address-list">
        {addresses.map((addr) => (
          <li key={addr._id} className={selectedAddress?._id === addr._id ? 'selected' : ''}>
            <span>
              <strong>{addr.label}</strong>: {addr.firstName} {addr.lastName}, {addr.flat}, {addr.street}, {addr.city}, {addr.state}, {addr.zip}, {addr.country}, {addr.phoneNumber}
            </span>
            <div className="address-actions">
              <button onClick={() => handleEdit(addr)}>Edit</button>
              <button onClick={() => handleDeleteAddress(addr._id)}>Delete</button>
              <button onClick={() => handleSelectAddress(addr)}>
                {selectedAddress?._id === addr._id ? 'Selected' : 'Select'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddressManager;
