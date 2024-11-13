import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

// Helper to save cart to local storage
const saveCartToLocal = (cartItems) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
};

// Initial state for the cart
const initialState = {
    cartItems: [],
    isLoading: false,
};

// Create a slice for cart
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        updateCart: (state, action) => {
            state.cartItems = action.payload;
        },
        fetchCartSuccess: (state, action) => {
            state.cartItems = action.payload;
        },
        addToCartSuccess: (state, action) => {
            const existingItem = state.cartItems.find(item => item.productId._id === action.payload.productId._id);
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.cartItems.push(action.payload);
            }
        },
        removeFromCartSuccess: (state, action) => {
            state.cartItems = state.cartItems.filter(item => item.productId._id !== action.payload);
        },
        updateCartItemSuccess: (state, action) => {
            const updatedCartItems = state.cartItems.map(item =>
                item.productId._id === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item
            );
            state.cartItems = updatedCartItems;
        },
        clearCartSuccess: (state) => {
            state.cartItems = [];
        },
        mergeCartSuccess: (state, action) => {
            state.cartItems = action.payload;
        },
    },
});

// Export actions
export const {
    setCartLoading,
    updateCart,
    fetchCartSuccess,
    addToCartSuccess,
    removeFromCartSuccess,
    updateCartItemSuccess,
    clearCartSuccess,
    mergeCartSuccess,
} = cartSlice.actions;

// Thunks (async logic)

// Fetch cart from backend
export const fetchCart = () => async (dispatch) => {
    dispatch(setCartLoading(true));
    try {
        const response = await api.get('/cart');
        dispatch(fetchCartSuccess(response.data));
    } catch (error) {
        console.error('Failed to fetch cart:', error);
    }
    dispatch(setCartLoading(false));
};

// Add to cart
export const addToCart = (product, quantity = 1) => async (dispatch, getState) => {
    try {
        const { cart, auth } = getState();
        const existingItem = cart.cartItems.find(item => item.productId._id === product._id);

        if (existingItem) {
            const updatedQuantity = existingItem.quantity + quantity;
            dispatch(updateCartItem(product._id, updatedQuantity));
        } else {
            const newCartItem = { productId: product, quantity };
            dispatch(addToCartSuccess(newCartItem));
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

// Update cart item quantity
export const updateCartItem = (productId, quantity) => async (dispatch, getState) => {
    const { auth, cart } = getState();
    try {
        const updatedCartItems = cart.cartItems.map(item =>
            item.productId._id === productId ? { ...item, quantity } : item
        );
        dispatch(updateCartItemSuccess({ productId, quantity }));

        if (auth.isAuthenticated) {
            await api.put(`/cart/${productId}`, { quantity });
        } else {
            saveCartToLocal(updatedCartItems);
        }
    } catch (error) {
        console.error('Failed to update cart item:', error);
    }
};

// Remove from cart
export const removeFromCart = (productId) => async (dispatch, getState) => {
    try {
        const { auth, cart } = getState();

        if (auth.isAuthenticated) {
            await api.delete(`/cart/${productId}`);
        } else {
            const updatedCartItems = cart.cartItems.filter(item => item.productId._id !== productId);
            saveCartToLocal(updatedCartItems);
            dispatch(updateCart(updatedCartItems));
        }

        dispatch(removeFromCartSuccess(productId));
    } catch (error) {
        console.error('Failed to remove from cart:', error);
    }
};

// Clear cart
export const clearCart = () => (dispatch) => {
    // localStorage.removeItem('cart');
    dispatch(clearCartSuccess());
};

// Merge cart with backend after login
export const mergeCart = () => async (dispatch, getState) => {
    dispatch(setCartLoading(true));
    const { auth } = getState();
    if (!auth.isAuthenticated) return;

    const localCartItems = JSON.parse(localStorage.getItem('cart')) || [];
    if (localCartItems.length > 0) {
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
            dispatch(mergeCartSuccess(response.data));
            localStorage.removeItem('cart');
        } catch (error) {
            console.error('Failed to merge cart:', error);
        }
    }
    dispatch(setCartLoading(false));
};

// Export the reducer
export default cartSlice.reducer;