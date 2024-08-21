import React, { useState } from 'react';
import Modal from '../../utils/modal/Modal'; // Adjust the path according to your folder structure

const AboutUsButton = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <button onClick={handleOpenModal} className='common-modal-button'>Learn More</button>
      <Modal show={showModal} onClose={handleCloseModal}>
        <div className="about-us-content">
          <h2>Our Story: A Commitment to Quality and Authenticity</h2>
          <p>
            At Himalayan Rasa, we believe that quality and authenticity are the cornerstones of every product we create. 
            Founded in 2024, our journey began with a simple mission: to bring genuine, high-quality products to customers who 
            value the real essence of what they buy.
          </p>

          <h3>Our Mission: Excellence in Every Detail</h3>
          <p>
            Our mission is to provide products that are not only high in quality but also rooted in authenticity. We are committed to:
            <ul>
              <li><strong>Quality:</strong> Ensuring every product meets rigorous standards, from sourcing to delivery.</li>
              <li><strong>Authenticity:</strong> Offering products that are true to their origins, free from imitation or compromise.</li>
              <li><strong>Customer Satisfaction:</strong> Building lasting relationships with our customers by exceeding their expectations.</li>
            </ul>
          </p>

          <h3>Our Vision: Building a Legacy of Trust</h3>
          <p>
            We envision a world where every customer can trust the products they purchase. Our goal is to set a new standard in the industry by 
            consistently delivering authentic, high-quality products that customers can rely on.
          </p>

          <h3>Our Journey: A Story of Passion and Precision</h3>
          <p>
            <ul>
              <li>[Year]: Our company was founded with the goal of redefining quality in the marketplace.</li>
              <li>[Year]: Launched our first product, which quickly became a customer favorite due to its unmatched quality.</li>
              <li>[Year]: Expanded our product line to include [new product categories], all adhering to our strict standards of authenticity.</li>
              <li>[Year]: Opened our first store/expanded our online presence to reach a wider audience.</li>
            </ul>
          </p>

          <h3>Meet the Team: The People Behind the Quality</h3>
          <p>
            Our team is our greatest asset. Each member brings a wealth of experience and a deep commitment to maintaining the integrity 
            of our products. From our skilled artisans to our customer support team, everyone at Himalayan Rasa shares a common goal: 
            to deliver excellence.
          </p>

          <h3>Our Products: Authenticity You Can Trust</h3>
          <p>
            Every product we offer is carefully crafted to reflect our commitment to quality and authenticity. Whether it’s 
            [Product Category 1] or [Product Category 2], you can be sure that what you’re getting is the real deal.
            <ul>
              <li><strong>[Product Category 1]:</strong> [Brief Description]</li>
              <li><strong>[Product Category 2]:</strong> [Brief Description]</li>
            </ul>
          </p>

          <h3>Our Commitment: Beyond the Product</h3>
          <p>
            At Himalayan Rasa, we go beyond just selling products. We are committed to making a positive impact:
            <ul>
              <li><strong>Sustainability:</strong> We prioritize sustainable practices in our sourcing and production processes.</li>
              <li><strong>Community:</strong> We actively participate in community initiatives, supporting causes that matter to us and our customers.</li>
              <li><strong>Transparency:</strong> We believe in being transparent with our customers, providing detailed information about the origins and quality of our products.</li>
            </ul>
          </p>

          <h3>Testimonials: What Our Customers Say</h3>
          <p>
            "Absolutely love the authenticity of the products. I can feel the quality in every purchase." – [Customer Name]
            <br />
            "I trust Himalayan Rasa to deliver exactly what they promise—genuine products that live up to the hype." – [Customer Name]
          </p>

          <h3>Get in Touch</h3>
          <p>
            We’d love to hear from you! Whether you have a question about our products, need assistance with your order, 
            or just want to learn more about what we do, feel free to reach out.
            <br />
            <strong>Contact Us:</strong> [Email Address] | [Phone Number]
          </p>
        </div>
      </Modal>
    </>
  );
};

export default AboutUsButton;
