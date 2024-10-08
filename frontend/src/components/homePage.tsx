import React from 'react';
import '../styles/homepage.css'; // Import CSS for homepage styling
import HeroImage from '../images/Ecosystems_ A Bank.jpeg'; // Import the image

const HomePage: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-wrapper">
        {/* Hero Content */}
        <div className="hero-content">
          <h1 className="home-heading">
            <span className="color-blue">Server Samurai Banking <br /> We slash the prices</span> JOIN US!
          </h1>

          <div className="trusted-by">
            <h2 className="trusted-heading">Trusted by:</h2>
            <img src="/images/advtech02.svg" alt="Adtech Group" />
            <img src="/images/images1.svg" alt="NexGen Coders" />
            <img src="/images/logo.svg" alt="The Independent Institute of Education" />
          </div>
        </div>

        {/* Hero Image */}
        <div className="hero-image">
          <img src={HeroImage} alt="Decorative Image" />
        </div>
      </div>

      
    </section>
  );
};

export default HomePage;
