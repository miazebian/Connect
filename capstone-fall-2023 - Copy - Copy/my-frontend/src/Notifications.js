import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CSS/notifications.css";
import { useNavigate } from "react-router-dom";
import Eventshow from "./components/Eventshow";
import Popup from "reactjs-popup";
import { LiaToggleOnSolid } from "react-icons/lia";
import { LiaToggleOffSolid } from "react-icons/lia";



function Notifications() {
  toast.dismiss();

  const notlength = localStorage.getItem("notificationslength");
  const id = localStorage.getItem("id");
  const [unread, setUnread] = useState("");
  const [read, setRead] = useState("");
  const [reset, setreset] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [event, setevent] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    toast.dismiss();
  }, []);

  useEffect(() => {
    fetch(`http://localhost:5000/notifications/notifications/unread/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // console.log(data);
        setUnread(data);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        // Handle any error that occurred during the fetch
      });

    fetch(`http://localhost:5000/notifications/notifications/read/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        //console.log(data);
        setRead(data);
        setreset(1);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        // Handle any error that occurred during the fetch
      });
  }, [id, notlength]);



  function nav(e, type, notid, eventId) {
    e.preventDefault();
    console.log(type);
    if (type === "Comment") {
      fetch(`http://localhost:5000/events/event-details/${eventId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setevent(data);
          openPopup();
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          // Handle any errors that occurred during the fetch
        });
    }
    if (type === "Connection Request") {
      Dismiss(e, notid);
      navigate("/network");
    }
    if(type==="message"){
      navigate('/chat');
    }
  }

  function Dismiss(e, notid) {
    e.preventDefault();
    fetch(
      `http://localhost:5000/notifications/notifications/mark-read/${notid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Notification marked as read:", data);
        // Handle success or other actions as needed
        setreset(0);
      })
      .catch((error) => {
        console.error("Error marking notification as read:", error);
        // Handle error
      });
  }

  function getTimeDifference(createdAt) {
    const currentTime = new Date();
    const notificationTime = new Date(createdAt);
    const timeDifference = currentTime - notificationTime;
    const secondsDifference = Math.floor(timeDifference / 1000);

    if (secondsDifference < 60) {
      return `${secondsDifference} second${
        secondsDifference !== 1 ? "s" : ""
      } ago`;
    }

    const minutesDifference = Math.floor(secondsDifference / 60);

    if (minutesDifference < 60) {
      return `${minutesDifference} minute${
        minutesDifference !== 1 ? "s" : ""
      } ago`;
    }

    const hoursDifference = Math.floor(minutesDifference / 60);

    if (hoursDifference < 24) {
      return `${hoursDifference} hour${hoursDifference !== 1 ? "s" : ""} ago`;
    }

    const daysDifference = Math.floor(hoursDifference / 24);
    return `${daysDifference} day${daysDifference !== 1 ? "s" : ""} ago`;
  }

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const [color1,setcolor1]=useState("");
  const [color2,setcolor2]= useState("");
  const [isOn, setIsOn] = useState(true);

  useEffect(()=>{
    if(isOn){
      setcolor1("#009ec1");
     setcolor2("#028d73");
     return;
    }
    setcolor1("#3e8d97");
    setcolor2("#173548");
  },[color1,color2, isOn,id])

  useEffect(()=>{
    if(id!==undefined){

      fetch(`http://localhost:5000/notifications/user/isOn/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((response) => {
        return response.json();
      }).then((data) => {
        setIsOn(data.isOn);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
        }
  },[id]);


  const style = {
    background: `linear-gradient(to right, ${color1} 30% , #ffffff 70%`,
  };
  const style1 = {
    background: `linear-gradient(to right, #ffffff 30% , ${color2} 70%`,
  };

  const toggleSwitch = () => {

    fetch(`http://localhost:5000/notifications/user/updateIsOn/${id}/${!isOn}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      return response.json();
    }).then((data) => {
      console.log(data);
      setIsOn(!isOn);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });

    if(id!==undefined){
      fetch(`http://localhost:5000/notifications/user/isOn/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((response) => {
        return response.json();
      })
      .then((data) => {
        setIsOn(data.isOn);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
        }

  };


  return (
    <div>
      <Navbar />
      <div style={{display:"flex",flexWrap:"wrap"}} className="home">

      <h1 className="heading">Notifications</h1>

      <div style={{marginLeft:"3%"}}>
      <label className="switch">
        {isOn?
        (        <LiaToggleOnSolid size={40} checked={isOn} onClick={toggleSwitch}/>)
        :
(                <LiaToggleOffSolid size={40} checked={isOn} onClick={toggleSwitch}  />
)
        }

        <span className="slider round"></span>
      </label>
      <p>{isOn ? 'ON' : 'OFF'}</p>
    </div>


      </div>
      <div>
        <div>
          <ul>
            {Array.isArray(unread)
              ? unread.map((not) => (
                  <div key={not._id} style={style} className="cn">
                    <div className="friend-suggestion-container">
                      <div className="friend-list">
                        <div className="friend-suggestion">
                          <h2
                            className="h2not"
                            onClick={(e) =>
                              nav(e, not.type, not._id, not.eventId)
                            }
                          >
                            {not.message}
                          </h2>
                          <div className="p1">
                            <p>{getTimeDifference(not.createdAt)}</p>
                            <center>
                              <button onClick={(e) => Dismiss(e, not._id)}>
                                Dismiss
                              </button>
                            </center>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : ""}
          </ul>
        </div>

        <div>
          <ul>
            {Array.isArray(read)
              ? read.map((not) => (
                  <div key={not._id} style={style1} className="cn">
                    <div className="friend-suggestion-container">
                      <div className="friend-list">
                        <div className="friend-suggestion">
                          <h2
                            onClick={(e) =>
                              nav(e, not.type, not._id, not.eventId)
                            }
                          >
                            {not.message}
                          </h2>
                          <p className="p2">
                            {getTimeDifference(not.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : ""}
          </ul>
        </div>

        <Popup open={isPopupOpen} closeOnDocumentClick onClose={closePopup}>
          {(close) => (
            <div>
              <Eventshow user={event.organizerId} event={event} n="4" o="1" />:
              <button
                className="button"
                onClick={() => {
                  console.log("modal closed ");
                  close();
                }}
              >
                close
              </button>
            </div>
          )}
        </Popup>
      </div>
    </div>
  );
}

export default Notifications;
