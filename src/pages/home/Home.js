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
        {/* Hero Section */}
        <div className="hero-section">
          <h1>Experience the Purest Gifts of the Himalayas</h1>
          <p>Authentic. Natural. From the Heart of the Himalayas.</p>
          <Link to="/products" className="btn btn-primary">SHOP NOW</Link>
        </div>

        {/* About the Himalayas Section */}
        <div className="about-himalayas">
          <h2>Why the Himalayas?</h2>
          <div className="about-content">
            <img 
              src="https://himalayanrasa-product-images.s3.ap-south-1.amazonaws.com/uploads/WebsiteImages/himalayas-hero.png" 
              alt="Himalayas" 
              className="about-image" 
            />
            <div className="about-text">
              <p>The Himalayas are a unique source of natural ingredients, offering unparalleled purity. The pristine environment and high altitude ensure that our products are rich in minerals and nutrients, free from pollutants, and crafted using traditional methods passed down through generations.</p>
              <ul>
                <li>Rich in minerals and nutrients.</li>
                <li>Unpolluted environment ensures pure ingredients.</li>
                <li>Ancient harvesting and processing practices.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Highlight Section
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
        </div> */}

        {/* Sustainability Section */}
        <div className="sustainability-section">
          <h2>Sustainability & Social Responsibility</h2>
          <p>We are committed to supporting sustainable practices, protecting the environment, and giving back to the communities that make our products possible.</p>
          <ul>
            <li>100% Organic Ingredients</li>
            <li>Supporting local families in the Himalayas</li>
            <li>Reducing our carbon footprint</li>
          </ul>
        </div>

        {/* Testimonials Section */}
        <div className="testimonials-section">
          <h2>What Our Customers Say</h2>
          <div className="testimonial">
            <p>"Himalayan Rasa's apricot oil is a game-changer for my skin. I love how natural and effective it is!"</p>
            <p>- Satisfied Customer</p>
          </div>
        </div>

        {/* Newsletter Signup Section */}
        <div className="newsletter-signup">
          <h2>Stay Connected</h2>
          <p>Subscribe to our newsletter to receive updates on new products, special offers, and tips on natural wellness.</p>
          <form className="newsletter-form">
            <input id='email' type="email" placeholder="Your email address" autoComplete='email' />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Home;
