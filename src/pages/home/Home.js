import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Ħome - Ħimalayan R̥asa</title>
      </Helmet>
      <div className="home-page">
        <h1>Welcome to Our Himalayan Rasa Platform</h1>
        <p>Your one-stop shop for all your needs.</p>
        <div className="product-highlight">
          <h2>Handmade Apricot Oil from the Himalayas</h2>
          <p>
            Experience the pure and natural benefits of our handmade apricot oil, sourced directly from the pristine Himalayan mountains. Our apricot oil is crafted with care and offers numerous benefits for your skin and hair.
          </p>
          <ul>
            <li>Rich in vitamins A and E, promoting healthy skin.</li>
            <li>Deeply moisturizing and nourishing for all skin types.</li>
            <li>Lightweight and easily absorbed without a greasy residue.</li>
            <li>Helps to reduce fine lines and wrinkles.</li>
            <li>Great for soothing dry and irritated skin.</li>
            <li>Can be used as a natural hair conditioner, adding shine and softness.</li>
          </ul>
          <p>Discover the natural goodness of apricot oil and enhance your beauty routine with our premium product. Perfect for daily use and suitable for all skin types.</p>
          <Link to="/products" className="btn btn-primary">SHOP NOW</Link>
        </div>
      </div>
    </>
  );
};

export default Home;
