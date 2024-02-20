import React, {useEffect, useState} from "react";
import { FaUserFriends, FaSearch, FaUser} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from 'react-icons/fi';
import '../CSS/nav.css'
import { AiFillMessage } from 'react-icons/ai';
import { FaBell } from 'react-icons/fa';



const Navbar = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");

    const userid=localStorage.getItem("id");
    //const [length,setlength]=useState("");
  
    const length=localStorage.getItem("notificationslength");
   
    console.log(length);

    function sendid(){
      localStorage.setItem("accountid",userid);
      console.log("id");
    }

    function logout(){
      localStorage.clear();
      navigate('/');
    }
    function handleSearch() {
      console.log(searchText);
       localStorage.setItem("search", searchText);
       navigate('/search');
    }

      const horizontalFlip = {
        transform: 'scaleX(-1)',
      };
    return (
        <nav className="navbar">
      <ul className="navbar__list">
        <li className="navbar__item">
          <a href="/home" className="navbar__link">
            <span className="navbar__text">Home</span>
          </a>
        </li>

        <li className="hide-sm navbar__item">
          <a href="/about" className="navbar__link">
            <span className="navbar__text">About Us</span>
          </a>
        </li>
        <li className="hide-sm navbar__item">
          <a href="/contact" className="navbar__link">
            <span className="navbar__text">Contact Us</span>
          </a>
        </li>

        <li className="hide-sm navbar__item">
          <form className="navbar__form">
            <input
              type="text"
              placeholder="Search..."
              className="navbar__input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button type="submit" className="navbar__button" onClick={handleSearch} 
            >
              <FaSearch className="navbar__search-icon" />
            </button>
          </form>
        </li>

        <li className="navbar__item">
          <a href="/network" className="navbar__link">
            <FaUserFriends className="navbar__icon" />
          </a>
        </li>


        <li className="navbar__item">
          <a href="/chat" className="navbar__link">
            <AiFillMessage style={horizontalFlip} size={25} className="navbar__icon" />
          </a>
        </li>
        <li className="navbar__item">
          <a href="/notify" className="navbar__link">
            <FaBell className="navbar__icon" />
            <p className="length">{length}</p>
          </a>
        </li>


        <li className="navbar__item">
          <a href={`/profile`} className="navbar__link">
            <FaUser className="navbar__icon" onClick={sendid}/>

          </a>
        </li>

        
        <li className="hidesm navbar__item">
          <div className="navbar__link" onClick={logout}>
            <FiLogOut className="navbar__icon"/>
          </div>
        </li>

      </ul>
    </nav>
  )
}
export default Navbar;

