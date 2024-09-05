import React, { useState } from 'react';
import SearchBar from './SearchBar';
import './SearchResults.css';

const SearchResults = () => {
  const [searchResults, setSearchResults] = useState({ products: [], shops: [] });

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  return (
    <div className="search-results">
      <SearchBar onSearchResults={handleSearchResults} />
      <h1>Search Results</h1>

      <div className="search-section">
        <h2>Products</h2>
        {searchResults.products.length ? (
          <div className="products-grid">
            {searchResults.products.map((product) => (
              <div key={product._id} className="product-card">
                <img src={product.images[0]} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No products found</p>
        )}
      </div>

      <div className="search-section">
        <h2>Shops</h2>
        {searchResults.shops.length ? (
          <div className="shops-grid">
            {searchResults.shops.map((shop) => (
              <div key={shop._id} className="shop-card">
                <img src={shop.images[0]} alt={shop.name} />
                <h3>{shop.name}</h3>
                <p>{shop.location}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No shops found</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
