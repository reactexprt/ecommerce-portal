import React, { useState, useEffect, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHeart, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { addToCart } from '../../redux/actions/cartActions';
const Popup = lazy(() => import('../../utils/alert/Popup')); // Import Popup component
import './ProductDetails.css';

const ProductDetails = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [newRating, setNewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [inWishlist, setInWishlist] = useState(false);
    const [showPopUp, setShowPopUp] = useState(false); // State for popup
    const [popupMessage, setPopupMessage] = useState(''); // State for popup message
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/products/${productId}`);
                setProduct(response.data);
                if (response.data.images && response.data.images.length > 0) {
                    setSelectedImage(response.data.images[0]);
                }
                if (isAuthenticated) {
                    const wishlistResponse = await api.get('/wishlist');
                    setInWishlist(wishlistResponse.data.some(item => item._id === productId));
                }
            } catch (err) {
                setPopupMessage('Error fetching product. Please try again.');
                setShowPopUp(true);
                navigate('/shops');
            }
            setLoading(false);
        };
        fetchProduct();
    }, [productId, isAuthenticated]);

    const handleAddToCart = async () => {
        await dispatch(addToCart(product));
        setPopupMessage('Product added to cart successfully!');
        setShowPopUp(true); // Show success popup
    };

    const toggleWishlist = async () => {
        if (isAuthenticated) {
            try {
                if (inWishlist) {
                    await api.post('/wishlist/remove', { productId });
                    setInWishlist(false);
                    setPopupMessage('Product removed from wishlist.');
                } else {
                    await api.post('/wishlist/add', { productId });
                    setInWishlist(true);
                    setPopupMessage('Product added to wishlist.');
                }
                setShowPopUp(true); // Show wishlist update popup
            } catch (err) {
                setPopupMessage('Error updating wishlist. Please try again.');
                setShowPopUp(true);
            }
        } else {
            setPopupMessage('Please login to manage your wishlist.');
            setShowPopUp(true); // Show login required popup
        }
    };

    // Function to calculate the discount percentage
    const calculateDiscountPercentage = () => {
        if (product && product.discountPrice && product.price) {
            return Math.round(((product.price - product.discountPrice) / product.price) * 100);
        }
        return 0;
    };

    const calculateSavings = () => {
        return Math.round(product.price - product.discountPrice);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (isAuthenticated) {
            try {
                const response = await api.post(`/products/${productId}/comment`, {
                    comment: newComment,
                    rating: newRating,
                });
                setProduct(response.data.product);
                setNewComment('');
                setNewRating(0);
                setPopupMessage('Comment added successfully!');
                setShowPopUp(true); // Show success popup
            } catch (err) {
                setPopupMessage('Failed to add comment. Please try again.');
                setShowPopUp(true);
            }
        } else {
            setPopupMessage('Please login to add a review.');
            setShowPopUp(true); // Show login required popup
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleMainImageClick = () => {
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    const renderUserStars = (rating) => {
        return [...Array(5)].map((star, index) => {
            const starValue = index + 1;
            return (
                <FontAwesomeIcon
                    key={index}
                    icon={faStar}
                    className="product-details-star"
                    color={starValue <= rating ? "#FFD700" : "#E4E5E9"}
                    style={{ cursor: 'default' }}
                />
            );
        });
    };

    const renderAverageRatingStars = (averageRating) => {
        const fullStars = Math.floor(averageRating); // Number of full stars
        const hasHalfStar = averageRating % 1 >= 0.5; // Check if there's a half star
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Calculate empty stars

        return (
            <>
                {/* Full Stars */}
                {[...Array(fullStars)].map((_, index) => (
                    <span key={`full-${index}`} className="star">
                        &#9733; {/* Unicode for filled star */}
                    </span>
                ))}

                {/* Half Star */}
                {hasHalfStar && (
                    <span key="half-star" className="half-star">
                        &#x2605; {/* Unicode for half star */}
                    </span>
                )}

                {/* Empty Stars */}
                {[...Array(emptyStars)].map((_, index) => (
                    <span key={`empty-${index}`} className="star">
                        &#9734; {/* Unicode for empty star */}
                    </span>
                ))}
            </>
        );
    };

    const renderStars = () => {
        return [...Array(5)].map((star, index) => {
            const starValue = index + 1;
            return (
                <FontAwesomeIcon
                    key={index}
                    icon={faStar}
                    className="product-details-star"
                    onClick={() => setNewRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    color={starValue <= (hoverRating || newRating) ? "#FFD700" : "#E4E5E9"}
                    style={{ cursor: 'pointer' }}
                />
            );
        });
    };

    if (loading || !product) {
        return (
            <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
                <p>Just a moment... diving into the product details!</p>
            </div>
        );
    }

    return (
        <div className="product-details-page">
            <div className='product-details-images'>
                <div className="product-details-main-image-container" onClick={handleMainImageClick}>
                    {selectedImage ? (
                        <img src={selectedImage} alt="Selected" className="product-details-main-image" />
                    ) : (
                        <p>No image available</p>
                    )}
                </div>

                <div className="product-details-thumbnails">
                    {product.images && product.images.length > 0 ? (
                        product.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className={`product-details-thumbnail-image ${image === selectedImage ? 'selected' : ''}`}
                                onClick={() => handleImageClick(image)}
                            />
                        ))
                    ) : (
                        <p>No images available</p>
                    )}
                </div>
            </div>

            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="Full View" className="lightbox-image" />
                        <button className="lightbox-close-button" onClick={closeLightbox}>X</button>
                    </div>
                </div>
            )}

            <div className="product-details-info">
                <h1>{product.name}</h1>
                {/* Display Average Rating with Stars */}
                <div className="product-average-rating">
                    <p>Average Rating: {product.averageRating}/5</p>
                    <div className="average-rating-stars">
                        {renderAverageRatingStars(product.averageRating)}
                    </div>
                </div>

                <p className="product-details-price">
                    {product.discountPrice ? (
                        <>
                            <span className="product-details-original-price">₹{product.price}</span>
                            <span className='product-details-discount-price'>₹{product.discountPrice}</span>
                            <span className="product-details-discount-percentage">
                                ({calculateDiscountPercentage()}% off)
                            </span>
                            <span className="product-details-savings">
                                You could save ₹{calculateSavings()}! on this product ✨ This deal is hotter than a summer day! Grab it now and save big!
                            </span>
                        </>
                    ) : (
                        `₹${product.price}`
                    )}
                </p>

                <p className={`stock-status ${product.stock === 0 ? 'out-of-stock' : ''} ${product.stock < 5 && product.stock > 0 ? 'low-stock' : ''}`}>
                    {product.stock > 0
                        ? product.stock < 5
                            ? `Only ${product.stock} left!`
                            : `In stock: ${product.stock}`
                        : 'Out of stock'}
                </p>

                {/* Buttons */}
                <div className="modal-button-div">
                    <button className="custom-add-to-cart-button" onClick={handleAddToCart}>
                        Add to Cart
                    </button>
                    <button className="custom-wishlist-button" onClick={toggleWishlist}>
                        <FontAwesomeIcon icon={faHeart} style={{ color: inWishlist ? 'red' : 'orange' }} />
                        {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </button>
                </div>

                <div id='product-description'>
                    <h3>Product Details</h3>
                    <p>{product.description}</p>
                </div>

                <div className="product-details-comments">
                    <h3>User Reviews ({product.comments?.length})</h3>
                    {product.comments && product.comments.length > 0 ? (
                        product.comments.map((comment, index) => (
                            <div key={index} className="product-details-comment">
                                <p><strong>{comment.username}</strong> rated:</p>
                                <div className="user-rating-stars">
                                    {renderUserStars(comment.rating)}
                                </div>
                                <p>{comment.comment}</p>
                                <small>{new Date(comment.createdAt).toLocaleString()}</small>
                            </div>
                        ))
                    ) : (
                        <p>No comments yet. Be the first to review this product!</p>
                    )}
                </div>

                <form onSubmit={handleCommentSubmit} className="product-details-comment-form">
                    <h3>Add Your Review</h3>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your comment here..."
                        required
                    />

                    <div className="product-details-star-rating">
                        {renderStars()}
                    </div>

                    <button type="submit">Submit Review</button>
                </form>
            </div>

            {/* Show the popup when an alert is needed */}
            {showPopUp && (
                <Popup
                    message={popupMessage}
                    onClose={() => setShowPopUp(false)} // Close popup when 'Okay' is clicked
                />
            )}
        </div>
    );
};

export default ProductDetails;
