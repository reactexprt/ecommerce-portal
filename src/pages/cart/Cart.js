import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faShoppingCart, faTrash } from '@fortawesome/free-solid-svg-icons';
import './Cart.css';

// Lazy loaded components
const AddressManager = lazy(() => import('../../components/addressManager/AddressManager'));
const Popup = lazy(() => import('../../utils/alert/Popup'));

const Cart = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const cartItems = useSelector(state => state.cart.cartItems) || [];
  const isLoading = useSelector(state => state.cart.isLoading);
  const navigate = useNavigate();
  const [showPopUp, setShowPopUp] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

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
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
        <p>Almost there... prepping your awesome cart!</p>
      </div>
    );
  }


  const totalAmount = cartItems.reduce((sum, item) => {
    if (item.productId && item.productId.discountPrice) {
      return sum + item.productId.discountPrice * item.quantity;
    }
    return sum;
  }, 0);

  const handleOrderConfirm = () => {
    if (selectedAddress) {
      navigate('/checkout', {
        state: {
          selectedAddress,
          totalAmount,
          cartItems
        }
      });
    } else {
      setShowPopUp(true);
    }
  };

  // Function to calculate the discount percentage
  const calculateDiscountPercentage = product => {
    if (product && product.discountPrice && product.price) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return 0;
  };

  const handleUpdateCartItem = async (productId, quantity) => {
    const actions = await lazyLoadActions();
    dispatch(actions.updateCartItem(productId, quantity));
  };

  const handleRemoveFromCart = async (productId) => {
    const actions = await lazyLoadActions();
    dispatch(actions.removeFromCart(productId));
  };

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
      <div className="cart-page">
        <h2>YOUR SHOPPING CART</h2>
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
                              ({calculateDiscountPercentage(item.productId)}% off)
                            </span>
                          </>
                        ) : (
                          `₹${item.productId.price}`
                        )}
                      </p>
                    </div>
                    <div className='cart-item-all-buttons'>
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
                      <button className="remove-button" onClick={() => handleRemoveFromCart(item.productId._id)}>
                        <FontAwesomeIcon icon={faTrash} className="icon-margin" /> Remove
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="cart-total">
          <h3>TOTAL AMOUNT: ₹{(totalAmount).toFixed(2)}</h3>
        </div>
        {/* Suspense for lazy-loaded components */}
        <Suspense fallback={<div>Loading address manager...</div>}>
          <AddressManager onSelectAddress={setSelectedAddress} />
        </Suspense>
        <button
          className={`buy-button`}
          onClick={handleOrderConfirm}
          // disabled={!selectedAddress}
          title={!selectedAddress ? 'Please add and select an address before proceeding' : ''}
        >
          <FontAwesomeIcon icon={faShoppingCart} /> Checkout
        </button>
        {showPopUp && (
          <Suspense fallback={<div>Loading popup...</div>}>
            <Popup 
              message="Please add and select a delivery address before proceeding to Checkout page."
              onClose={() => setShowPopUp(false)}
            />
          </Suspense>
        )}
      </div>
    </>
  );
};

export default Cart;
