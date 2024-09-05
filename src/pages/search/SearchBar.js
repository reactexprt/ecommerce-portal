import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './SearchBar.css'; // Modernized CSS

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], shops: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const searchRef = useRef(null); // Reference to the search bar container

  useEffect(() => {
    if (query.trim() === '') {
      setResults({ products: [], shops: [] });
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/search?query=${query}`);
        setResults(response.data);
      } catch (err) {
        setError('Failed to fetch search results');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchSearchResults();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleResultClick = useCallback((type, id) => {
    if (type === 'product') {
      navigate(`/products/product/${id}`);
    } else if (type === 'shop') {
      navigate(`/shop/${id}/products`);
    }
    setQuery(''); // Clear the search query to close the dropdown
    setResults({ products: [], shops: [] });
  }, [navigate]);

  // Handle clicks outside the search bar to close results dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setQuery('');
        setResults({ products: [], shops: [] });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container" ref={searchRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products or shops..."
        className="search-input"
      />

      {loading && <div className="loading-spinner"></div>}

      {error && <p className="error">{error}</p>}

      <div className="search-results">
        {results.products.length > 0 && (
          <div>
            <h2>Products</h2>
            <ul>
              {results.products.map((product) => (
                <li key={product._id} onClick={() => handleResultClick('product', product._id)}>
                  <img src={product.images && product.images[0]} alt={product.name} className="search-result-image" />
                  <div className="search-result-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.shops.length > 0 && (
          <div>
            <h2>Shops</h2>
            <ul>
              {results.shops.map((shop) => (
                <li key={shop._id} onClick={() => handleResultClick('shop', shop._id)}>
                  <img src={shop.images && shop.images[0]} alt={shop.name} className="search-result-image" />
                  <div className="search-result-info">
                    <h3>{shop.name}</h3>
                    <p>{shop.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {query && results.products.length === 0 && results.shops.length === 0 && !loading && (
          <p className="search-no-results">No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
