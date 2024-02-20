import React, { useState, useEffect, useRef } from "react";
import "../CSS/chatcont.css";
import { FiPaperclip } from "react-icons/fi";
import axios from "axios";

function Chatcont({ currentChatuser }) {
  const scrollRef = useRef(null);
  const [message, setmessage] = useState([]);
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const [input, setinput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [groupacc, setgroupacc] = useState([]);

  const [inacc, setinacc] = useState(true);


  useEffect(()=>{
    if(id!== undefined|| id!==null){
    fetch(`http://localhost:5000/notifications/notifications/markreadmessage/${id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to mark notifications as read');
    }
  })
  .then((data) => {
    console.log(data.message); // Success message
  })
  .catch((error) => {
    console.error('Fetch error:', error);
    // Handle any error that occurred during the fetch
  });
}
  },[id])


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);

  useEffect(() => {
    if (currentChatuser.Sender !== undefined && inacc) {
      axios
        .get(
          `http://localhost:5000/users/getuser/${currentChatuser.Sender}`,
          {}
        )
        .then((res) => {
          return res.data;
        })
        .then((data) => {
          setgroupacc((prev) => [...prev, data]);
        })
        .catch((err) => {
          console.log(err);
        });
      //   console.log(currentChatuser.Receiver);
      currentChatuser.Receiver.map((el) => {
        //    console.log(1);
        axios
          .get(`http://localhost:5000/users/getuser/${el}`, {})
          .then((res) => {
            return res.data;
          })
          .then((data) => {
            setgroupacc((prev) => [...prev, data]);
          })
          .catch((err) => {
            console.log(err);
          });
      });
      setinacc(false);
    }
  }, [groupacc, currentChatuser, inacc]);

  useEffect(() => {
    if (currentChatuser.Name !== undefined) {
      axios
        .get(
          `http://localhost:5000/message/get/chat/msg/group/${currentChatuser._id}`
        )
        .then((res) => {
          return res.data;
        })
        .then((data) => {
          data[data.length] = { Name: currentChatuser.Name };
          setmessage(data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios
        .get(
          `http://localhost:5000/message/get/chat/msg/${id}/${currentChatuser._id}`
        )
        .then((res) => {
          return res.data;
        })
        .then((data) => setmessage(data))
        .catch((err) => {
          console.log(err);
        });
    }
  }, [id, currentChatuser, message]);

  const sendmsg = (e) => {
    e.preventDefault();
    if (input !== "" || attachment !== null) {
      const messages = {
        myself: true,
        message: input,
        attachment: attachment,
      };

      const formData = new FormData();
      formData.append("from", id);
      formData.append("message[myself]", true);
      formData.append("message[message]", input);
      formData.append("attachment", attachment);

      if (currentChatuser._id) {
        formData.append("to", currentChatuser._id);
        formData.append("Name", currentChatuser.Name);
      } else {
        formData.append("to", currentChatuser._id);
      }
      if (currentChatuser._id) {
        if (attachment !== null || attachment !== undefined) {
          axios
            .post(`http://localhost:5000/message/msg`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((res) => {
              return res.data;
            })
            .then((data) => {
              setinput("");
              setAttachment(null);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          axios
            .post(`http://localhost:5000/message/msg`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((res) => {
              setmessage(message.concat(messages));
              setinput("");
            })
            .catch((err) => {
              console.log(err);
            });
        }
      } else {
        if (attachment !== null || attachment !== undefined) {
          axios
            .post(`hhttp://localhost:5000/message/msg`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((res) => {
              setAttachment(null);
              return res.data;
            })
            .then((data) => {
              setinput("");
              setAttachment(null);
              console.log(data);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          axios
            .post(`http://localhost:5000/message/msg`, formData)
            .then((res) => {
              setmessage(message.concat(messages));
              setinput("");
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
    }
  };


  return (
    <div>
      <div className="MainChatCont">
      <form onSubmit={sendmsg}>
        <div>
          <p>
            <br></br>
          </p>
          <div
            style={{
              display: "flex",
              padding: "1%",
              paddingLeft: "2%",
              backgroundColor: "var(--color1)",
              color: "white",
            }}
          >

            {currentChatuser.profilePic!==undefined ?
            <img
                              src={`http://localhost:5000/api/profile-pics/${currentChatuser.profilePic}`}
                              className="profile-avatar3"
                              style={{borderColor:"var(--color2)"}}
              alt=""
            />
:""}
            {message.length !== 0 &&
            message[message.length - 1].Name === currentChatuser.Name &&
            message[message.length - 1].Name !== undefined ? (
              <div style={{ marginLeft: "1%", fontSize: "x-large" }}>
                <p>{currentChatuser.Name}</p>
                <div style={{ display: "flex", fontSize: "5" }}>
                  {groupacc.map((item) => (
                    <p>{item.username}&ensp;</p>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginLeft: "1%", marginTop:"1.25%", fontSize: "x-large" }}>
                <p>{currentChatuser.username}</p>
                <p>{currentChatuser.Country_of_Origin}</p>
                <p>{currentChatuser.Accountype}</p>
              </div>
            )}
          </div>
          <div className="msgcont">
            {message.map((item) => (
              <div ref={scrollRef}>
                {message.length !== 0 &&
                message[message.length - 1].Name === currentChatuser.Name &&
                message[message.length - 1].Name !== undefined ? (
                  item.Sender !== id ? (
                    <div>
                      {groupacc
                        .filter((user) => user._id === item.Sender)
                        .map((user) => (
                          <div className="messagesender">
                            <div className="paragraphtext">
                              <img
                              src={`http://localhost:5000/api/profile-pics/${user.profilePic}`}
                              style={{
                                  width: "100%",
                                  background: "none",
                                  margin: "2%",
                                }}
                                alt=""
                                
                              />
                              
                              <p >
                                {user.username}
                              </p>
                              </div>
                            <p
                              className="messagesentother"
                              style={{ marginLeft: "5%" }}
                            >
                              {item?.message}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="messageisent">
                      <p className="messageisenttext">{item?.message}</p>
                    </div>
                  )
                ) : item.myself === false ? (
                  <div className="messagesender">
                    <img
                              src={`http://localhost:5000/api/profile-pics/${currentChatuser.profilePic}`}
                              style={{ width: "8%", background: "none", margin: "2%" }}
                      alt=""
                    />
                    <p className="messagesentother">{item?.message}</p>
                  </div>
                ) : (
                  <div className="messageisent">
                    <p className="messageisenttext">{item?.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="msgSenderCont">
            <input
              type="text"
              value={input}
              onChange={(e) => setinput(e.target.value)}
              placeholder="Write yor message to your friend"
              className="inputmsg"
            />

            <button onClick={sendmsg} className="buttontext">
              Send
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}

export default Chatcont;
