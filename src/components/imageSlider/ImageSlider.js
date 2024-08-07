import React, { useState, useEffect, useRef } from 'react';
import './ImageSlider.css';

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const slideInterval = useRef(null);

  useEffect(() => {
    if (hovering) {
      slideInterval.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
      }, 2000); // Change image every 3 seconds
    }

    return () => {
      clearInterval(slideInterval.current);
      slideInterval.current = null;
    };
  }, [hovering, images.length]);

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    clearInterval(slideInterval.current);
    slideInterval.current = null;
  };

  return (
    <div
      className="image-slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {images.map((image, index) => (
        <div
          key={index}
          className={`slider-image ${index === currentIndex ? 'active' : ''}`}
        >
          <img src={image} alt={`Product Img ${index + 1}`} />
        </div>
      ))}
    </div>
  );
};

export default ImageSlider;
