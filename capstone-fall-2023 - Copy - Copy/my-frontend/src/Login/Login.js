import React, {useState} from 'react'
import '../CSS/login.css';
import { BsXCircleFill } from 'react-icons/bs';
import { NavLink } from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from '../CSS/logo.png'

export const Login = () => {
  toast.dismiss();
  localStorage.setItem("notificationslength", 0);

    const [popupStyle, showPopup] = useState("hide")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [active, setActive] = useState(false);
    const navigate = useNavigate();
    const handleSubmit =(e) =>
    {
      e.preventDefault();
      fetch("http://localhost:5000/users/login",{
        method:"POST",
        crossDomain: true,
        headers:{
          "Content-Type":"application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body:JSON.stringify({
          "usernameOrEmail":username,
          "password":password
        })
      }).then((res) => {
      if (res.status === 200) {
            res.json().then((data) => {       
               // console.log(data);
                console.log("Login Successful"); 
                //console.log(data.user);
                localStorage.setItem("id",data.user._id);  
                localStorage.setItem("token", data.token);     
                navigate('/home');
            });
        }
        
        else {
            console.log(res);
            popup();
            return;
        }
    }).catch(error => {
        console.log(error);
      });
    }
    function closeItem(e) {
      e.preventDefault();
      setActive(false);
      showPopup("hide");
    }
    function openItem() {
      setActive(false);
    }

    const popup = () => {
        showPopup("login-popup")
        openItem();
    }
  return (
    <div className='split'>
        
        <div className='split left'>
          <p></p>
        </div>
        <div className='split right' >
              <form className='cover2' onSubmit={handleSubmit}>
            <div className='cover'>
                <h1>Welcome back!</h1>
                <h1>Login</h1>
                
                <label className='label'>Username  </label>

                <input htmlFor="username" className="input" type="text" placeholder="user123" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}/>
              
               <label className='label' >Password</label>
                <input htmlFor="password" className='input'   type="password" placeholder="u1234!" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
                
                <button type='submit' className='submit'>Login</button>
                <p className='create'>
                    <NavLink to="/sign">Create an account!</NavLink>
                  </p>
                  
                    <div className={popupStyle}>
                    
                    <button className='button' onClick={closeItem}>
                    <BsXCircleFill className='closebutton' size={25}/>
                    </button>
                    <div className='talk'>     <h3>Login Failed</h3>
                <p>Username or Password incorrect</p>
                </div>
            </div>
            </div>
            </form>
            
            </div>
    </div>
  )
}
