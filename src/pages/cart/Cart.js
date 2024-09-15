import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTrash, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import CheckoutProgress from '../../utils/progressbar/CheckoutProgress';
import './Cart.css';

// Lazy loaded components
const Popup = lazy(() => import('../../utils/alert/Popup'));
const Recommendations = lazy(() => import('../../components/recommendations/Recommendations'));  // Product recommendation component

const Cart = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const cartItems = useSelector(state => state.cart.cartItems) || [];
  const isLoading = useSelector(state => state.cart.isLoading);
  const navigate = useNavigate();
  const [showPopUp, setShowPopUp] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');

  // Lazy-load Redux actions
  const lazyLoadActions = async () => {
    const { fetchCart, removeFromCart, updateCartItem } = await import('../../redux/actions/cartActions');
    return { fetchCart, removeFromCart, updateCartItem };
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); // Redirect to login if not authenticated when trying to access cart
    } else {
      lazyLoadActions().then(actions => {
        dispatch(actions.fetchCart());
      });
    }
  }, [dispatch, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
        <p>Almost there... prepping your awesome cart!</p>
      </div>
    );
  }

  // Calculate total amount, savings, and discount percentage
  const totalAmount = cartItems.reduce((sum, item) => {
    if (item.productId && item.productId.discountPrice) {
      return sum + item.productId.discountPrice * item.quantity;
    }
    return sum + item.productId.price * item.quantity;
  }, 0);

  const totalSavings = cartItems.reduce((sum, item) => {
    if (item.productId && item.productId.price && item.productId.discountPrice) {
      return sum + (item.productId.price - item.productId.discountPrice) * item.quantity;
    }
    return sum;
  }, 0);

  const originalTotal = cartItems.reduce((sum, item) => {
    return sum + item.productId.price * item.quantity;
  }, 0);

  const totalDiscountPercentage = Math.round((totalSavings / originalTotal) * 100);

  // Handle moving to the address page
  const handleProceedToAddress = () => {
    if (cartItems.length === 0) {
      setPopupMessage("Your cart is empty! Please add some items before proceeding.");
      setShowPopUp(true);
    } else {
      navigate('/addresses');
    }
  };

  const handleUpdateCartItem = async (productId, quantity) => {
    const actions = await lazyLoadActions();
    dispatch(actions.updateCartItem(productId, quantity));
  };

  const handleRemoveFromCart = async (productId) => {
    const actions = await lazyLoadActions();
    dispatch(actions.removeFromCart(productId));
  };

  const handleSaveForLater = async (productId) => {
    const actions = await lazyLoadActions();
    dispatch(actions.saveForLater(productId));
  };

  // const calculateEstimatedDelivery = (address) => {
  //   // Dummy logic for estimated delivery calculation (can be API-driven)
  //   return address ? `3-5 business days` : `Select address for delivery estimate`;
  // };

  if (cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Çart - Ħimalayan R̥asa</title>
        </Helmet>
        <div className="cart-empty">
          <h2>YOUR CART IS EMPTY</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shops" className="btn btn-shop">Go Shopping</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Çart - Ħimalayan R̥asa</title>
      </Helmet>

      {/* Integrating CheckoutProgress Component */}
      <CheckoutProgress currentStep={1} />

      <div className="cart-page">
        <h2>YOUR SHOPPING CART</h2>

        {/* Real-Time Stock Status */}
        <div className="cart-items">
          {cartItems.map((item, index) => (
            <div className="cart-item" key={index}>
              {item.productId && (
                <>
                  <Link to={`/products/product/${item.productId._id}`} className='link-decoration-common'>
                    <img src={item.productId.images[0]} alt={item.productId.name} className="cart-item-image" />
                  </Link>
                  <div className="cart-item-details">
                    <div className="cart-item-info">
                      <Link to={`/products/product/${item.productId._id}`} className='link-decoration-common'>
                        <h3>{item.productId.name}</h3>
                      </Link>
                      <p className="cart-product-price">
                        {item.productId.discountPrice ? (
                          <>
                            <span className="cart-product-original-price">₹{item.productId.price}</span>
                            <span className="cart-product-discount-price">₹{item.productId.discountPrice}</span>
                            <span className="cart-product-discount-percentage">
                              ({Math.round(((item.productId.price - item.productId.discountPrice) / item.productId.price) * 100)}% off)
                            </span>
                          </>
                        ) : (
                          `₹${item.productId.price}`
                        )}
                      </p>

                      <p>
                        <span className="cart-product-savings">
                          💰 Jackpot! You will save a whopping ₹{Math.round(item.productId.price - item.productId.discountPrice)} on this product. Treat yourself!
                        </span>
                      </p>

                      <p className={`stock-status ${item.productId.stock > 5 ? 'in-stock' : ''} ${item.productId.stock === 0 ? 'out-of-stock' : ''} ${item.productId.stock < 5 && item.productId.stock > 0 ? 'low-stock' : ''}`}>
                        {item.productId.stock > 0 
                          ? item.productId.stock < 5 
                            ? `Only ${item.productId.stock} left!` 
                            : `In stock: ${item.productId.stock}` 
                          : 'Out of stock'}
                      </p>
                      {/* 
                          <p className="delivery-time">
                            Estimated Delivery: {calculateEstimatedDelivery(selectedAddress)}
                          </p> */}
                    </div>

                    <div className='cart-item-all-buttons'>
                      <button className="remove-button" onClick={() => handleRemoveFromCart(item.productId._id)}>
                        <FontAwesomeIcon icon={faTrash} className="icon-margin" /> Remove
                      </button>
                      <div className="cart-item-controls">
                        <button
                          onClick={() => handleUpdateCartItem(item.productId._id, item.quantity - 1)}
                          disabled={item.quantity === 1}
                          className={item.quantity === 1 ? 'disabled-button' : ''}
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button onClick={() => handleUpdateCartItem(item.productId._id, item.quantity + 1)}>+</button>
                      </div>
                      {/* <button className="save-for-later-button" onClick={() => handleSaveForLater(item.productId._id)}>
                        Save for Later
                      </button> */}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Total amount and savings */}
        <div className="cart-total">
          <p className="total-discount-details">
            🎉 Yayy! You just pocketed ₹{totalSavings.toFixed(2)} in savings! That's a massive {totalDiscountPercentage}% off on your entire cart! Time to celebrate!
          </p>
          <h3 id='cart-total-amount'>TOTAL AMOUNT: ₹{(totalAmount).toFixed(2)}</h3>
        </div>

        <button className="buy-button" onClick={handleProceedToAddress}>
          <FontAwesomeIcon icon={faMapMarkerAlt} /> Proceed to Address
        </button>

        {/* Product Recommendations */}
        <Suspense fallback={<div>Loading product recommendations...</div>}>
          <Recommendations cartItems={cartItems} />
        </Suspense>
      </div>

      {/* Popup for alert messages */}
      {showPopUp && (
        <Suspense fallback={<div>Loading popup...</div>}>
          <Popup
            message={popupMessage}
            onClose={() => setShowPopUp(false)}
          />
        </Suspense>
      )}
    </>
  );
};

export default Cart;
