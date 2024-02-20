import React, { useState } from "react";
import "../CSS/login.css";
import { BsXCircleFill } from "react-icons/bs";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Signup = () => {
  const [popupStyle, showPopup] = useState("hide");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [active, setActive] = useState(false);
  const navigate = useNavigate();
  toast.dismiss();

  function closeItem(e) {
    e.preventDefault();
    setActive(false);
    showPopup("hide");
  }


  function openItem() {
    setActive(false);
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    fetch("http://localhost:5000/users/check-existence", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        username: username,
        email: email,
      }),
    })
      .then((res) => {
        if (res.status === 200) {
          navigate('/details',{ state: { username, email, password } });
          console.log("worked");
        } else {
          res.json().then((data) => {
            event.preventDefault();
            console.log(data);
            popup();
            return;
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const popup = () => {
    showPopup("signup-popup");
    openItem();
  };

  return (
    <div>
      <div className="split left">

      </div>
      <div className="split right">
      <form className="cover2" onSubmit={handleSubmit}>
        <div className="cover">
          <h1>Welcome!</h1>
          <h2>Sign Up</h2>
          <label className="label">Enter Username</label>

          <input
            className="input"
            type="username"
            placeholder="Enter a username"
            name="username"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="label1">Enter Email</label>
          <input
            className="input"
            type="email"
            placeholder="Enter an email"
            name="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="label">Enter Password</label>
          <input
            className="input"
            type="password"
            placeholder="Enter a password"
            name="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="submit">
            SignUp
          </button>
          <p className="create">
            <NavLink to="/">Already have an account! Login</NavLink>
          </p>

          <div className={popupStyle}>
            <button className="button" onClick={closeItem}>
            <BsXCircleFill className='closebutton' size={25}/>
            </button>
            <div className="talk">
              {" "}
              <h3>Signup Failed</h3>
              <p>Username or Email already exist</p>
            </div>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
};
