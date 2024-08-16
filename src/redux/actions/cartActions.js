import api from '../../services/api';

export const UPDATE_CART = 'UPDATE_CART';
export const FETCH_CART = 'FETCH_CART_SUCCESS';
export const ADD_TO_CART = 'ADD_TO_CART_SUCCESS';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART_SUCCESS';
export const UPDATE_CART_ITEM = 'UPDATE_CART_ITEM_SUCCESS';
export const CLEAR_CART = 'CLEAR_CART';

export const clearCart = () => {
  return {
    type: CLEAR_CART,
  };
};


export const updateCart = (cartItems) => ({
  type: UPDATE_CART,
  payload: cartItems,
});

export const fetchCart = () => async dispatch => {
  try {
    const response = await api.get('/cart');
    dispatch({ type: FETCH_CART, payload: response.data });
  } catch (error) {
    console.error('Failed to fetch cart:', error);
  }
};

export const addToCart = (product, quantity = 1) => async (dispatch, getState) => {
  try {
    const { cart } = getState();
    const existingItem = cart.cartItems.find(item => item.productId._id === product._id);

    if (existingItem) {
      dispatch(updateCartItem(product._id, existingItem.quantity + quantity));
    } else {
      const newCartItem = { 
        productId: product,
        quantity
      };
      dispatch({ type: ADD_TO_CART, payload: newCartItem });
      await api.post('/cart', { productId: product._id, quantity });
    }
  } catch (error) {
    console.error('Failed to add to cart:', error);
  }
};

export const removeFromCart = productId => async (dispatch, getState) => {
  try {
    dispatch({ type: REMOVE_FROM_CART, payload: productId });
    await api.delete(`/cart/${productId}`);
  } catch (error) {
    console.error('Failed to remove from cart:', error);
  }
};

export const updateCartItem = (productId, quantity) => async (dispatch, getState) => {
  try {
    const { cart } = getState();
    const updatedCartItems = cart.cartItems.map(item =>
      item.productId._id === productId ? { ...item, quantity } : item
    );
    dispatch(updateCart(updatedCartItems));
    await api.put(`/cart/${productId}`, { quantity });
  } catch (error) {
    console.error('Failed to update cart item:', error);
  }
};
