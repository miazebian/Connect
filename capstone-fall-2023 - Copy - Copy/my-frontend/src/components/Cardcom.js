import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../CSS/card.css";
import Card from "@mui/material/Card";
import {useNavigate} from 'react-router-dom';

function Cardcom({ user, status }) {
  const [ada, setada] = useState("");
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();


  useEffect(() => {
    if (status === "accepted") {
      return setada("Connected");
    }
    if (status === "pending") {
      return setada("Accept"); // Set the initial label for the button
    }
    if(status==="check"){
      checkstatus();
    }
  }, [status]);

  const checkstatus=()=>{
    if(ada===""){
    fetch(`http://localhost:5000/connections/check-connection/${id}/${user._id}`,{ //check if connected
    method:'GET',
    headers:{
      'Authorization':`${token}`,
    },
  }).then((response) => {
    return response.json();
  })
  .then((data) => {
    console.log("connected "+user.username);
    return setada("Connected");
  })
}
  if(ada===''){
    fetch(`http://localhost:5000/connections/check-pending/${id}/${user._id}`,{//Check if pending
      method:'GET',
      headers:{
        'Authorization':`${token}`,
      },
    }).then((response) => {
      
      return response.json();
    })
    .then((data) => {
      console.log(data+" "+user.username)
      if(!data.error){
        console.log("Pending");
      return setada("Pending");
      }else{
        console.log("else "+user.username);
        return setada("Connect");
      }
    }).catch((error)=>{
      console.error('Fetch error:', error);
    })
  }
  console.log("last "+user.username);
  return setada("Connect");

  }



  const handleAccept = () => {
    console.log("accepted " + user.username);

    fetch("http://localhost:5000/connections/accept-connection-request", {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userAId: user._id, userBId: id }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Request failed");
        }
      })
      .then((data) => {
        console.log(data);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  };


  


  const handleDecline = () => {
    console.log("declined" + user.username);

    fetch("http://localhost:5000/connections/decline-connection-request", {
      method: "DELETE",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userAId: user._id, userBId: id }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Request failed");
        }
      })
      .then((data) => {
        console.log(data);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  };

  const takeprofile=()=>{
    localStorage.setItem("accountid",user._id);
    navigate("/profile");
  }

  return (
    <div className="cont">
      <Card variant="outlined" className="card">
        <center>
        <div onClick={takeprofile}>
        <img
              src={`http://localhost:5000/api/profile-pics/${user.profilePic}`}
              alt=""
              className="profile-avatar2"
            />     
            <h1>{user.username}</h1>
            <h3>{user.jobTitle}</h3>
        </div>
        {status === "pending" ? (
          <div>
            <button onClick={handleAccept}>Accept</button>
            <button onClick={handleDecline}>Decline</button>
          </div>
        ) : (
          <p>{ada}</p>
        )}
        </center>
      </Card>
    </div>
  );
}
Card.propTypes = {
  user: PropTypes.object.isRequired,
  status: PropTypes.string,
};

export default Cardcom;
