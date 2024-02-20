import React, { useEffect, useState }  from 'react'
import Navbar from "./components/Navbar"
import Cardcom from './components/Cardcom';
import Eventshow from './components/Eventshow';

function Search() {
    const searchtext=localStorage.getItem("search");
    const [users, setusers]=useState("");
    const [events, setevents]=useState("");
    const [reset, setreset]=useState(0);
    const [events1, setevents1]=useState("");


    useEffect(()=>{
        fetch(`http://localhost:5000/users/search/${searchtext}`)
  .then((response) => response.json())
  .then((data) => {
    setusers(data);
  })
  .catch((error) => {
    console.error('Search error:', error);
  });

  fetch(`http://localhost:5000/events/search/${searchtext}`)
  .then((response) => response.json())
  .then((data) => {
    setevents(data);
  })
  .catch((error) => {
    console.error('Search error:', error);
  });

  if(reset===0 && events!==""){
    const updatedAttendingEvents = []; // Create a new array to store updated event objects
      events.forEach((event) => {
        // Fetch organizer information for each event
        fetch(
          `http://localhost:5000/users/getuser/${event.organizerId}`
        )
          .then((response) => response.json())
          .then((organizerData) => {
           event.organizerInfo = organizerData;
          updatedAttendingEvents.push(event); // Push the updated event to the new array

            if (updatedAttendingEvents.length === events.length) {
              setevents1(updatedAttendingEvents);
              setreset(1);
              
            }
          })
          .catch((error) => {
            console.error("Fetch error:", error);
          });
      });
      
  }

    },[searchtext, reset, events]);

  return (
    <div>
        <Navbar/>
        <div className='home' >
        <h1>Showing Results for: {searchtext} </h1>
        <br/>
        <div style={{marginLeft:"5%"}}>
          
            {Array.isArray(users) && users.length>0 ?
            <h1>Relevent Users</h1>:""
            }<center>
            <div style={{ display: "flex", flexWrap: "wrap" , margin:"1%" }}>
        {
        Array.isArray(users) ? (
          users.map((users) => (
            <Cardcom key={users._id} user={users} status="check" />

          ))
        ) : (""
        )}
        </div></center>
        </div>
       
       <br/>
       <br/>

        <div>
            
            {
                reset===1?
                <h1 style={{marginLeft:"5%"}}>Relevent Events</h1>:
                ""
            }

<br/>
        {Array.isArray(events1)? 
        (
          events1.map((event) => (
            <Eventshow key={event._id} user={event.organizerInfo} event={event} o="3" />
          ))
        ) : (""
        )}
        
        </div>
          </div>
    </div>
  )
}

export default Search