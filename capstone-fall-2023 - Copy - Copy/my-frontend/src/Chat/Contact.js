import React, { useEffect, useState } from "react";
import "../CSS/contact.css";
import Navbar from "../components/Navbar";
import Chatcont from "./Chatcont";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Contact() {
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const [connections, setconnections] = useState("");
  const [accounts, setaccounts] = useState("");
  const [reset, setreset] = useState(0);
  const [search, setsearch] = useState("");
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedConnections, setSelectedConnections] = useState([]);
  const [namegroup, setNamegroup] = useState("");
  const [currentChatuser, setcurrentChatUser] = useState([]);

  const [group, setgroup] = useState("");
  const [groupacc, setgroupacc] = useState("");

  toast.dismiss();

  
  //get connections
  useEffect(() => {
    if (reset === 0) {
      fetch(`http://localhost:5000/connections/list-connections/${id}`, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setconnections(data);
          setreset(1);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    }
  }, [id, token, reset]);

  //get account info from connections
  useEffect(() => {
    if (reset === 1) {
      connections.map((connect) => {
        if (!accounts.includes(connect)) {
          fetch(`http://localhost:5000/users/getuser/${connect.userBId}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            })
            .then((data) => {
              setaccounts((accounts) => [...accounts, data]);
              setreset(2);
            })

            .catch((error) => {
              console.error("Fetch error:", error);
            });
        }
      });
    }
  }, [id, token, reset]);

  useEffect(() => {
    fetch(`http://localhost:5000/group/get-group/${id}`)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 204) {
          // Handle the case when no connection is found
          console.log("No Connection Found");
        } else {
          throw new Error("Failed to fetch data");
        }
      })
      .then((data) => {
        setgroup(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle the error
      });
  }, [id]);

  function searching() {
    if (search !== "") {
      const searchResults = accounts.filter((item) => item.username === search);
      setResults(searchResults);
    }
  }

  const handleaccounts = (e) => {
    setcurrentChatUser(e);
  };

  function SearchResults({ results }) {
    return (
      <div>
        {results.map((item) => (
          <center>
            <div className="UserCont">
              <img
                              src={`http://localhost:5000/api/profile-pics/${item.profilePic}`}
                              onClick={(e) => handleaccounts(item)}
                className="Chatuserimage"
                alt=""
              />
              <div className="usertext1">
                <p
                  style={{
                    textAlign: "start",
                    marginTop: "13%",
                    fontSize: "large",
                  }}
                >
                  {item.username}
                </p>
                <p
                  style={{
                    textAlign: "start",
                    marginTop: "0px",
                    fontSize: "medium",
                  }}
                >
                  Open your messages
                </p>
              </div>
            </div>
          </center>
        ))}
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`http://localhost:5000/group/create-group-connection/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({ Receiver: selectedConnections, Name: namegroup }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Group created:", data);
      })
      .catch((error) => {
        console.error("Error creating group:", error);
      });
    setShowModal(false);
    setNamegroup("");
    setSelectedConnections([]);
  };

  const [reset1, setreset1] = useState(true);

  useEffect(() => {
    if (reset1 && group.length !== 0) {
      group.forEach((item) => {
        if (item.Sender !== id) {
          fetch(`http://localhost:5000/users/getuser/${item.Sender}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((data) => {
              data[data.length] = item._id;
              data[data.length - 1] = item.username;
              setgroupacc((accounts) => [...accounts, data]);
            })
            .catch((err) => {
              console.log(err);
            });
        }
        item.Receiver.map((item1) => {
          fetch(`http://localhost:5000/users/getuser/${item1}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => {
              if (response.ok) {
                return response.json(); // Parse the response as JSON
              } else {
                throw new Error("Network response was not ok");
              }
            })
            .then((data) => {
              setgroupacc((accounts) => [...accounts, data]);
            })
            .catch((err) => {
              console.log(err);
            });
        });
      });
      setreset1(false);
    }
  }, [group, reset1, id]);

  const screenHeight = window.innerHeight*0.72;


  return (
    <div>
      <Navbar />
      <div>
        <div className="mainContactContainer">
          <div style={{ padding: "2%" }}>
            <div>
              <input
                className="searchforcontact"
                value={search}
                onChange={(e) => setsearch(e.target.value)}
                type="search"
                placeholder="Search your Connections"
              />
              <button className="buttontext1" onClick={searching}>
                Search
              </button>
            </div>

            <button
              className="buttontext1"
              style={{ backgroundColor: "#b2cdd8" }}
              onClick={() => setShowModal(true)}
            >
              Create a Group
            </button>
            <SearchResults results={results} />
            {showModal && (
              <div className="modal">
                <div className="modal-content">
                  <form>
                    <h2>Create a New Group</h2>
                    <div>
                      <input
                        className="groupname"
                        type="text"
                        placeholder="Group Name"
                        value={namegroup}
                        onChange={(e) => setNamegroup(e.target.value)}
                      />
                      {accounts.map((item) => (
                        <div style={{ display: "flex" }} key={item._id}>
                          <input
                            type="checkbox"
                            id={item._id}
                            name={item.username}
                            value={item._id}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedConnections((prev) => [
                                  ...prev,
                                  e.target.value,
                                ]);
                              } else {
                                setSelectedConnections((prev) =>
                                  prev.filter((id) => id !== e.target.value)
                                );
                              }
                            }}
                          />

                          <label htmlFor={item._id} style={{ width: "100%" }}>
                            <div className="UserCont">
                              <img
                              src={`http://localhost:5000/api/profile-pics/${item.profilePic}`}
                              className="profile-avatar5"
                                alt=""
                              />
                              <div className="usertext2">
                                <p
                                  style={{
                                    textAlign: "start",
                                    marginTop: "13%",
                                  }}
                                >
                                  {item.username}
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="buttontext1"
                      onClick={handleSubmit}
                    >
                      Create Group
                    </button>
                  </form>

                  <button
                    className="buttontext1"
                    style={{ backgroundColor: "#b2cdd8" }}
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}


            {results.length === 0 && (
              <div className="userDetailsCont" style={{height:screenHeight}}>
                
                {Array.isArray(group)
                  ? group.map((item) => (
                      <div>
                        {item?._id !== id ? (
                          <center>
                            <div className="UserCont">
                            
                              <img
                              src={`http://localhost:5000/api/profile-pics/${item.profilePic}`}
                              
                                onClick={(e) => handleaccounts(item)}
                                className="profile-avatar6"
                                alt=""
                              />
                        
                              <div className="usertext1">
                                <p
                                  style={{
                                    textAlign: "start",
                                    marginTop: "13%",
                                    fontSize: "large",
                                  }}
                                >
                                  {item.Name}
                                </p>

                                <p
                                  style={{
                                    textAlign: "start",
                                    marginTop: "0px",
                                    fontSize: "medium",
                                  }}
                                >
                                  Open your messages
                                </p>
                              </div>
                            </div>
                          </center>
                        ) : (
                          ""
                        )}
                      </div>
                    ))
                  : ""}
                {Array.isArray(accounts)
                  ? accounts.map((item) => (
                      <div>
                        {item?._id !== id ? (
                          <center>
                            <div className="UserCont">
                              <img
                              src={`http://localhost:5000/api/profile-pics/${item.profilePic}`}

                                onClick={(e) => handleaccounts(item)}
                                className="profile-avatar6"
                                alt=""
                              />
                              <div className="usertext1">
                                <p
                                  style={{
                                    textAlign: "start",
                                    marginTop: "13%",
                                    fontSize: "large",
                                  }}
                                >
                                  {item.username}
                                </p>
                                <p
                                  style={{
                                    textAlign: "start",
                                    marginTop: "0px",
                                    fontSize: "medium",
                                  }}
                                >
                                  Open your messages
                                </p>
                              </div>
                            </div>
                          </center>
                        ) : (
                          ""
                        )}
                      </div>
                    ))
                  : ""}
              </div>
            )}
          </div>

          
        </div>
      </div>
      {currentChatuser !== "" ? (
      <Chatcont currentChatuser={currentChatuser} />

          ) : (
            <div>
              <h2 style={{ color: "#404040", padding: "2%" }}>
                &ensp;&ensp;&ensp;Open Your Messages Tab to chat with your
                connections
              </h2>
            </div>
          )}
    </div>
  );
}

export default Contact;
