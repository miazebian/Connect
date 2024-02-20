import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Eventshow from "./components/Eventshow";
import { useNavigate, useLocation } from "react-router-dom";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import axios from "axios";
import "./CSS/home.css";
import { SlCalender } from "react-icons/sl";
import { FaRegImage } from "react-icons/fa6";
import { BsXCircleFill } from "react-icons/bs";
import cover from "./CSS/cover.png";

function Home() {
  const id = localStorage.getItem("id");

  const [user, setUser] = useState("");
  const [idevents, setidevents] = useState("");
  const token = localStorage.getItem("token");
  const [attendingevents, setattending] = useState("");
  const [attendingevents1, setattending1] = useState("");
  const [recommended, setrecommended] = useState("");
  const [recommend, setrecommend] = useState("");
  const [backgroudPic, setbackgroundPic] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/users/getuser/${id}`)
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

    fetch(`http://localhost:5000/events/list-management-events/${id}`, {
      method: "GET",
      headers: {
        Authorization: `${token}`,
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
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        // Handle any error that occurred during the fetch
      });
  }, [id, token]);

  useEffect(() => {
    if (attendingevents1 === "") {
      fetch(`http://localhost:5000/attendee/events/attending/user/${id}`, {
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
            // console.log(data);
            setattending1(data);
          }
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          // Handle any error that occurred during the fetch
        });
    } else {
      const updatedAttendingEvents = []; // Create a new array to store updated event objects
      attendingevents1.forEach((event) => {
        // Fetch organizer information for each event
        fetch(
          `http://localhost:5000/users/getuser/${event.eventId.organizerId}`
        )
          .then((response) => response.json())
          .then((organizerData) => {
            event.organizerInfo = organizerData;
            updatedAttendingEvents.push(event); // Push the updated event to the new array

            if (updatedAttendingEvents.length === attendingevents1.length) {
              setattending(updatedAttendingEvents);
            }
          })
          .catch((error) => {
            console.error("Fetch error:", error);
          });
      });
    }
  }, [id, token, attendingevents1]);

  //console.log(attendingevents);

  const [lat, setlat] = useState("");
  const [lon, setlon] = useState("");
  const [near, setnear] = useState("");
  const [near1, setnear1] = useState("");
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function (position) {
      setlat(position.coords.latitude);
      setlon(position.coords.longitude);
      //setlat(0);
      //setlon(0);
      console.log(lat);
      console.log(lon);
      if (lat !== "" && lon !== "") {
        if (near === "") {
          fetch(
            `http://localhost:5000/events/find-nearby-events/${id}?latitude=${lat}&longitude=${lon}`
          )
            .then((response) => {
              if (response.ok) {
                return response.json(); // Parse the response body as JSON
              } else {
                throw new Error("Request failed");
              }
            })
            .then((data) => {
              setnear(data.nearbyEvents);
            })
            .catch((error) => {
              console.error("Fetch error:", error);
            });
        } else {
          const updatedAttendingEvents1 = []; // Create a new array to store updated event objects
          near.map((event) => {
            // Fetch organizer information for each event
            fetch(`http://localhost:5000/users/getuser/${event.organizerId}`)
              .then((response) => response.json())
              .then((organizerData) => {
                event.organizerInfo = organizerData;
                updatedAttendingEvents1.push(event); // Push the updated event to the new array

                if (updatedAttendingEvents1.length === near.length) {
                  setnear1(updatedAttendingEvents1);
                }
              })
              .catch((error) => {
                console.error("Fetch error:", error);
              });
          });
        }
      }
    });
  }, [lat, lon, id, near]);

  const eventType = [
    "Software Development",
    "Data Science",
    "UX/UI Design",
    "Digital Marketing",
    "Project Management",
    "Network Administration",
    "Tech",
    "Medicine",
    "HR",
    // Add more career fields as needed
  ];

  // State to manage the selected career field
  const [selectedField, setSelectedField] = useState("");
  const [eventName, setEventName] = useState("");
  const [lat1, setlat1] = useState("");
  const [lon1, setlon1] = useState("");

  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const handleFieldChange = (event) => {
    setSelectedField(event.target.value);
  };
  const handleSubmit = async () => {
    const formData = new FormData();

    // Append properties to the FormData object
    formData.append("eventName", eventName);
    formData.append("eventDate", new Date(`${eventDate}T${eventTime}`));

    formData.append(
      "eventLocation",
      JSON.stringify({
        type: "Point",
        coordinates: [lat1, lon1],
      })
    );

    formData.append("description", eventDescription);
    formData.append("eventType", selectedField);

    if (backgroudPic !== null) {
      formData.append("backgroundPic", backgroudPic);
    }

    //console.log([...formData], formData.entries());

    try {
      const response = await axios.post(
        `http://localhost:5000/events/create-event/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);
      //navigate('/profile');
    } catch (error) {
      console.error("Update user error:", error);
    }

    /*

    fetch(`http://localhost:5000/events/create-event/${id}`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `${token}`,
      },
      
    })
      .then((res) => {
        if (res.status === 201) {
          res.json().then((data) => {
            console.log(data);

            setEventName("");
            setlat1("");
            setlon1("");
            setEventDate("");
            setEventTime("");
            setEventDescription("");
            setSelectedField("");
            window.location.reload();
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
      */
  };

  const [reset2, setreset2] = useState(0);

  useEffect(() => {
    if (reset2 === 0) {
      fetch("http://localhost:5300/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: id }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json(); // Parse the response body as JSON
          } else {
            throw new Error("Request failed");
          }
        })
        .then((data) => {
          //console.log(data);
          setreset2(1);
          setrecommended(data.recommendations);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    } else {
      if (recommended !== "" && reset2 === 1 &&        Array.isArray(recommended)
      )  {
        recommended.map((item) => {
          fetch(
            `http://localhost:5000/events/list-management-events/${item.userId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
              },
            }
          )
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              if (!recommend.includes(data)) {
                setrecommend((recommend) => [...recommend, data]);
              }
              setreset2(2);
            })
            .catch((err) => {
              console.log(err);
            });
        });
      }
    }
  }, [id, reset2]);

  //console.log(recommend);

  const handleFileChange2 = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(file);
      setbackgroundPic(file);
    }
    const input = e.target;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const previewImage = document.getElementById("previewImage");
        previewImage.src = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  const [selectedOption, setSelectedOption] = useState(""); // State to manage the selected option

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    if (selectedOption === "Online") {
      setlon1(0);
      setlat1(0);
    }
  };

  return (
    <div>
      <Navbar />
      <div>            <div className="center">

        <Popup
          trigger={
              <div className="createEvent2">
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  <img
                    src={`http://localhost:5000/api/profile-pics/${user.profilePic}`}
                    alt=""
                    className="profile-avatar3"
                  />
                  <input className="createEvent" value="Create an Event" />
                </div>
                <div className="icon">
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    <FaRegImage size={20} />
                    <p className="h">Media</p>

                    <SlCalender className="icon1" size={20} />
                    <p className="h">Event</p>
                  </div>
                </div>
              </div>
          }
          modal
          nested
        >
          {(close) => (
            <div className="popupcreate">
              <button className="button2" onClick={close}>
                <BsXCircleFill className="closebutton" size={25} />
              </button>
              <div className="center"> Create An Event</div>

              <div className="content">
                <div>
                  <center>
                  <div className="image-input ">
                    <label for="backgroundPic">
                      <input
                        type="file"
                        id="backgroundPic"
                        name="backgroundPic"
                        accept="image/*"
                        onChange={handleFileChange2}
                      />
                      <img
                        src={cover}
                        id="previewImage"
                        alt="Background Image"
                        class="image-preview"
                      />
                    </label>
                  </div>
                  </center>
                  <div className="input-cont">
                    <label className="label2" htmlFor="eventName">
                      Event Name:
                    </label>
                    <input
                      type="text"
                      id="eventName"
                      className="input5"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="input-cont">
                  <label className="label2" htmlFor="careerField">
                    Choose the Event Type:
                  </label>
                  <select
                    id="careerField"
                    className="input5"
                    value={selectedField}
                    onChange={handleFieldChange}
                  >
                    <option value="">Select a field</option>
                    {eventType.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-cont">
                  <label className="label2" htmlFor="eventLocation">
                    Event Location:
                  </label>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      marginLeft: "5%",
                    }}
                  >
                    <label>
                      <input
                        type="radio"
                        value="Online"
                        checked={selectedOption === "Online"} // Check if "This" is selected
                        onChange={handleOptionChange}
                      />
                      Online
                    </label>
                    <p style={{ marginLeft: "10%" }}></p>
                    <label>
                      <input
                        type="radio"
                        value="In"
                        checked={selectedOption === "In"} // Check if "That" is selected
                        onChange={handleOptionChange}
                      />
                      In Person
                    </label>
                  </div>

                  {selectedOption === "In" ? (
                    <div>
                      <br />

                      <label className="label2">Enter Coordinates:</label>
                      <br />
                      <input
                        type="number"
                        id="eventLocation"
                        value={lat1}
                        onChange={(e) => setlat1(e.target.value)}
                        className="input1"
                      />
                      {" , "}
                      <input
                        type="number"
                        id="eventLocation"
                        value={lon1}
                        onChange={(e) => setlon1(e.target.value)}
                        className="input1"
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                <div className="input-cont">
                  <label className="label2" htmlFor="eventDate">
                    Event Date:
                  </label>
                  <input
                    className="input5"
                    type="date"
                    id="eventDate"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div className="input-cont">
                  <label className="label2" htmlFor="eventTime">
                    Event Time:
                  </label>
                  <input
                    className="input5"
                    type="time"
                    required
                    id="eventTime"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
                <div className="input-cont">
                  <label className="label2" htmlFor="eventDescription">
                    Event Description:
                  </label>
                  <textarea
                    className="input5"
                    id="eventDescription"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    required
                  />
                </div>
                <button
                  className="button3"
                  type="submit"
                  onClick={() => {
                    handleSubmit();
                    close();
                  }}
                >
                  Create Event
                </button>
              </div>

              <div className="actions">
                <button
                  className="button3"
                  onClick={() => {
                    console.log("modal closed ");
                    close();
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Popup>
      </div>
      </div>
      <div className="home">
      <div>
        <h1 className="heading">My Events</h1>
        <br />
        {Array.isArray(idevents) ? (
          idevents.map((event) => (
            <Eventshow key={event._id} user={user} event={event} o="1" />
          ))
        ) : (
          <p className="p">No Events! Create Events</p>
        )}
      </div>

      <div>
        <h1 className="heading">Attending Events</h1>
        {Array.isArray(attendingevents) ? (
          attendingevents.map((event) => (
            <Eventshow
              key={event.eventId._id}
              user={event.organizerInfo}
              event={event.eventId}
              o="3"
            />
          ))
        ) : (
          <p className="p">Not Attending any Events</p>
        )}
      </div>

      <div>
        <h1 className="heading">Recommended Events</h1>
        {Array.isArray(recommend) && reset2 === 2 ? (
          recommend[0].map((event) => (
            <Eventshow
              key={event._id}
              user={event.organizerId}
              event={event}
              o="3"
            />
          ))
        ) : (
          <p className="p">No Recommended Events</p>
        )}
      </div>

      <div>
        <h1 className="heading">Nearbye Events</h1>
        {Array.isArray(near1) ? (
          near1.map((event) => (
            <Eventshow
              key={event._id}
              user={event.organizerInfo}
              event={event}
              o="3"
            />
          ))
        ) : (
          <p className="p">No Nearbye Events</p>
        )}
      </div>
      </div>
    </div>
  );
}

export default Home;
