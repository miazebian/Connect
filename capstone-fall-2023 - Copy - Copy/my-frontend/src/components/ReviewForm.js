import React, { useEffect, useState } from "react";
import "../CSS/review.css"

function ReviewForm({ eventId }) {
  const [comment, setComment] = useState("");
  const id = localStorage.getItem("id");
  const [reviews, setreviews] = useState("");
  const [reset, setreset] = useState(0);


  useEffect(() => {
    if (reset === 0) {
      fetch(`http://localhost:5000/review/event-reviews/${eventId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
        })
        .then((data) => {
          setreviews(data);
          setreset(1);
        })
        .catch((error) => {
          console.error("Get event reviews error:", error);
        });
    }
  }, [eventId, reset]);


  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/review/create-review/${id}/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ReviewText: comment }),
    })
      .then((response) => {
        if (response.status === 201) {
          console.log("Review created successfully");
          setreset(0);
          setComment("");
        }
      })
      .catch((error) => {
        console.error("Create review error:", error);
      });
  };

  function deleteReview(event, reviewid) {
    event.preventDefault();
    fetch(`http://localhost:5000/review/delete-review/${reviewid}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.status === 200) {
            console.log('Review deleted successfully');
            setreset(0);
          } 
        })
        .catch((error) => {
          console.error('Delete review error:', error);
          // Handle network or other errors
        });
  }
  
  console.log(reviews);

  return (
    <div className="popupcontent">
      <form>
        <div>
          <div>
            <label>
              Comment:
              <br />
              <center>
                <textarea
                  className="comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
                </center>
            </label>
          </div>
          <button className="button4" type="submit" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </form>
      <br/>
      <br/>
              <label>Comments:</label>

      <div>
      {Array.isArray(reviews) && reviews.length>0 ? (
          reviews.map((review) => (
            <div className="border">
               <div>
            <img
              src={`http://localhost:5000/api/profile-pics/${review.user.profilePic}`}
              alt=""
              className="profile-avatar4"
            />
                <h1 style={{ display: "inline-flex" }}>{review.user.username}</h1>
                &nbsp;
                <p style={{ display: "inline-flex", fontSize: "9px" }}>
                    {review.reviewDate.substring(0, 10)}
                  </p>
                  <p className="reviewtext" >{review.reviewText} </p>
                  {review.user._id===id ?
                    <button className="button5" onClick={(e) => deleteReview(e, review.id)}>Delete</button>
                  :""}
                            </div>

                </div>
          ))
        ) : (
          <p className="reviewtext">No reviews</p>
        )}
      </div>
    </div>
  );
}

export default ReviewForm;
