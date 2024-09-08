import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheck, faMapMarkerAlt, faEdit, faTrash, faCheckCircle, faCircle } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../components/addressManager/AddressManager.css';

const AddressBook = ({ onSelectAddress }) => {
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
    countryCode: 'in',
    phoneNumber: '',
    isDefault: false
  });
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef({});

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
    setLoading(false);
  };

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

  if (loading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
        <p>Hang tight... we’re fetching your addresses!</p>
      </div>
    );
  }

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
      if (selectedAddress?._id === id) {
        setSelectedAddress(null); // Unselect if the selected address is deleted
        onSelectAddress(null);
      }
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

  return (
    <div className="address-manager">
      <h2>Manage Delivery Addresses</h2>
      <ul className="address-list">
        {addresses.map((addr) => (
          <li key={addr._id} className={selectedAddress?._id === addr._id ? 'selected' : ''}>
            <span>
              <strong>{addr.label}</strong>: {addr.firstName} {addr.lastName}, {addr.flat}, {addr.street}, {addr.city}, {addr.state}, {addr.zip}, {addr.country}, {addr.phoneNumber}
            </span>
            <div className="address-actions">
              {/* Edit Button with Icon */}
              <button onClick={() => handleEdit(addr)} className="edit-button">
                <FontAwesomeIcon icon={faEdit} className="icon-margin" /> Edit
              </button>
              {/* Delete Button with Icon */}
              <button onClick={() => handleDeleteAddress(addr._id)} className="delete-button">
                <FontAwesomeIcon icon={faTrash} className="icon-margin" /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form id="address-form" onSubmit={handleSubmit} className="address-form">
        {/* Form Fields */}
        <input
          type="text"
          id="label"
          name="label"
          value={form.label}
          onChange={handleChange}
          placeholder="Label (e.g., Home, Work)"
          className={errors.label ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.label = el)}
          required
          autoComplete="off"
        />
        {errors.label && <span className="error-message">{errors.label}</span>}

        {/* Remaining Input Fields... */}
        <input
          type="text"
          name="firstName"
          id="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className={errors.firstName ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.firstName = el)}
          required
          autoComplete="given-name"
        />
        {errors.firstName && <span className="error-message">{errors.firstName}</span>}

        <input
          type="text"
          id="lastName"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className={errors.lastName ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.lastName = el)}
          required
          autoComplete="family-name"
        />
        {errors.lastName && <span className="error-message">{errors.lastName}</span>}

        <input
          type="text"
          id="flat"
          name="flat"
          value={form.flat}
          onChange={handleChange}
          placeholder="Flat"
          className={errors.flat ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.flat = el)}
          required
          autoComplete="address-line1"
        />
        {errors.flat && <span className="error-message">{errors.flat}</span>}

        <input
          type="text"
          id="street"
          name="street"
          value={form.street}
          onChange={handleChange}
          placeholder="Street"
          className={errors.street ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.street = el)}
          required
          autoComplete="address-line2"
        />
        {errors.street && <span className="error-message">{errors.street}</span>}

        <input
          type="text"
          id="city"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="City"
          className={errors.city ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.city = el)}
          required
          autoComplete="address-level2"
        />
        {errors.city && <span className="error-message">{errors.city}</span>}

        <input
          type="text"
          id="state"
          name="state"
          value={form.state}
          onChange={handleChange}
          placeholder="State"
          className={errors.state ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.state = el)}
          required
          autoComplete="address-level1"
        />
        {errors.state && <span className="error-message">{errors.state}</span>}

        <input
          type="text"
          id="zip"
          name="zip"
          value={form.zip}
          onChange={handleChange}
          placeholder="Zip Code"
          className={errors.zip ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.zip = el)}
          required
          autoComplete="postal-code"
        />
        {errors.zip && <span className="error-message">{errors.zip}</span>}

        <input
          type="text"
          id="country"
          name="country"
          value={form.country}
          onChange={handleChange}
          placeholder="Country"
          className={errors.country ? 'input-error' : ''}
          ref={(el) => (inputRefs.current.country = el)}
          required
          autoComplete="country"
        />
        {errors.country && <span className="error-message">{errors.country}</span>}

        <div className="phone-input-container">
          <PhoneInput
            country={form.countryCode || 'in'}
            value={form.phoneNumber}
            onChange={handlePhoneNumberChange}
            // inputStyle={{  }}
            containerStyle={{ marginBottom: '15px' }}
            placeholder="Phone Number"
            inputRef={(el) => (inputRefs.current.phoneNumber = el)}
          />
          {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
        </div>

        <label className="checkbox-label">
          <input id="isDefault" type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
          Set as Default
        </label>
        {/* Use Current Location Button with Icon */}
        <button type="button" onClick={handleUseCurrentLocation} className="location-button">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="icon-margin" /> Use Current Location
        </button>
        {/* Add or Update Address Button with Icon */}
        <button type="submit" className="submit-button">
          {form._id ? (
            <>
              <FontAwesomeIcon icon={faEdit} className="icon-margin" /> Update Address
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} className="icon-margin" /> Add Address
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddressBook;
