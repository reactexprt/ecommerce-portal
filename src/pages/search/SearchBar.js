import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './SearchBar.css'; // Modernized CSS

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], shops: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Track current page
  const [hasMore, setHasMore] = useState(true); // Track if more results are available
  const navigate = useNavigate();
  const searchRef = useRef(null); // Reference to the search bar container
  const observerRef = useRef(null); // Ref for infinite scroll observer
  const debounceTimeoutRef = useRef(null);
  const lastQueryRef = useRef('');

  // Debounced function to fetch search results
  const fetchSearchResults = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ products: [], shops: [] });
      setPage(1); // Reset page when query changes
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/search?query=${searchQuery}&page=${page}&limit=10`);
      setResults((prev) => ({
        products: page === 1 ? response.data.products : [...prev.products, ...response.data.products],
        shops: page === 1 ? response.data.shops : [...prev.shops, ...response.data.shops],
      }));
      setHasMore(response.data.products.length > 0 || response.data.shops.length > 0); // Check if more data
    } catch (err) {
      setError('Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Debounced API call
  useEffect(() => {
    if (query === lastQueryRef.current) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setPage(1); // Reset page when new query is entered
      lastQueryRef.current = query; // Track the last query to avoid duplicate API calls
      fetchSearchResults(query);
    }, 500);

    return () => clearTimeout(debounceTimeoutRef.current);
  }, [query, fetchSearchResults]);

  // Infinite scroll logic
  useEffect(() => {
    if (!loading && hasMore) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1); // Load next page
        }
      });

      if (searchRef.current) {
        observer.observe(searchRef.current);
      }

      return () => observer.disconnect();
    }
  }, [loading, hasMore]);

  const handleResultClick = useCallback((type, id) => {
    if (type === 'product') {
      navigate(`/products/product/${id}`);
    } else if (type === 'shop') {
      navigate(`/shop/${id}/products`);
    }
    setQuery(''); // Clear the search query to close the dropdown
    setResults({ products: [], shops: [] });
    setPage(1); // Reset page
  }, [navigate]);

  // Handle clicks outside the search bar to close results dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setQuery(''); // Clear query
        setResults({ products: [], shops: [] }); // Clear results
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
        onChange={(e) => {
          setQuery(e.target.value);
          setLoading(true);
          setPage(1); // Reset page when new query is entered
          setResults({ products: [], shops: [] }); // Clear results on new query
        }}
        placeholder="Search for products or shops..."
        className="search-input"
      />

      <div className="search-results">
        {loading && <div className="loading-spinner"></div>}
        {error && <p className="error">{error}</p>}
        {!loading && results.products.length === 0 && results.shops.length === 0 && query && (
          <p className="search-no-results">No results found</p>
        )}

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
      </div>
    </div>
  );
};

export default SearchBar;
