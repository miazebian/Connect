import React, { useEffect, useRef, useState } from "react";
import "./CSS/profile.css";
import Navbar from "./components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit } from "react-icons/fa";


function EditPage() {
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("id");
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null);
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
  }, [id]);

  const [skills, setskills] = useState([]);
  const [exp, setexp] = useState([]);
  const [reset, setreset] = useState(0);

  useEffect(() => {
    if (user.skills === undefined) {
    } else {
      if (reset === 0) {
        setskills(user.skills);
        setexp(user.experience);
        setreset(1);
      }
    }
  }, [reset, user.skills, user.experience]);

  const [newSkill, setNewSkill] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleAddSkill = () => {
    // Ensure that the newSkill input is not empty
    console.log(skills);
    if (newSkill.trim() !== "") {
      const news = [...skills];
      news.unshift(newSkill);
      setskills(news);
      setNewSkill(""); // Clear the input
      setShowInput(false);
      console.log(skills);
    }
  };

  const [newexp, setNewexp] = useState("");
  const [showInput1, setShowInput1] = useState(false);
  const handleAddExp = () => {
    // Ensure that the newSkill input is not empty
    if (newexp.trim() !== "") {
      const news = [...exp];
      news.unshift(newexp);
      setexp(news);
      setNewexp(""); // Clear the input
      setShowInput1(false);
    }
  };

  useEffect(() => {
    // This effect will run whenever items change
    console.log("Items have been updated:", skills);
    console.log("Items have been updated:", exp);
  }, [skills, exp]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(file);
      setProfilePicFile(file);
    }
    const input = e.target;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const previewImage1 = document.getElementById("previewImage1");
        previewImage1.src = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

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

  const [done, setdone] = useState(0);

  const update = async (event) => {
    event.preventDefault();
    const use = { ...user, skills: skills };
    const uses1 = { ...use, experience: exp };
    const formData = new FormData();

    formData.append("updatedUser", JSON.stringify(uses1));

    //formData.append('updatedUser', uses1);
    if (profilePicFile !== null) {
      formData.append("profilePic", profilePicFile);
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/users/updateall/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);
      //navigate('/profile');
      setdone(1);
    } catch (error) {
      console.error("Update user error:", error);
    }

    if (backgroudPic !== null) {
      const formData1 = new FormData();
      formData1.append("backgroundPic", backgroudPic);

      try {
        const response = await axios.put(
          `http://localhost:5000/users/updateback/${id}`,
          formData1,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(response.data);
        navigate("/profile");
        // Handle the response as needed
      } catch (error) {
        console.error("Update user error:", error);
      }
    } else {
      if (done === 1) {
        navigate("/profile");
      }
    }
  };

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
          <div className="image-input">
            <label for="backgroundPic">

              <input
                type="file"
                id="backgroundPic"
                name="backgroundPic"
                accept="image/*"
                onChange={handleFileChange2}
              />
              {user.backgroudPic!==undefined?
              <img
                src={`http://localhost:5000/api/background-pics/${user.backgroundPic}`}
                alt=""
                id="previewImage"
                class="image-preview"
                className="profile-cover"
              /> : <img
             
              id="previewImage"
              class="image-preview"
              className="profile-cover"
            />}
              <FaEdit size={17} style={{marginLeft:"97%", marginTop:"-4%" ,display:"block", color:"white"}}/>
            </label>
          </div>

          <div className="image-input">
          <label for="profilePic">
            <br/>
            <input
              type="file"
              id="profilePic"
              name="profilePic"
              accept="image/*"
              onChange={handleFileChange}
            />
            {user.profilePic!==undefined?
            <img
              src={`http://localhost:5000/api/profile-pics/${user.profilePic}`}
              alt=""
              className="profile-avatar"
              id="previewImage1"
            />
            : <img
           
            className="profile-avatar"
            id="previewImage1"
          />}
            <FaEdit size={17} style={{marginLeft:"11.5%", marginTop:"-3.5%",display:"block", color:"white"}}/>
            </label>
          </div>
        </div>

        <br/>

        {/* Profile information */}
        <div className="profile-info">
          <h1>
            <input
              type="text"
              className="input2"
              style={{fontWeight:"bold"}}
              value={user.firstName}
              name={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            />
            <input
              type="text"
              className="input2"
              style={{fontWeight:"bold"}}
              value={user.lastName}
              name={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            />
          </h1>

          <p>
            {" "}
            <input
              type="text"
              className="input2"
              style={{width:"31%"}}
              value={user.jobTitle}
              name={user.jobTitle}
              onChange={(e) => setUser({ ...user, jobTitle: e.target.value })}
            />
          </p>
          <p>
            {" "}
            <input
              type="text"
              className="input2"
              value={user.role}
              name={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
            />
          </p>
          <p>
            <input
              type="text"
              className="input2"
              style={{width:"18%"}}
              value={user.city}
              name={user.city}
              onChange={(e) => setUser({ ...user, city: e.target.value })}
            />

            {", "}
            <input
              type="text"
              className="input2"
              style={{width:"18%"}}              
              value={user.country}
              name={user.country}
              onChange={(e) => setUser({ ...user, country: e.target.value })}
            />
          </p>
        </div>
        <div></div>
      </div>

      <div>
        <br></br>
      </div>

      <div className="profile-page">
        <div className="profile-avater">
          <h1>Edit Password</h1>
          <p>
            {" "}
            <input
            className="input2"
            style={{width:"25%", marginTop:"2%"}}              
              type="password"
              placeholder="Change password"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
          </p>
        </div>
      </div>

      <div>
        <br></br>
      </div>

      <div className="profile-page">
        <div className="profile-avater">
          <h1>About</h1>
          <p className="center1" style={{ marginTop: "1%" }}>
            {" "}
            <textarea
              className="textarea input2"
              style={{width:"100%"}}
              type="text"
              value={user.about}
              name={user.about}
              onChange={(e) => setUser({ ...user, about: e.target.value })}
            />
          </p>
        </div>
      </div>

      <div>
        <br></br>
      </div>

      <div className="profile-page">
        <div className="profile-avater">
          <h1>Experience</h1>
          <h3 style={{marginTop:"2%"}}>
            <input
              type="text"
              className="input2"
              style={{width:"6%"}}
              value={user.yearsOfExperience}
              name={user.yearsOfExperience}
              onChange={(e) =>
                setUser({ ...user, yearsOfExperience: e.target.value })
              }
            />
            {" "}years of experience
          </h3>
          <h4 style={{marginTop:"1%"}}>
            Currently a{" "}
            <input
              type="text"
              className="input2"
              style={{width:"20%"}}
              value={user.jobTitle}
              name={user.jobTitle}
              onChange={(e) => setUser({ ...user, jobTitle: e.target.value })}
            />{" "}
            at{" "}
            <input
              type="text"
              className="input2"
              style={{width:"20%"}}
              value={user.company}
              name={user.company}
              onChange={(e) => setUser({ ...user, company: e.target.value })}
            />
          </h4>
          <h4 style={{marginTop:"1%"}}>
            <label>Career Level</label>
            <input
              type="text"
              className="input2"
              value={user.careerLevel}
              name={user.careerLevel}
              onChange={(e) =>
                setUser({ ...user, careerLevel: e.target.value })
              }
            />
          </h4>{" "}
          <br />
          <p style={{fontWeight:"bold"}}>Previous Experience</p>
          <ul style={{marginLeft:"1%"}}>
            {exp.map((item, index) => (
              <p key={index}>
                <input
                  type="text"
                  className="input2"
                  style={{width:"17%", marginTop:"1%"}}
                  value={item}
                  onChange={(e) => {
                    const updatedExp = [...exp];
                    updatedExp[index] = e.target.value; // Update the skill at the current index
                    setexp(updatedExp); // Update the skills state
                  }}
                />
              </p>
            ))}
            <br/>
            {!showInput1 && (
              <button className="button144" onClick={() => setShowInput1(true)}>
                Add Experience
              </button>
            )}
            {showInput1 && (
              <div>
                <input
                  type="text"
                  className="input2"
                  style={{width:"17%", marginTop:"-2%"}}
                  value={newexp}
                  onChange={(e) => setNewexp(e.target.value)}
                />
                <button className="button144" onClick={handleAddExp}>Save Experience</button>
              </div>
            )}
          </ul>
        </div>
      </div>

      <div>
        <br></br>
      </div>

      <div className="profile-page">
        <div className="profile-avater">
          <h1>Education</h1>
          <h3>
            <input
              type="text"
              className="input2"
              style={{width:"17%", marginTop:"2%"}}
              value={user.educationLevel}
              name={user.educationLevel}
              onChange={(e) =>
                setUser({ ...user, educationLevel: e.target.value })
              }
            />
          </h3>
          <h3>
            {" "}
            <input
              type="text"
              className="input2"
              style={{width:"30%", marginTop:"1%"}}
              value={user.university}
              name={user.university}
              onChange={(e) => setUser({ ...user, university: e.target.value })}
            />
          </h3>
          <h3>
            {" "}
            <input
              type="text"
              className="input2"
              style={{width:"30%", marginTop:"1%"}}
              value={user.academicMajor}
              name={user.academicMajor}
              onChange={(e) =>
                setUser({ ...user, academicMajor: e.target.value })
              }
            />
          </h3>
          <h3>
            {" "}
            <input
              type="text"
              className="input2"
              style={{width:"10%", marginTop:"1%"}}
              value={user.graduationYear}
              name={user.graduationYear}
              onChange={(e) =>
                setUser({ ...user, graduationYear: e.target.value })
              }
            />
          </h3>

<div style={{marginLeft:"2%", marginTop:"2%"}}>
          <h3>
            Description: 
            </h3>
            <p>
            <textarea
              type="text"
              className="input2"
              style={{width:"40%", marginTop:"1%", marginLeft:"0%"}}
              value={user.educationinfo}
              name={user.educationinfo}
              onChange={(e) =>
                setUser({ ...user, educationinfo: e.target.value })
              }
            />
          </p>
          </div>
        </div>
      </div>

      <div>
        <br></br>
      </div>

      <div className="profile-page">
        <div className="profile-avater">
          <h1>Skills</h1>
          <ul style={{marginLeft:"1%", marginTop:"1%"}}>
            {skills.map((item, index) => (
              <p key={index}>
                <input
                  type="text"
                  className="input2"
              style={{width:"20%", marginTop:"1%"}}
                  value={item}
                  onChange={(e) => {
                    const updatedSkills = [...skills]; // Create a copy of the skills array

                    updatedSkills[index] = e.target.value; // Update the skill at the current index
                    setskills(updatedSkills); // Update the skills state
                  }}
                />
              </p>
            ))}
            
            {!showInput && (
              <button className="button144" onClick={() => setShowInput(true)}>Add Skill</button>
            )}
            {showInput && (
              <div>
                <input
                style={{width:"20%", marginTop:"5%"}}
                className="input2"
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <button className="button144" onClick={handleAddSkill}>Save Skill</button>
              </div>
            )}
          </ul>
        </div>
      </div>
      <div>
        <br></br>
      </div>
      <button className="button7" onClick={update}>Save Changes</button>
      <div>
        <br/>
        <br/>
      </div>
    </div>
  );
}

export default EditPage;
