// src/contexts/CartContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // Ensure api is correctly configured

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Fetch cart items from the server on initial load
    const fetchCartItems = async () => {
      try {
        const response = await api.get('/cart');
        setCartItems(response.data);
      } catch (error) {
        console.error('Failed to fetch cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  useEffect(() => {
    const amount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(amount);
  }, [cartItems]);

  const addToCart = async (product) => {
    try {
      const existingItem = cartItems.find(item => item._id === product._id);
      if (existingItem) {
        const updatedItems = cartItems.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCartItems(updatedItems);
        await api.put(`/cart/${product._id}`, { quantity: existingItem.quantity + 1 });
      } else {
        const updatedItems = [...cartItems, { ...product, quantity: 1 }];
        setCartItems(updatedItems);
        await api.post('/cart', { productId: product._id, quantity: 1 });
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
      await api.delete(`/cart/${productId}`);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const increaseQuantity = async (productId) => {
    try {
      const updatedItems = cartItems.map(item =>
        item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCartItems(updatedItems);
      await api.put(`/cart/${productId}`, { quantity: 1 });
    } catch (error) {
      console.error('Failed to increase quantity:', error);
    }
  };

  const decreaseQuantity = async (productId) => {
    try {
      const updatedItems = cartItems.map(item =>
        item._id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => item.quantity > 0);
      setCartItems(updatedItems);
      await api.put(`/cart/${productId}`, { quantity: -1 });
    } catch (error) {
      console.error('Failed to decrease quantity:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};
