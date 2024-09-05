// src/components/PreviousOrders.js
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import './PreviousOrders.css'; // Import the CSS file for styling

const PreviousOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(0); // Total number of pages

  useEffect(() => {
    const fetchOrders = async (page) => {
      try {
        const response = await api.get(`/orders/previous?page=${page}&limit=5`);
        setOrders(prevOrders => {
          const newOrders = response.data.orders.filter(
            order => !prevOrders.some(existingOrder => existingOrder._id === order._id)
          );
          return [...prevOrders, ...newOrders];
        });
        setTotalPages(response.data.totalPages); // Set the total pages
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        setLoading(false);
      }
    };

    fetchOrders(page);
  }, [page]);

  const loadMoreOrders = () => {
    setPage(prevPage => prevPage + 1); // Increment the page number
  };

  if (loading && page === 1) return <div className="po-loading">Loading your previous orders...</div>;
  if (error) return <div className="po-error">{error}</div>;
  if (!orders.length && !loading) {
    return (
        <div className="po-no-orders">
            <FontAwesomeIcon icon={faBoxOpen} size="4x" />
            <p>No previous orders found.</p>
        </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Órders - Ħimalayan R̥asa</title>
      </Helmet>
      <div className="po-previous-orders-container">
        <h2 className="po-heading">Your Previous Orders</h2>
        <div className="po-orders-list">
          {orders.map(order => (
            <div key={order._id} className="po-order-card">
              <div className="po-order-header">
                <p className="po-order-id">Order ID: {order._id}</p>
                <p className="po-order-date">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="po-order-amount">Total Amount: ₹{order.totalAmount}</p>
              <p className="po-order-status">Status: {order.orderStatus} | Payment: {order.paymentStatus}</p>
              <div className="po-order-items">
                <h4 className="po-items-heading">Items:</h4>
                <ul className="po-items-list">
                  {order.products.map(item => (
                    <li key={item.productId._id} className="po-order-item">
                      <div className="po-item-image">
                        {item.productId.images && item.productId.images.length > 0 && (
                          <img src={item.productId.images[0]} alt={item.productId.name} />
                        )}
                      </div>
                      <div className="po-item-details">
                        <p className="po-item-name">{item.productId.name}</p>
                        <p className="po-item-quantity">Qty: {item.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="po-order-address">Shipping Address: {order.shippingAddress}</p>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {(page < totalPages && !loading) && (
          <button className="po-load-more-button" onClick={loadMoreOrders}>Load More Orders</button>
        )}
        {loading && page > 1 && <p className="po-loading-more">Loading more orders...</p>}
      </div>
    </>
  );
};

export default PreviousOrders;
