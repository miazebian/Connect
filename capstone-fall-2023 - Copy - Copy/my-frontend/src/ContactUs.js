import React from 'react';
import "./CSS/contactus.css";
import { BsXCircleFill } from 'react-icons/bs';
import Navbar from './components/Navbar';

export const ContactUs = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const token = localStorage.getItem("token");

  const [popupStyle, showPopup] = React.useState("hide")
  const [active, setActive] = React.useState(false);

  function closeItem(e) {
    e.preventDefault();
    setActive(false);
    showPopup("hide");
  }
  function openItem() {
    setActive(false);
  }
  const style = { color: "#b2cdd8", fontSize:'1.5em'}

  const popup = () => {
      showPopup("popup1")
      openItem();
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/contactus/sendEmail",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${token}`
    },
    body: JSON.stringify({
      name,
      email,
      message
    })
  })
  .then((res) => {
    if (res.status === 200) {
          res.json().then((data) => {       
             console.log(data); 
             popup();  
          });
      }
    })
  .catch((err) => {
    console.log(err);
    alert("Email was not sent. It may be due to an internal error. Please try again later.");
  });

  }
  return (
    <div className="contact-us-wrapper">
      <Navbar/>
        <div className='move'>
      <div className="contact-us-header">
        <h1 className='contact-us'>Contact Us</h1>
      </div>
      <form className="contact-us-form">
        <div className="contact-us-inputs">
          <label htmlFor="name">Your Name</label>
          <input type="text" name="name" id="name" placeholder="Enter your name" value = {name} required
          onChange = {(e) => setName(e.target.value)}/>
          <label htmlFor="contactUs_email">Your Email</label>
          <input type="email" name="contactUs_email" id="contactUs_email" placeholder="Enter your email" value = {email} required
          onChange = {(e) => setEmail(e.target.value)}/>
        </div>
        <label style={{fontWeight:"bold"}} htmlFor="message">Your Message</label>
        <div className={popupStyle}>
                    
                    <button className='button12' onClick={closeItem}>
                    <BsXCircleFill style={style}/>
                    </button>
                    <div className='talk2'>     
                    <h3>Email sent successfully</h3>
                </div>
                </div>
        <textarea name="message" id="message" required cols="60" rows="10" placeholder="What can we help you with?" value = {message}
          onChange = {(e) => setMessage(e.target.value)}></textarea>
        <button className='button13' type="submit" name="submit" onClick = {handleSubmit}>Send your message</button>
      </form>
      <div className='left1'>
      </div>
      </div>
    </div>
  );
}
