import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCartPlus, faCheck, faMinus, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Add icons
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Use dispatch to add to cart and get cart state
import { addToCart, removeFromCart, updateCartItem } from '../../redux/actions/cartActions'; // Add necessary cart actions
import api from '../../services/api';
import ImageSlider from '../../components/imageSlider/ImageSlider';
import './ProductsList.css';

const ProductsList = () => {
  const { shopId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(8);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems) || [];

  useEffect(() => {
    const fetchProducts = async () => {
      setProducts([]);
      setLoading(true);
      try {
        const response = await api.get(`/shops/${shopId}/products?page=${currentPage}&limit=${limit}`);
        const { products, hasMore } = response.data;
        
        setProducts(prevProducts => {
          const productMap = new Map(prevProducts.map(product => [product._id, product]));
          products.forEach(product => {
            if (!productMap.has(product._id)) {
              productMap.set(product._id, product);
            }
          });
          return Array.from(productMap.values());
        });

        setHasMore(hasMore);
      } catch (error) {
        setError('Error fetching products');
      }
      setLoading(false);
    };

    fetchProducts();
  }, [currentPage, shopId]);

  const loadMoreProducts = () => {
    if (hasMore) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const calculateDiscountPercentage = product => {
    if (product && product.discountPrice && product.price) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return 0;
  };

  // Handle adding the product to the cart
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  // Handle removing the product from the cart
  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCart(productId));
  };

  // Handle updating product quantity in the cart
  const handleUpdateCartQuantity = (productId, quantity) => {
    dispatch(updateCartItem(productId, quantity));
  };

  // Check if the product is in the cart
  const isProductInCart = useCallback((productId) => {
    return cartItems.find(item => item.productId._id === productId);
  }, [cartItems]);

  const handleProductClick = (productId) => {
    navigate(`/products/product/${productId}`); // Navigate to product details
  };

  if (loading && currentPage === 1) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading Products...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>Products - Himalayan Rasa</title>
      </Helmet>
      <div className="products-list">
        <h1>Our Products</h1>
        <div className="products-grid">
          {products.map(product => {
            const cartItem = isProductInCart(product._id);
            return (
              <div className="product-card" key={product._id}>
                <div onClick={() => handleProductClick(product._id)}>
                  <ImageSlider images={product.images} />
                </div>
                <div className="product-info">
                  <h2 className="product-name" onClick={() => handleProductClick(product._id)}>{product.name}</h2>
                  <p className="product-price">
                    {product.discountPrice ? (
                      <>
                        <span className="product-original-price">₹{product.price}</span>
                        <span className="product-discount-price">₹{product.discountPrice}</span>
                        <span className="product-discount-percentage">
                          ({calculateDiscountPercentage(product)}% off)
                        </span>
                      </>
                    ) : (
                      `₹${product.price}`
                    )}
                  </p>
                  {/* Add to Cart or show quantity controls if already in the cart */}
                  {cartItem && cartItems.length > 0 ? (
                    <div className="product-page-cart-quantity-control">
                      <button 
                        className="plus-minus-product" 
                        onClick={() => handleUpdateCartQuantity(cartItem.productId._id, cartItem.quantity - 1)}
                        disabled={cartItem.quantity === 1}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span>{cartItem.quantity}</span>
                      <button className="plus-minus-product" onClick={() => handleUpdateCartQuantity(cartItem.productId._id, cartItem.quantity + 1)}>
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                      <button className="product-page-remove-from-cart" onClick={() => handleRemoveFromCart(cartItem.productId._id)}>
                        <FontAwesomeIcon icon={faTrashAlt} /> {/* Replace text with delete icon */}
                      </button>
                    </div>
                  ) : (
                    <button className="product-page-add-to-cart-button" onClick={() => handleAddToCart(product)}>
                      <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {hasMore && !loading && (
          <button onClick={loadMoreProducts} className="load-more-button">
            Load More Products
          </button>
        )}
        {loading && currentPage > 1 && (
          <div className="loading-more">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Loading more products...</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsList;
