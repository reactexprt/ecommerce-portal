import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faShoppingCart, faTruck, faMapMarkerAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import './OrderDetails.css';

const OrderDetails = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch related products (from same category)
        const fetchRelatedProducts = async (products) => {
            const productIds = products.map(p => p.productId._id);
            if (productIds.length > 0) {
                try {
                    const response = await api.post('/products/related', { productIds });
                    setRelatedProducts(response.data.products);
                } catch (err) {
                    console.error('Error fetching related products', err);
                }
            } else {
                // Do nothing
            }
        };

        const fetchOrderDetails = async () => {
            try {
                const response = await api.get(`/orders/${orderId}`);
                setOrder(response.data.order);
                fetchRelatedProducts(response.data.order.products);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred');
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (error) return <p>{error}</p>;

    if (loading) {
        return (
          <div className="loading">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
            <p>Fetching your order details...</p>
          </div>
        );
      }

    if (!order) return <p>No order found.</p>;

    return (
        <>
            <Helmet>
                <title>Order Details - Himalayan Rasa</title>
            </Helmet>
            <div className="od-container">
                <h2 className="od-heading">Order Details</h2>

                <div className="od-order-card">
                    <div className="od-order-header">
                        <p>Order ID: {order._id}</p>
                        <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className={`od-status-badge ${order.orderStatus.replace(/\s+/g, '-').toLowerCase()}`}>
                            {order.orderStatus}
                        </p>
                    </div>

                    <p>Total Amount: ₹{order.totalAmount}</p>
                    <p>Payment Method: {order.paymentMethod || 'N/A'}</p>
                    <p>Payment Status: {order.paymentStatus}</p>

                    <div className="od-progress-bar">
                        <div className={`od-progress-step ${['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus) ? 'active' : ''}`}>
                            <div className="od-step-icon">
                            <FontAwesomeIcon icon={faShoppingCart} />
                            </div>
                            <p>Order Placed</p>
                        </div>
                        <div className={`od-progress-step ${['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus) ? 'active' : ''}`}>
                            <div className="od-step-icon">
                            <FontAwesomeIcon icon={faTruck} />
                            </div>
                            <p>Shipped</p>
                        </div>
                        <div className={`od-progress-step ${['Out for Delivery', 'Delivered'].includes(order.orderStatus) ? 'active' : ''}`}>
                            <div className="od-step-icon">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            </div>
                            <p>Out for Delivery</p>
                        </div>
                        <div className={`od-progress-step ${order.orderStatus === 'Delivered' ? 'active' : ''}`}>
                            <div className="od-step-icon">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            </div>
                            <p>Delivered</p>
                        </div>
                    </div>

                    {order.estimatedDeliveryDate && (
                        <p>Estimated Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
                    )}

                    <h4 className="od-items-title">Items Ordered</h4>
                    <div className="od-items-list">
                        {order.products.map(item => (
                            <div key={item.productId._id} className="od-item">
                                <Link to={`/products/product/${item.productId._id}`} className="od-link">
                                    <div className="od-item-container">
                                        {item.productId.images && item.productId.images.length > 0 && (
                                            <img src={item.productId.images[0]} alt={item.productId.name} className="od-item-image" />
                                        )}
                                        <div className="od-item-details">
                                            <p className="od-item-name">{item.productId.name}</p>
                                            <p className="od-item-quantity">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    <p className="od-shipping-address"><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                <div className="od-related-products">
                    <h4>You Might Also Like</h4>
                    <div className="od-related-products-grid">
                    {relatedProducts.map(product => (
                        <div key={product._id} className="od-related-product-card">
                        <Link to={`/products/product/${product._id}`} className='od-link'>
                            <img src={product.images[0]} alt={product.name} className="od-related-product-image" />
                            <p className="od-related-product-name">{product.name}</p>
                        </Link>
                        </div>
                    ))}
                    </div>
                </div>
                )}

                <div className="od-actions">
                    <Link to="/support" className="od-support-link">Need help? Contact Support</Link>
                    <Link to="/previousOrders" className="od-back-link">Back to Previous Orders</Link>
                </div>
            </div>
        </>
    );
};

export default OrderDetails;
