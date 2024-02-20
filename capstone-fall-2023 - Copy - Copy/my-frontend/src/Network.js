import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Cardcom from "./components/Cardcom";
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";

function Network() {
  const token = localStorage.getItem("token");
  const accountid = localStorage.getItem("id");
  const [connections, setConnections] = useState([]);
  const [reset, setreset] = useState(0);
  const [reset2, setreset2] = useState(0);

  const [accounts, setaccounts] = useState("");
  const [nearbyUsers, setnearbyUsers] = useState("");
  const [recommended, setrecommended] = useState("");
  const [recommend, setrecommend] = useState("");

  const [lat, setlat] = useState("");
  const [lon, setlon] = useState("");

  useEffect(() => {
    if (reset2 === 0) {
      fetch("http://localhost:5300/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: accountid }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json(); // Parse the response body as JSON
          } else {
            throw new Error("Request failed");
          }
        })
        .then((data) => {
          console.log(data);
          setreset2(1);
          setrecommended(data.recommendations);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    } else {
      if (recommended !== "" && reset2 === 1) {
        recommended.map((item) => {
          fetch(`http://localhost:5000/users/getuser/${item.userId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
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
  }, [accountid, reset2]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function (position) {
      setlat(position.coords.latitude);
      setlon(position.coords.longitude);
      console.log(lat);
      console.log(lon);
      if (lat !== "" && lon !== "") {
        fetch(
          `http://localhost:5000/users/find-nearby-users/${accountid}?latitude=${lat}&longitude=${lon}`
        )
          .then((response) => {
            if (response.ok) {
              return response.json(); // Parse the response body as JSON
            } else {
              throw new Error("Request failed");
            }
          })
          .then((data) => {
            console.log(data);
            setnearbyUsers(data.nearbyUsers);
          })
          .catch((error) => {
            console.error("Fetch error:", error);
          });
      }
    });
  }, [navigator, lat, lon, accountid]);

  //get accepted connections
  useEffect(() => {
    if (reset === 0) {
      fetch(`http://localhost:5000/connections/list-connections/${accountid}`, {
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
          setConnections(data);
          setreset(1);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          // Handle the error or show an error message to the user
        });
    }
  }, [token, accountid, reset]);

  //get users from ids
  useEffect(() => {
    if (reset === 1) {
      connections.map((item) => {
        fetch(`http://localhost:5000/users/getuser/${item.userBId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            if (!accounts.includes(data)) {
              setaccounts((accounts) => [...accounts, data]);
            }
            setreset(2);
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }
  }, [reset]);

  //get pending connections
  const [pending, setpending] = useState("");
  const [reset1, setreset1] = useState(0);
  useEffect(() => {
    if (reset1 === 0) {
      fetch(
        `http://localhost:5000/connections/list-connection-requests-received/${accountid}`,
        {
          method: "GET",
          headers: {
            Authorization: `${token}`,
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setpending(data);
          setreset1(1);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          // Handle the error or show an error message to the user
        });
    }
  }, [reset1]);

  const [pendingacc, setpendingacc] = useState("");
  useEffect(() => {
    if (reset1 === 1) {
      pending.map((item) => {
        fetch(`http://localhost:5000/users/getuser/${item.userAId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            if (!pendingacc.includes(data)) {
              setpendingacc((accounts1) => [...accounts1, data]);
            }
            setreset1(2);
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }
  }, [reset1]);

  //every 4 cards together connections
  const usersPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  useEffect(() => {
    // Calculate the range of users to display for the current page
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = accounts.slice(startIndex, endIndex);
    setDisplayedUsers(currentUsers);
  }, [accounts, currentPage]);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  //every 4 together pending
  const usersPerPage1 = 3;
  const [currentPage1, setCurrentPage1] = useState(1);
  const [displayedUsers1, setDisplayedUsers1] = useState([]);
  useEffect(() => {
    // Calculate the range of users to display for the current page
    const startIndex1 = (currentPage1 - 1) * usersPerPage1;
    const endIndex1 = startIndex1 + usersPerPage1;
    const currentUsers1 = pendingacc.slice(startIndex1, endIndex1);

    setDisplayedUsers1(currentUsers1);
  }, [pendingacc, currentPage1]);

  const handleNextPage1 = () => {
    setCurrentPage1(currentPage1 + 1);
  };

  const handlePrevPage1 = () => {
    if (currentPage1 > 1) {
      setCurrentPage1(currentPage1 - 1);
    }
  };

  //every 4 together nearby
  const usersPerPage2 = 3;
  const [currentPage2, setCurrentPage2] = useState(1);
  const [displayedUsers2, setDisplayedUsers2] = useState([]);

  useEffect(() => {
    // Calculate the range of users to display for the current page
    const startIndex2 = (currentPage2 - 1) * usersPerPage2;
    const endIndex2 = startIndex2 + usersPerPage2;
    const currentUsers2 = nearbyUsers.slice(startIndex2, endIndex2);

    setDisplayedUsers2(currentUsers2);
  }, [nearbyUsers, currentPage2]);

  const handleNextPage2 = () => {
    setCurrentPage2(currentPage2 + 1);
  };

  const handlePrevPage2 = () => {
    if (currentPage2 > 1) {
      setCurrentPage2(currentPage2 - 1);
    }
  };

  console.log(accounts);

  return (
    <div>
      <Navbar />
      <div className="home">
        <div >
          <h1 className="heading">Recommended People</h1>
         {Array.isArray(recommend) && recommend.length>2 ?
         (<div className="center1" style={{ display: "flex", flexWrap: "wrap" }}>
         {Array.isArray(recommend) ? (
           recommend.map((user) => (
             <Cardcom key={user._id} user={user} status="check" />
           ))
         ) : (
           <p style={{ margin: "2%" }}>No accounts available</p>
         )}
       </div>)
         :(<div className="heading" style={{ display: "flex", flexWrap: "wrap" }}>
         {Array.isArray(recommend) ? (
           recommend.map((user) => (
             <Cardcom key={user._id} user={user} status="check" />
           ))
         ) : (
           <p style={{ margin: "2%" }}>No accounts available</p>
         )}
       </div>)} 
          
        </div>

        <br />
        <br />

        <div >
          <h1 className="heading">Pending Connections</h1>
          <div>
            {Array.isArray(displayedUsers1) && displayedUsers1.length>2
            ? (
              <div className="center1" style={{ display: "flex", flexWrap: "wrap" }}>            
              {Array.isArray(displayedUsers1) ? (
                displayedUsers1.map((user) => (
                  <Cardcom key={user._id} user={user} status="pending" />
                ))
              ) : (
                <p style={{ margin: "2%" }}>No accounts available</p>
              )}
            </div>):(
              <div className="heading" style={{ display: "flex", flexWrap: "wrap" }}>            
              {Array.isArray(displayedUsers1) ? (
                displayedUsers1.map((user) => (
                  <Cardcom key={user._id} user={user} status="pending" />
                ))
              ) : (
                <p style={{ margin: "2%" }}>No accounts available</p>
              )}
            </div>)}
                
          </div>
          {Array.isArray(displayedUsers1) && pendingacc.length > 3 ? (
            <div className="arrows">
                <div
                  className="leftarrow"
                  onClick={handlePrevPage1}
                  disabled={currentPage1 === 1}
                >
                  <FaAngleLeft size={40} />
                </div>

                <div
                  className="rightarrow"
                  onClick={handleNextPage1}
                  disabled={currentPage1 * usersPerPage1 >= pendingacc.length}
                >
                  <FaAngleRight size={40} />
                </div>
            </div>
          ) : (
            ""
          )}
        </div>

        <br />
        <br />

        <div>
          <h1 className="heading">Connections</h1>
          {Array.isArray(displayedUsers) && displayedUsers.length>2? (
            <div
            className="center1"
            style={{ display: "flex", flexWrap: "wrap" }}
          >
            {Array.isArray(displayedUsers) ? (
              displayedUsers.map((user) => (
                <Cardcom key={user._id} user={user} status="accepted" />
              ))
            ) : (
              <p style={{ margin: "2%" }}>No accounts available</p>
            )}
          </div>
          ):(<div
            className="heading"
            style={{ display: "flex", flexWrap: "wrap" }}
          >
            {Array.isArray(displayedUsers) ? (
              displayedUsers.map((user) => (
                <Cardcom key={user._id} user={user} status="accepted" />
              ))
            ) : (
              <p style={{ margin: "2%" }}>No accounts available</p>
            )}
          </div>)}
          

          {Array.isArray(displayedUsers) && accounts.length > 3 ? (
            <div className="arrows">
              <div
                className="leftarrow"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <FaAngleLeft size={40} />
              </div>
              <div
                className="rightarrow"
                onClick={handleNextPage}
                disabled={currentPage * usersPerPage >= accounts.length}
              >
                <FaAngleRight size={40} />
              </div>
            </div>
          ) : (
            ""
          )}
        </div>

        <br />
        <br />

        <div >
          <h1 className="heading">Nearbye People</h1>

          {Array.isArray(displayedUsers2) && displayedUsers2.length>2?
          (  <div className="center1" style={{ display: "flex", flexWrap: "wrap" }}>
          {Array.isArray(displayedUsers2) ? (
            displayedUsers2.map((user) => (
              <Cardcom key={user._id} user={user} status="check" />
            ))
          ) : (
            <p style={{ margin: "2%" }}>No accounts nearby</p>
          )}
        </div>)
          :(  <div className="heading" style={{ display: "flex", flexWrap: "wrap" }}>
          {Array.isArray(displayedUsers2) ? (
            displayedUsers2.map((user) => (
              <Cardcom key={user._id} user={user} status="check" />
            ))
          ) : (
            <p style={{ margin: "2%" }}>No accounts nearby</p>
          )}
        </div>)}

        
          {Array.isArray(displayedUsers2) && nearbyUsers.length > 3 ? (
            <div className="arrows">
              <div className="leftarrow" onClick={handlePrevPage2} disabled={currentPage2 === 1}>
              <FaAngleLeft size={40} />
              </div>
              <div
              className="rightarrow"
                onClick={handleNextPage2}
                disabled={currentPage2 * usersPerPage2 >= nearbyUsers.length}
              >
                <FaAngleRight size={40} />
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}

export default Network;
