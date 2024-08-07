import React, { useState, useEffect } from 'react';
import '../styles/Currentride.css';
import axios from 'axios';
import { Blocks } from "react-loader-spinner";

const CurrentRide = () => {
  const [rides, setRides] = useState([]);
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [showDriverDetails, setShowDriverDetails] = useState(null);
  const [showRequests, setShowRequests] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userID = sessionStorage.getItem("UserID");
    setUserId(userID);
    getCurrentRidesForUser(userID);
    getuserole(userID);
  }, []);

  const getuserole = async (userId) => {
    try {
      const Data = new FormData();
      Data.append("userID", userId);
      const response = await axios.post('http://localhost/ecoRide-Backend/Connection/User/SelectUserrole.php', Data);
      console.log("Response Data-role:", response.data);
      setUserRole(response.data.userRole);
    } catch (error) {
      console.error(error);
    }
  };

  const getCurrentRidesForUser = async (userId) => {
    try {
      const Data = new FormData();
      Data.append("userID", userId);
      const response = await axios.post('http://localhost/ecoRide-Backend/Connection/Ride/CurrentRideUsers.php', Data);
      console.log("Response Data:", response.data);
      setRides(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAcceptRequest = async (Bookid, requestId) => {
    try {
      setIsLoading(true);
      const Data = new FormData();
      Data.append("Bookid", Bookid);
      const response = await axios.post('http://localhost/ecoRide-Backend/Connection/Ride/AcceptRide.php', Data);
      console.log(response.data);
      
      if (response.data.status === 1) {
        console.log(response.data.message);
        setIsLoading(false);
        window.location.reload();
        setRides(rides.map(ride =>
          ride.Bookid === Bookid
            ? {
                ...ride,
                availableSeats: ride.availableSeats - ride.requests.find(request => request.id === requestId).seatsRequested,
                requests: ride.requests.filter(request => request.id !== requestId),
                acceptedPassengers: [
                  ...ride.acceptedPassengers,
                  ride.requests.find(request => request.id === requestId)
                ]
              }
            : ride
        ));
      } else {
        console.error("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (Bookid, requestId) => {
    try {
      const Data = new FormData();
      Data.append("Bookid", Bookid);
      Data.append("requestID", requestId);
      await axios.post('http://localhost/ecoRide-Backend/Connection/Ride/RejectRequest.php', Data);
      setRides(rides.map(ride =>
        ride.Bookid === Bookid
          ? {
              ...ride,
              requests: ride.requests.filter(request => request.id !== requestId)
            }
          : ride
      ));
      console.log(`Request with ID ${requestId} rejected.`);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleCancelBooking = async (rideId) => {
    try {
      const Data = new FormData();
      Data.append("rideID", rideId);
      await axios.post('http://localhost/ecoRide-Backend/Connection/Ride/CancelBooking.php', Data);
      setRides(rides.filter(ride => ride.Bookid !== rideId));
      console.log(`Booking for ride with ID ${rideId} canceled.`);
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
  };

  const toggleDriverDetails = (rideId) => {
    setShowDriverDetails((prevId) => (prevId === rideId ? null : rideId));
  };

  const toggleRequests = (rideId) => {
    setShowRequests((prevState) => ({
      ...prevState,
      [rideId]: !prevState[rideId],
    }));
  };

  return (
    <div className="current-ride-container">
      <h1>Current Rides</h1>
      {rides.length > 0 ? (
        rides.map((ride) => (
          <div key={ride.Bookid} className="ride-details">
            <p><strong>Departure Point:</strong> {ride.departurePoint}</p>
            <p><strong>Destination Point:</strong> {ride.destinationPoint}</p>
            <p><strong>Date:</strong> {ride.date}</p>
            <p><strong>Time:</strong> {ride.departureTime} - {ride.destinationTime}</p>
            <p><strong>Vehicle:</strong> {ride.vehicleModel}</p>
            <p><strong>Cost per Seat:</strong> LKR {ride.seatCost}</p>

            {userRole === 'driver' && (
              <div>
                <p><strong>Available Seats:</strong> {ride.availableSeats}</p>
                <button onClick={() => toggleRequests(ride.Bookid)}>
                  {showRequests[ride.Bookid] ? 'Hide Requests' : 'Passenger Requests'}
                </button>
                {showRequests[ride.Bookid] && (
                  <div className="request-details">
                    {ride.requests.length > 0 ? (
                      ride.requests.map((request, index) => (
                        <div key={index} className="request">
                          <p><strong>Name:</strong> {request.passengerName}</p>
                          <p><strong>Contact:</strong> {request.passengerContact}</p>
                          <p><strong>Seats Requested:</strong> {request.seatsRequested}</p>
                          <button onClick={() => handleAcceptRequest(ride.Bookid, index)}>Accept</button>
                        
                          <button onClick={() => handleRejectRequest(ride.Bookid, index)}>Reject</button>
                          {isLoading && (
                 <Blocks
                 height="30"
                 width="30"
                 color="#4fa94d"
                 ariaLabel="blocks-loading"
                 wrapperStyle={{}}
                 wrapperClass="blocks-wrapper"
                 visible={true}
                 />
                )}
                        </div>
                      ))
                    ) : (
                      <p>No requests available.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {userRole === 'passenger' && (
              <div>
                <p><strong>Status:</strong> {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}</p>
                {ride.status === 'accepted' && (
                  <>
                    <button onClick={() => toggleDriverDetails(ride.Bookid)}>
                      {showDriverDetails === ride.Bookid ? 'Hide Driver Details' : 'Show Driver Details'}
                    </button>
                    {showDriverDetails === ride.Bookid && (
                      <div className="driver-details">
                        <p><strong>Driver Name:</strong> {ride.driver.name}</p>
                        <p><strong>Contact:</strong> {ride.driver.contact}</p>
                      </div>
                    )}
                    <button className="cancel-booking-button" onClick={() => handleCancelBooking(ride.Bookid)}>
                      Cancel Ride
                    </button>
                  </>
                )}
                {ride.status === 'waiting' && (
                  <button className="cancel-booking-button" onClick={() => handleCancelBooking(ride.Bookid)}>
                    Cancel Booking
                  </button>
                )}
              </div>
            )}

            {userRole === 'driver' && ride.acceptedPassengers.length > 0 && (
              <div className="accepted-passengers">
                <h3>Accepted Passengers</h3>
                {ride.acceptedPassengers.map((passenger, index) => (
                  <div key={index} className="accepted-passenger">
                    <p><strong>Name:</strong> {passenger.passengerName}</p>
                    <p><strong>Contact:</strong> {passenger.passengerContact}</p>
                    <p><strong>Seats Requested:</strong> {passenger.seatsRequested}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="no-rides-message">You have no current rides.</p>
      )}
    </div>
  );
};

export default CurrentRide;