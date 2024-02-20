import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import "../CSS/details.css";

export const Details = () => {
  const location = useLocation();
  const { username, email, password } = location.state || {};
  //console.log(username,email,password);
  const navigate = useNavigate();

  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [university, setUniversity] = useState("");
  const [academicMajor, setAcademicMajor] = useState("");
  const [role, setRole] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [industry, setIndustry] = useState("");
  const [careerLevel, setCareerLevel] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const [lat, setlat] = useState("");
  const [lon, setlon] = useState("");
  const [loc,setloc]=useState("");

  const selectCountryHandler = (value) => setCountry(value);
  countries.registerLocale(enLocale);
  const countryObj = countries.getNames("en", { select: "official" });

  const countryArr = Object.entries(countryObj).map(([key, value]) => {
    return {
      label: value,
      value: value,
    };
  });

  useEffect(() => {
 
    if ("geolocation" in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        if (permissionStatus.state === 'denied') {
          console.log('Geolocation is turned off');
          setlat(0);
          setlon(0);
          setloc("location off");
          return;
        } else if (permissionStatus.state === 'granted') {
          console.log('Geolocation is allowed');
          navigator.geolocation.getCurrentPosition(function (position) {
            console.log("Latitude is :", position.coords.latitude);
            setlat(position.coords.latitude);
            console.log("Longitude is :", position.coords.longitude);
            setlon(position.coords.longitude);
            setloc(position.coords.latitude+" , "+position.coords.longitude);
            return;
          });
        } else if (permissionStatus.state === 'prompt') {
          // User hasn't yet decided to allow or deny geolocation
          console.log('Geolocation permission is pending');
        }
      }).catch(error => {
        console.error('Error checking geolocation permission:', error);
      });
    } else {
      // Geolocation not supported in this browser
      console.log('Geolocation is not supported');
    }
  }, []);



  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/users/register", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        firstName: FirstName,
        lastName: LastName,
        username: username,
        email: email,
        password: password,
        university: university,
        academicMajor: academicMajor,
        role: role,
        graduationYear: graduationYear,
        industry: industry,
        careerLevel: careerLevel,
        educationLevel: educationLevel,
        company: company,
        jobTitle: jobTitle,
        yearsOfExperience: yearsOfExperience,
        country: country,
        city: city,
        location: {
          type: "Point",
          coordinates: [lat, lon],
        },
      }),
    })
      .then((res) => {
        if (res.status === 201) {
          res.json().then((data) => {
            console.log(data);
            console.log("Signup Successful");
            navigate("/");
          });
        } else {
          console.log(res);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1949 },
    (_, index) => 2030 - index
  );

  const careerLevels = [
    "Undergraduate",
    "Unemployed",
    "Intern",
    "Entry Level",
    "FreeLancer",
    "Junior-Level",
    "Mid-Level",
    "Senior Level",
    "Executive",
    "Other",
  ];

  const educationLevels = [
    "High School",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
    "Other",
  ];


  return (
    <div>
      <div>
        <div className="cover4" >
          <div className="cover5">
            <h2 className="center">Enter Your Information</h2>
            <div className="form-container">
              <div className="input-group" >
                <label className="label4">
                  First Name:
                  </label>
                  <input
                  className="input3"
                    type="text"
                    value={FirstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                
              </div>

              <div className="input-group" >
                <label className="label4">
                  Last Name:</label>
                  <input
                                    className="input3"

                    type="text"
                    value={LastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                
              </div>
            </div>

            <div className="form-container">
              <div className="input-group">
                <label className="label4">
                  University:</label>
                  <input
                                    className="input3"

                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />
                
              </div>

              <div className="input-group">
                <label className="label4">
                  Academic Major:</label>
                  <input
                    type="text"
                    className="input3"

                    value={academicMajor}
                    onChange={(e) => setAcademicMajor(e.target.value)}
                  />
                
              </div>
            </div>

            <div className="form-container">
              <div className="input-group">
                <label className="label4">
                  Role:</label>
                  <input
                                    className="input3"

                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                
              </div>

              <div className="input-group">
                <label className="label4">
                  Graduation Year:</label>
                  <select
                  className="input3"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                  >
                    <option value="">Select a year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                
              </div>
            </div>

            <div className="form-container">
              <div className="input-group">
                <label className="label4">
                  Industry:</label>
                  <input
                  className="input3"
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                
              </div>

              <div className="input-group">
                <label className="label4">
                  Career Level:</label>
                  <select
                  className="input3"
                    value={careerLevel}
                    onChange={(e) => setCareerLevel(e.target.value)}
                  >
                    <option value="">Select your career level</option>
                    {careerLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                
              </div>
            </div>

            <div className="form-container">
              <div className="input-group">
                <label className="label4">
                  Education Level:</label>
                  <select
                  className="input3"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                  >
                    <option value="">Select your education level</option>
                    {educationLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                
              </div>

              <div className="input-group">
                <label className="label4">
                  Company:</label>
                  <input
                  className="input3"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                
              </div>
            </div>

            <div className="form-container">
              <div className="input-group">
                <label className="label4">
                  Job Title:</label>
                  <input
                  className="input3"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                
              </div>

              <div className="input-group">
                <label className="label4">
                  Years of Experience:</label>
                  <input
                  className="input3"
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                  />
                
              </div>
            </div>

            <div className="form-container">
              <div className="input-group">
                <label className="label4">
                  Country:</label>
                  <select
                  className="input4"
                    value={country}
                    onChange={(e) => selectCountryHandler(e.target.value)}
                  >
                    {!!countryArr?.length &&
                      countryArr.map(({ label, value }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                  </select>
                
              </div>

              <div className="input-group">
                <label className="label4">
                  City:</label>
                  <input
                  className="input3"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                
              </div>
            </div>
            <div className="form-container">
            <div className="input-group">
              <label className="label4" >Location:
              </label>
              <input className="input3" value={loc} />
            </div>
          </div>
          </div>
          <div className="center">
          <button type="submit" className="button1" onClick={handleSubmit}>
            SignUp
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};
