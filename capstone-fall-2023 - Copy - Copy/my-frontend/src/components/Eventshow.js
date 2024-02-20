import React, { useEffect, useState } from "react";
import { CContainer } from "@coreui/react";
import "../CSS/card.css";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import ReviewForm from "./ReviewForm";

function Eventshow({ user, event, o, n }) {
  const id = localStorage.getItem("id");
  //o===1->creater o===2->attending o===3->check n===4->Openpopup

  const [acj, setacj] = useState("");
  const [dca, setdca] = useState("");
  const token = localStorage.getItem("token");
  const [attending, setattending] = useState(0);
  const [peopleatt, setpeopleatt] = useState("");
  const [username, setusername] = useState("");
  const [reset, setreset] = useState(0);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/attendee/attendees/event/${event._id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Include your authentication token header if required
        // 'Authorization': `Bearer ${yourAuthToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setattending(data.length);
        setpeopleatt(data);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        // Handle any errors that occurred during the fetch
      });
  }, [event]);

  useEffect(() => {
    if (user && event) {
      if (o === "1") {
        setacj("Creater");
        setdca("Delete Event");
        return ;
      }
      if (o === "2") {
        setacj("Attending");
        setdca("Remove");
        return ;
      }
      if (o === "3") {
        check();
      }
      if (n === "4") {
        setIsPopupOpen(true);
      }
    }
    function check() {
      //check if attending
      if (id === event.organizerId._id) {
        console.log(id + " " + event.organizerId);
        setacj("Creater");
        setdca("Delete Event");
        return;
      } else {
        fetch(
          `http://localhost:5000/attendee/event/attendance/${id}/${event._id}`
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Failed to check event attendance");
            }
          })
          .then((data) => {
            //console.log(data);
            setacj("Attending");
            setdca("Remove");
          })
          .catch((error) => {
            console.error("Fetch error:", error);
            // Handle the error as needed
          });
      }
      if (acj === "") {
        setacj("Join");
        setdca("");
      }
    }
  }, [o, user, event]);

  useEffect(() => {
    if (attending > 0 && reset === 0) {
      peopleatt.map((att) => {
        setusername((prev) => [...prev, att.userId.username]);
        setreset(1);
      });
    }
  }, [peopleatt, reset]);

  const join = () => {
    if (acj === "Join") {
      console.log("join");
      fetch("http://localhost:5000/attendee/attendees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: id,
          eventId: event._id,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to create attendee");
          }
        })
        .then((data) => {
          console.log("Attendee created:", data);
          setacj("Attending");
          setdca("Remove");
        })
        .catch((error) => {
          console.error("Create attendee error:", error);
        });
    }
  };

  const remove = () => {
    if (acj === "Creater") {
      console.log("Delete Event");

      fetch(`http://localhost:5000/events/delete-event/${id}/${event._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // Replace with your user's authentication token
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status === 404) {
            throw new Error("Event not found");
          } else if (response.status === 403) {
            throw new Error("Unauthorized to delete this event");
          } else {
            throw new Error("Event deletion failed");
          }
        })
        .then((data) => {
          console.log("Event deleted:", data);
          window.location.reload();
        })
        .catch((error) => {
          console.error("Delete event error:", error);
          // Handle the error, e.g., display an error message to the user
        });
    }
    if (acj === "Attending") {
      console.log("Delete Attending");

      fetch("http://localhost:5000/attendee/deleteattendees", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: id,
          eventId: event._id,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status === 404) {
            throw new Error("Attendee not found");
          } else {
            throw new Error("Failed to delete attendee");
          }
        })
        .then((data) => {
          console.log("Attendee deleted:", data);
          setacj("Join");
          setdca("");
        })
        .catch((error) => {
          console.error("Delete attendee error:", error);
        });
    }
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };


  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <CContainer className="card1" fluid lg>
        <div>
          <div onClick={openPopup}>
            {event.eventPic ? (
              <img
                src={`http://localhost:5000/api/events-pics/${event.eventPic}`}
                alt=""
                className="profile-cover"
              />
            ) : (
              ""
            )}
            <h1
              style={{ display: "flex", flexWrap: "wrap", marginLeft: "-5%" }}
            >
              <div>
                <img
                  src={`http://localhost:5000/api/profile-pics/${user.profilePic}`}
                  alt=""
                  className="profile-avatar1"
                />
              </div>
              {user.username}
            </h1>
            <h2>{event.eventName}</h2>
            <h3>{attending} people are attending</h3>
          </div>
          <Popup open={isPopupOpen} closeOnDocumentClick onClose={closePopup}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CContainer className="card1" fluid lg>
                <div>
                  <div onClick={openPopup}>
                    {event.eventPic ? (
                      <img
                        src={`http://localhost:5000/api/events-pics/${event.eventPic}`}
                        alt=""
                        className="profile-cover"
                      />
                    ) : (
                      ""
                    )}
                    <h1>
                      <img
                        src={`http://localhost:5000/api/profile-pics/${user.profilePic}`}
                        alt=""
                        className="profile-avatar1"
                      />
                      {user.username}
                    </h1>
                    <h2>{event.eventName}</h2>
                  </div>
                  <div>
                    <h3>{attending} people are attending</h3>
                  </div>
                </div>
                <p>
                  Location:{" "}
                  {(event.eventLocation.coordinates === 0,
                  0 ||
                    event.eventLocation === undefined ||
                    event.eventLocation.coordinates[0] === null ||
                    event.eventLocation.coordinates.length === 0 ||
                    (event.eventLocation.coordinates[0] === 0 &&
                      event.eventLocation.coordinates[1] === 0))
                    ? "Online"
                    : event.eventLocation.coordinates}
                </p>
                <p>Date: {event.eventDate.slice(0, 10)}</p>
                <p>Type: {event.eventType}</p>
                <div className="description">
                  <p>{event.description}</p>
                </div>
                <div>
                  {acj === "Creater" || acj === "Attending" ? (
                    <div>
                      <button className="button14" onClick={join}>
                        {acj}
                      </button>
                      {dca === "" ? (
                        ""
                      ) : (
                        <button className="button15" onClick={remove}>
                          {dca}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <button className="button14" onClick={join}>
                        {acj}
                      </button>
                      {dca === "" ? (
                        ""
                      ) : (
                        <button className="button15" onClick={remove}>
                          {dca}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <br/>
                <div>
  {attending > 0 ? <h4>People attending the event are:</h4> : ""}
  <div style={{ display: "flex", flexWrap: "wrap", marginLeft:"2%" }}>
    
    {Array.isArray(username)
      ? username.map((user, index) => (
          <p key={index}>
            {user}
            {index !== username.length - 1 ? ", " : ""}
            &nbsp;
          </p>
        ))
      : ""}
  </div>
</div>

              </CContainer>
            </div>
            <div>
              <ReviewForm eventId={event._id} />
            </div>
            <br />
            <button className="button4" onClick={closePopup}>
              Close
            </button>
            <br />
          </Popup>
        </div>
        <p>
          Location:{" "}
          {(event.eventLocation.coordinates === 0,
          0 ||
            event.eventLocation === undefined ||
            event.eventLocation.coordinates[0] === null ||
            event.eventLocation.coordinates.length === 0 ||
            (event.eventLocation.coordinates[0] === 0 &&
              event.eventLocation.coordinates[1] === 0))
            ? "Online"
            : event.eventLocation.coordinates}
        </p>
        <p>Date: {event.eventDate.slice(0, 10)}</p>
        <p>Type: {event.eventType}</p>
        <div className="description">
          <p>{event.description}</p>
        </div>
        <div>
          {acj === "Creater" || acj === "Attending" ? (
            <div>
              <button className="button14" onClick={join}>
                {acj}
              </button>
              {dca === "" ? (
                ""
              ) : (
                <button className="button15" onClick={remove}>
                  {dca}
                </button>
              )}
            </div>
          ) : (
            <div>
              <button className="button14" onClick={join}>
                {acj}
              </button>
              {dca === "" ? (
                ""
              ) : (
                <button className="button15" onClick={remove}>
                  {dca}
                </button>
              )}
            </div>
          )}
        </div>
      </CContainer>
    </div>
  );
}

export default Eventshow;
