import React, { useState, useEffect, useRef, lazy } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; // For navigation
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faMapMarkerAlt, faEdit, faTrash, faCheckCircle, faCircle, faSpinner, faShoppingCart, faCreditCard, faHome } from '@fortawesome/free-solid-svg-icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import CheckoutProgress from '../../utils/progressbar/CheckoutProgress';
import api from '../../services/api';
import './AddressManager.css';

const Popup = lazy(() => import('../../utils/alert/Popup'));  // Import the Popup component

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
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
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [errors, setErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState('');  // For displaying the popup message
  const [showPopup, setShowPopup] = useState(false);     // For controlling popup visibility
  const inputRefs = useRef({});
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector(state => state.cart.cartItems) || [];

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
      setPopupMessage('⚠️ Uh-oh! We had trouble fetching your addresses. Please try again. 🏠🔄');
      setShowPopup(true);  // Show the popup when an error occurs
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

    setLoadingSubmit(true);
    try {
      const submitData = { ...form, phoneNumber: fullPhoneNumber };
      if (form._id) {
        await api.put(`/users/addresses/${form._id}`, submitData);
        setPopupMessage('🎉 Woohoo! Your address was updated successfully! 🏡✨');
      } else {
        await api.post('/users/addresses', submitData);
        setPopupMessage('🏡 Hooray! Your new address has been added successfully! 📍🎉');
      }
      setShowPopup(true);  // Show success popup
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
      setPopupMessage('⚠️ Uh-oh! Something went wrong while adding or updating the address. Please try again! 🏡');
      setShowPopup(true);
      console.error('Error adding or updating address', error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      setAddresses(addresses.filter((addr) => addr._id !== id));
      if (selectedAddress?._id === id) {
        setSelectedAddress(null);
      }
      setPopupMessage('🏡✨ Poof! Address deleted successfully! It’s gone like magic! 🎩');
      setShowPopup(true);  // Show success popup
    } catch (error) {
      setPopupMessage('🚫 Oops! Couldn’t delete the address. Something went wrong, try again! 🙁');
      setShowPopup(true);
      console.error('Error deleting address:', error);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoadingCurrentLocation(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
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
            setPopupMessage('📍 Got it! Your current location has been fetched successfully! 🌍');
            setShowPopup(true);  // Show success popup
          } catch (error) {
            setPopupMessage('⚠️ Oops! We couldn’t fetch your current location. Please try again. 🌐');
            setShowPopup(true);
            console.error('Error fetching address from API:', error);
          } finally {
            setLoadingCurrentLocation(false);  // Always executed after API call
          }
        },
        (error) => {
          setPopupMessage('🚫 Geolocation error! Unable to pinpoint your location. Please try again. 🌍');
          setShowPopup(true);
          console.error('Geolocation error:', error);
          setLoadingCurrentLocation(false); // Make sure to stop the loading even on error
        }
      );
    } else {
      setPopupMessage('🚫 Oops! Geolocation isn’t supported by this browser. Time for an upgrade? 🌍✨');
      setShowPopup(true);
      setLoadingCurrentLocation(false);  // Make sure to stop loading if geolocation isn't supported
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

  const handleSelectAddress = (addr, type) => {
    if (type === 'shipping') {
      if (selectedShippingAddress?._id === addr._id) {
        setSelectedShippingAddress(null);
      } else {
        setSelectedShippingAddress(addr);
      }
    } else if (type === 'billing') {
      if (selectedBillingAddress?._id === addr._id) {
        setSelectedBillingAddress(null);
      } else {
        setSelectedBillingAddress(addr);
      }
    }
  };  

  // Calculate total amount, savings, and discount percentage
  const totalAmount = cartItems.reduce((sum, item) => {
    if (item.productId && item.productId.discountPrice) {
      return sum + item.productId.discountPrice * item.quantity;
    }
    return sum + item.productId.price * item.quantity;
  }, 0);

  const handleProceedToPayment = () => {
    if (!selectedShippingAddress && !selectedBillingAddress) {
      setPopupMessage('📍 Hold on! You need to pick both a shipping and billing address before we move ahead! 🏠✨');
      setShowPopup(true);
    } else if (!selectedShippingAddress) {
      setPopupMessage('📦 Please select a shipping address to proceed. 🚚✨');
      setShowPopup(true);
    } else if (!selectedBillingAddress) {
      setPopupMessage('🧾 Please select a billing address to proceed. 💳✨');
      setShowPopup(true);
    } else {
      navigate('/checkout', {
        state: {
          selectedShippingAddress,
          selectedBillingAddress,
          totalAmount,
          cartItems
        }
      });
    }
  };  

  const handleBackToCart = () => {
    navigate('/cart'); // Navigate back to the cart
  };

  return (
    <>
      {/* Integrating CheckoutProgress Component */}
      <CheckoutProgress currentStep={2} />
      <div className="address-manager">

        {/* Render Popup only when showPopup is true */}
        {showPopup && (
          <Popup
            message={popupMessage}
            onClose={() => setShowPopup(false)}
          />
        )}

        <h2>Manage Delivery Addresses</h2>

        {/* Address Form */}
        <form id="address-form" onSubmit={handleSubmit} className="address-form" noValidate>

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
            placeholder="Flat Number / House Number"
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

          <div className='location-add-address-buttons-div'>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="location-button"
              disabled={loadingCurrentLocation}
            >
              {loadingCurrentLocation ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Fetching, Please wait...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> Use Current Location
                </>
              )}
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loadingSubmit}
            >
              {loadingSubmit ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> {form._id ? 'Updating' : 'Saving'} Address...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} /> {form._id ? 'Update' : 'Add'} Address
                </>
              )}
            </button>
          </div>

        </form>

        {/* Modern Card-Style Address List */}
        <div className="address-list-modern">
          {addresses.map((addr) => (
            <div key={addr._id} className={`address-card ${selectedShippingAddress?._id === addr._id || selectedBillingAddress?._id === addr._id ? 'selected' : ''}`}>
              <div className="address-details">
                <strong>{addr.label}</strong>
                <p>{addr.firstName} {addr.lastName}, {addr.flat}, {addr.street}, {addr.city}, {addr.state}, {addr.zip}, {addr.country}</p>
                <p>Phone: {addr.phoneNumber}</p>
                {selectedBillingAddress?._id === addr._id && <p><FontAwesomeIcon icon={faCreditCard} /> Billing Address</p>}
                {selectedShippingAddress?._id === addr._id && <p><FontAwesomeIcon icon={faHome} /> Shipping Address</p>}
              </div>
              <div className="address-actions">
                <button onClick={() => handleEdit(addr)}>
                  <FontAwesomeIcon icon={faEdit} className="icon-margin" /> Edit
                </button>
                <button onClick={() => handleDeleteAddress(addr._id)}>
                  <FontAwesomeIcon icon={faTrash} className="icon-margin" /> Delete
                </button>
                <button
                  onClick={() => handleSelectAddress(addr, 'shipping')}
                  className={selectedShippingAddress?._id === addr._id ? 'selected' : ''}
                >
                  <FontAwesomeIcon
                    icon={selectedShippingAddress?._id === addr._id ? faCheckCircle : faCircle}
                  /> Shipping
                </button>

                <button
                  onClick={() => handleSelectAddress(addr, 'billing')}
                  className={selectedBillingAddress?._id === addr._id ? 'selected' : ''}
                >
                  <FontAwesomeIcon
                    icon={selectedBillingAddress?._id === addr._id ? faCheckCircle : faCircle}
                  /> Billing
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="address-navigation-buttons">
          <button className="address-page-back-button" onClick={handleBackToCart}>
            <FontAwesomeIcon icon={faShoppingCart} className="icon-margin" />
            Back to Cart
          </button>

          <button className="address-page-next-button" onClick={handleProceedToPayment}>
            <FontAwesomeIcon icon={faCreditCard} className="icon-margin" />
            Proceed to Payment
          </button>
        </div>
      </div>
    </>
  );
};

export default AddressManager;
