import React from 'react';
import Navbar from './components/Navbar';
import logo2 from "./CSS/logo2.png";
import "./CSS/AboutUs.css"

const AboutUs = () => {
  const style = {
    background: "linear-gradient(to bottom, #3e8d97 60vh , white 40vh)",
    minHeight: "100vh",
  }

  return (
    <div>
        <Navbar/>

<div style={style}>
  <div className="about-us-container">
<section className="aboutush">
          <div className="about-us-header">
            <h1>About Us</h1>
            <h2>Here to help you stay connected</h2>
            <br></br>
          </div>
          <center>
            <img src={logo2} alt="About Us" className="about-us-image" />
          </center>
        </section>
        <div className="about-us-text">
          <center>
      <p className="about-us-text" >Welcome to our dynamic MERN stack web app that is revolutionizing alumni-student connections!</p>
      <p className="about-us-text">Our goal is to bridge the gap between alumni and current students by providing a platform that suggests relevant alumni contacts based on various preferences. We achieve this through the power of an ML (Machine Learning) recommender system.</p>
      <p className="about-us-text">With our ML recommender system, we take into account preferences such as industry, graduation year, career level, and location proximity to suggest the most relevant contacts for each user.</p>
      <p className="about-us-text">We understand the importance of direct engagement, which is why we have integrated a chat functionality directly into our platform. This allows users to connect and communicate with alumni contacts in a seamless and convenient manner.</p>
      <p className="about-us-text">Whether you are a student seeking guidance and mentorship from alumni who have paved the way in your desired industry, or an alumni looking to give back and support the next generation, our platform is designed to facilitate meaningful connections.</p>
      <p className="about-us-text">Thank you for joining us on this journey of connecting students and alumni like never before!</p>
      </center>
        </div>
    </div>
    </div>
    </div>
  );
};

export default AboutUs;