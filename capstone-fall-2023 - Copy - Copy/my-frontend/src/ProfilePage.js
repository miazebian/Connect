import React, { useEffect, useState } from "react";
import "./CSS/profile.css";
import Navbar from "./components/Navbar";
import { useNavigate } from "react-router-dom";
import Eventshow from "./components/Eventshow";
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";

function ProfilePage() {
  const accountid = localStorage.getItem("accountid");
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("id");
  const navigate = useNavigate();
  const [ce, setce] = useState("");

  const [user, setUser] = useState("");

  useEffect(() => {
    if(accountid!==undefined && accountid!==null){
    fetch(`http://localhost:5000/users/getuser/${accountid}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }}, [accountid]);

  useEffect(() => {
    if (accountid === id) {
      //My Account
      return setce("Edit Profile");
    } else {
      //Seeing someones account

      fetch(
        `http://localhost:5000/connections/check-connection/${id}/${accountid}`,
        {
          //check if connected
          method: "GET",
          headers: {
            Authorization: `${token}`,
          },
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          return setce("Connected");
        });
      if (ce === "") {
        fetch(
          `http://localhost:5000/connections/check-pending/${id}/${accountid}`,
          {
            //Check if pending
            method: "GET",
            headers: {
              Authorization: `${token}`,
            },
          }
        )
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            if (!data.error) {
              return setce("Pending");
            } else {
              return setce("Connect");
            }
          })
          .catch((error) => {
            console.error("Fetch error:", error);
          });
      }
    }
    //No sort of connection
    return setce("Connect");
  }, [accountid, id, token]);

  const [idevents, setidevents] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/events/list-management-events/${accountid}`, {
      method: "GET",
      headers: {
        Authorization: `${token}`, // Replace with your authorization token
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Handle the list of events (data) here
          //  console.log(data);
          setidevents(data);
        } else {
          // Handle the case where no events were found
          console.log("No events");
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        // Handle any error that occurred during the fetch
      });
  }, [id, token]);

  const usersPerPage1 = 1;
  const [currentPage1, setCurrentPage1] = useState(1);
  const [displayedUsers1, setDisplayedUsers1] = useState([]);
  useEffect(() => {
    console.log(idevents);
    // Calculate the range of users to display for the current page
    const startIndex1 = (currentPage1 - 1) * usersPerPage1;
    const endIndex1 = startIndex1 + usersPerPage1;
    const currentUsers1 = idevents.slice(startIndex1, endIndex1);

    setDisplayedUsers1(currentUsers1);
  }, [idevents, currentPage1]);

  const handleNextPage1 = () => {
    setCurrentPage1(currentPage1 + 1);
  };

  const handlePrevPage1 = () => {
    if (currentPage1 > 1) {
      setCurrentPage1(currentPage1 - 1);
    }
  };

  function nav1() {
    if (ce === "Edit Profile") {
      navigate("/edit");
    }
    if (ce === "Connect") {
      handleSendRequest();
    }
  }

  const handleSendRequest = () => {
    fetch(
      `http://localhost:5000/connections/send-connection-request/${id}/${accountid}`,
      {
        method: "POST",
        headers: {
          Authorization: `${token}`, // Include your token here if needed
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setce("Pending");
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  };

  const [skills, setskills] = useState([]);
  const [exp, setexp] = useState([]);

  useEffect(() => {
    if (user.skills === undefined) {
    } else {
      setskills(user.skills);
    }
    if (user.experience === undefined) {
    } else {
      setexp(user.experience);
    }
  }, [user, skills]);


 // console.log(user.backgroundPic);


  return (
    <div>
      <Navbar />
      <br></br>
      <style>
        {`
          body {
            background-color: #f0f0f0; /* Off-white color */
          }
        `}
      </style>
      <div className="profile-page">
        {/* Profile header */}
        <div className="profile-header">
          <div>{/* Cover photo */}</div>
          {user.backgroundPic!==undefined?
          <img
              src={`http://localhost:5000/api/background-pics/${user.backgroundPic}`}
              alt=""
              className="profile-cover"            />  
          : <img
          
          className="profile-cover"            />  }
          <div>

            {user.profilePic!==undefined?
            <img
              src={`http://localhost:5000/api/profile-pics/${user.profilePic}`}
              alt=""
              className="profile-avatar"
            />: <img
           
            className="profile-avatar"
          />}
          </div>
        </div>

        {/* Profile information */}
        <div className="profile-info">
          <h1>{user.firstName + " " + user.lastName}</h1>
          <p>{user.jobTitle}</p>
          <p>{user.role}</p>
          <p>{user.city + ", " + user.country}</p>
          {ce==="Edit Profile"? 
                    <button className="button6" onClick={nav1}>{ce}</button>
                    :
                              <button className="button144" onClick={nav1}>{ce}</button>

                  }
        </div>
        <div></div>
      </div>

      <div>
        <br></br>
      </div>

      <div className="profile-page">
        <div className="profile-avater">
          <h1>Events</h1>
          <h3>{idevents.length} events</h3>

          <div>
            {Array.isArray(displayedUsers1) ? (
              displayedUsers1.map((event) => (
                <Eventshow key={event._id} user={user} event={event} o="3" />
              ))
            ) : (
              <p style={{ margin: "2%" }}>No accounts available</p>
            )}
          </div>

{currentPage1>1 && currentPage1<=idevents.length-1?
        (  <div className="arrows">
            {currentPage1>1?
            (<div className="leftarrow1" onClick={handlePrevPage1} disabled={currentPage1 === 1}>
            <FaAngleLeft size={40} />
            </div>)
            :""}

            {currentPage1<=idevents.length-1?
            <div
                  className="rightarrow1"
                  onClick={handleNextPage1}
              disabled={currentPage1 === idevents.length}
            >
                  <FaAngleRight size={40} />
            </div>:""}
          </div>)
          :""}
        </div>
            
      </div>

      <div>
        <br/>
      </div>

      <div className="profile-page">
        <div className="profile-avater">
          <h1>About</h1>
          <p style={{margin:"2%"}}>{user.about}</p>
        </div>
      </div>

      <div>
        <br></br>
      </div>

      <div className="profile-page">
        <div  className="profile-avater">
          <h1>Experience</h1>
          <div style={{margin:"1%"}}>
          <h3>{user.yearsOfExperience} Years of Experience</h3>
          <h4>
            Currently a {user.jobTitle} at {user.company}
          </h4>
          <h4>{user.careerLevel}</h4>
          <br/>
          <div>
          <p style={{fontWeight:"bold"}}>Previous Experience</p>
          <ul style={{marginLeft:"1%"}}>
            {exp.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </ul>
          </div>
          </div>
        </div>
      </div>

      <div>
        <br></br>
      </div>

      <div className="profile-page">
        <div className="profile-avater">
          <h1>Education</h1>
          <h3>{user.educationLevel}</h3>
          <h3>{user.university}</h3>
          <h3>{user.academicMajor}</h3>
          <h3>{user.graduationYear}</h3>

          <p>{user.educationinfo}</p>
        </div>
      </div>

      <div>
        <br></br>
      </div>

      <div className="profile-page">
        <div className="profile-avater">
          <h1>Skills</h1>
          <div style={{ display:"flex", flexWrap:"wrap"}}>
            {skills.map((item, index) => (
              <p className="button144" key={index}>{item}</p>
            ))}
        </div>
        </div>
      </div>
      <div>
        <br></br>
      </div>
    </div>
  );
}

export default ProfilePage;
