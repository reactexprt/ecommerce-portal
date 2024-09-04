import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHeart } from '@fortawesome/free-solid-svg-icons'; 
import api from '../../services/api';
import { addToCart } from '../../redux/actions/cartActions';
import './ProductDetails.css';

const ProductDetails = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); 
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(0); 
    const [hoverRating, setHoverRating] = useState(null); 
    const [isLightboxOpen, setIsLightboxOpen] = useState(false); 
    const [inWishlist, setInWishlist] = useState(false); 
    const dispatch = useDispatch();
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${productId}`);
                setProduct(response.data);
                if (response.data.images && response.data.images.length > 0) {
                    setSelectedImage(response.data.images[0]); 
                }
                const wishlistResponse = await api.get('/wishlist');
                setInWishlist(wishlistResponse.data.some(item => item._id === productId));
            } catch (error) {
                setError('Error fetching product. Please try again.');
                console.error('Error fetching product:', error);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        dispatch(addToCart(product));
    };

    const toggleWishlist = async () => {
        try {
            if (inWishlist) {
                await api.post('/wishlist/remove', { productId });
                setInWishlist(false); 
            } else {
                await api.post('/wishlist/add', { productId });
                setInWishlist(true); 
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/products/${productId}/comment`, {
                comment: newComment,
                rating: newRating,
            });
            setProduct(response.data.product); 
            setNewComment(''); 
            setNewRating(0); 
        } catch (error) {
            setError('Failed to add comment. Please try again.');
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

    if (error) return <div>{error}</div>;

    if (!product) return <div>Loading...</div>;

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
                                className="product-details-thumbnail-image"
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
                <p>{product.description}</p>
                <p className="product-details-price">
                    {product.discountPrice ? (
                        <>
                            <span className="product-details-original-price">₹{product.price}</span> ₹{product.discountPrice}
                        </>
                    ) : (
                        `₹${product.price}`
                    )}
                </p>

                <div className="modal-button-div">
                    <button className="custom-add-to-cart-button" onClick={handleAddToCart}>
                        Add to Cart
                    </button>
                    <button className="custom-wishlist-button" onClick={toggleWishlist}>
                        <FontAwesomeIcon icon={faHeart} style={{ color: inWishlist ? 'red' : 'orange' }} />
                        {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </button>
                </div>

                {/* Display Average Rating with Stars */}
                <div className="product-average-rating">
                    <p>Average Rating: {product.averageRating}/5</p>
                    <div className="average-rating-stars">
                        {renderAverageRatingStars(product.averageRating)}
                    </div>
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
                    {error && <p className="product-details-error">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default ProductDetails;
