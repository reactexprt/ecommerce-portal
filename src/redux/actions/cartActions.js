import api from '../../services/api';
import {
  UPDATE_CART,
  FETCH_CART,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEM,
  CLEAR_CART,
  MERGE_CART,
  SET_CART_LOADING
} from '../constants/cartConstants';

export const setCartLoading = (isLoading) => ({
    type: SET_CART_LOADING,
    payload: isLoading,
});

// Helper to save cart to local storage
const saveCartToLocal = (cartItems) => {
  localStorage.setItem('cart', JSON.stringify(cartItems));
};

// Action to clear the cart in the Redux store
export const clearCart = () => {
  return {
    type: CLEAR_CART,
  };
};

// Action to update the cart in the Redux store
export const updateCart = (cartItems) => ({
  type: UPDATE_CART,
  payload: cartItems,
});

// Action to fetch the cart from the backend and update the Redux store
export const fetchCart = () => async dispatch => {
  dispatch(setCartLoading(true));
  try {
    const response = await api.get('/cart');
    dispatch({ type: FETCH_CART, payload: response.data });
  } catch (error) {
    console.error('Failed to fetch cart:', error);
  }
  dispatch(setCartLoading(false));
};

// Modified addToCart action
// Action to add a product to the cart
export const addToCart = (product, quantity = 1) => async (dispatch, getState) => {
  try {
    const { cart, auth } = getState();
    const existingItem = cart.cartItems.find(item => item.productId._id === product._id);

    if (existingItem) {
      // If the item already exists, update the quantity
      const updatedQuantity = existingItem.quantity + quantity;
      
      if (auth.isAuthenticated) {
        // Update the cart on the server
        dispatch(updateCartItem(product._id, updatedQuantity));
      } else {
        // Update the cart in local storage
        const updatedCartItems = cart.cartItems.map(item =>
          item.productId._id === product._id ? { ...item, quantity: updatedQuantity } : item
        );
        saveCartToLocal(updatedCartItems);
        dispatch(updateCart(updatedCartItems));
      }
    } else {
      // If the item does not exist, add it
      const newCartItem = { productId: product, quantity };
      dispatch({ type: ADD_TO_CART, payload: newCartItem });
      if (auth.isAuthenticated) {
        await api.post('/cart', { productId: product._id, quantity });
      } else {
        const updatedCart = [...cart.cartItems, newCartItem];
        saveCartToLocal(updatedCart);
        dispatch(updateCart(updatedCart));
      }
    }
  } catch (error) {
    console.error('Failed to add to cart:', error);
  }
};

// Action to merge local cart items with database after login
export const mergeCart = () => async (dispatch, getState) => {
  dispatch(setCartLoading(true));
  const { auth } = getState();
  if (!auth.isAuthenticated) return;

  const localCartItems = JSON.parse(localStorage.getItem('cart')) || [];
  if (localCartItems.length > 0) {
    // Aggregate quantities for the same product
    const aggregatedItems = localCartItems.reduce((acc, item) => {
      const found = acc.find(x => x.productId._id === item.productId._id);
      if (found) {
        found.quantity += item.quantity;
      } else {
        acc.push(item);
      }
      return acc;
    }, []);

    try {
      const response = await api.post('/cart/merge', { items: aggregatedItems });
      dispatch(updateCart(response.data));
      localStorage.removeItem('cart'); // Clear local cart after merge
    } catch (error) {
      console.error('Failed to merge cart:', error);
    }
  }
  dispatch(setCartLoading(false));
};

// Action to remove a product from the cart
export const removeFromCart = productId => async (dispatch, getState) => {
  try {
    const { cart, auth } = getState();
    
    if (auth.isAuthenticated) {
      // Remove the item from the server-side cart
      await api.delete(`/cart/${productId}`);
    } else {
      // Remove the item from the local storage cart
      const updatedCartItems = cart.cartItems.filter(item => item.productId._id !== productId);
      saveCartToLocal(updatedCartItems);
      dispatch(updateCart(updatedCartItems));
    }

    // Dispatch the action to remove the item from the Redux state
    dispatch({ type: REMOVE_FROM_CART, payload: productId });
  } catch (error) {
    console.error('Failed to remove from cart:', error);
  }
};

// Action to update the quantity of a cart item
export const updateCartItem = (productId, quantity) => async (dispatch, getState) => {
  const { auth, cart } = getState();
  try {
    const updatedCartItems = cart.cartItems.map(item =>
      item.productId._id === productId ? { ...item, quantity } : item
    );
    dispatch(updateCart(updatedCartItems));
    
    if (auth.isAuthenticated) {
      await api.put(`/cart/${productId}`, { quantity });
    } else {
      saveCartToLocal(updatedCartItems); // Update local storage directly
    }
  } catch (error) {
    console.error('Failed to update cart item:', error);
  }
};

