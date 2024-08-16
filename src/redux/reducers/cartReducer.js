import {
  UPDATE_CART,
  FETCH_CART,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEM,
  CLEAR_CART
} from '../actions/cartActions';

const initialCartState = {
  cartItems: [],
};

export default function cartReducer(state = initialCartState, action) {
  switch (action.type) {
    case FETCH_CART:
      return {
        ...state,
        cartItems: action.payload,
      };
    case ADD_TO_CART:
      const existingItem = state.cartItems.find(item => item.productId._id === action.payload.productId._id);
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.productId._id === action.payload.productId._id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload],
        };
      }
    case REMOVE_FROM_CART:
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.productId._id !== action.payload),
      };
    case UPDATE_CART_ITEM:
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.productId._id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case UPDATE_CART:
      return {
        ...state,
        cartItems: action.payload,
      };
    case CLEAR_CART:
      return {
        ...state,
        cartItems: []
      };
    default:
      return state;
  }
}
