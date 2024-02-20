import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./CSS/App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Login } from "./Login/Login";
import { Signup } from "./Login/Signup";
import { Details } from "./Login/Details";
import Home from "./Home";
import { ContactUs } from "./ContactUs";
import AboutUs from "./AboutUs";
import ProfilePage from "./ProfilePage";
import EditPage from "./EditPage";
import Network from "./Network";
import Search from "./Search";
import Contact from "./Chat/Contact";
import Notifications from "./Notifications";

function App() {
  const id = localStorage.getItem("id");
  const [not, setnot] = useState("");
  const [reset, setreset]=useState(0);
  const [isOn,setIsOn]=useState(false);

  useEffect(() => {
    if (id !== undefined && reset===0) {
      fetch(`http://localhost:5000/events/eventToday/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setreset(1);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          // Handle any error that occurred during the fetch
        });
    }
  }, [id,reset,isOn]);

  useEffect(() => {
    if (id !== undefined && reset===0) {
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

    const interval = setInterval(() => {
      console.log(1);
      if (id !== undefined  &&isOn) {
        fetch(
          `http://localhost:5000/notifications/notifications/unread/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            localStorage.setItem("notificationslength", data.length);

            if(data.length!==0){
            console.log(0);


            if (not === "") {
              console.log(not);
              //const updatedNot = [...not, data];
              setnot(data);

              console.log(1);
              //   console.log(not);
              Array.isArray(data)
                ? data.map((item) => {
                    //  console.log(item);
                    console.log("2");

                    toast.success(`${item.message}`, {
                      position: "top-right", // Set the position of the notification
                    });
                  })
                : toast.success(`${data[0].message}`, {
                    position: "top-right", // Set the position of the notification
                  });
              //console.log(not);
              return;
            }

            let isDuplicate = true;

            for (const item of not) {
              if (item._id === data[data.length - 1]._id) {
                // console.log("a");
                isDuplicate = false;
              }
            }
          
            console.log(data);

            if (isDuplicate) {
              const updatedNot = [...not, data[data.length - 1]];
              setnot(updatedNot);
              console.log("3");
              //console.log(data);
              //        console.log(not);

              toast.success(`${data[data.length - 1].message}`, {
                position: "bottom-center", // Set the position of the notification
              });
              isDuplicate = false;
            }

            if (data.length !== not.length) {
              console.log("5");
              setnot(data);
            }
          }
          })
          .catch((error) => {
            console.error("Fetch error:", error);
          });
      }
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [id, not, isOn]);

  function handleClick(e) {
    e.preventDefault();
    console.log("click");
    window.location.href = "notify";
    toast.dismiss();
  }

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/sign" element={<Signup />}></Route>
          <Route path="/details" element={<Details />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/profile" element={<ProfilePage />}></Route>
          <Route path="/edit" element={<EditPage />}></Route>
          <Route path="/network" element={<Network />}></Route>
          <Route path="/search" element={<Search />}></Route>
          <Route path="/chat" element={<Contact />}></Route>

          <Route path="/notify" element={<Notifications />}></Route>

          <Route path="/contact" element={<ContactUs />}></Route>
          <Route path="/about" element={<AboutUs />}></Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer style={{marginTop:"6rem"}} onClick={handleClick} />
    </div>
  );
}

export default App;
