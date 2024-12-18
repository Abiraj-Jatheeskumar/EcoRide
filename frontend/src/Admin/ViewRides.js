import React, { useEffect, useState } from "react";
import userIcon from '../assets/usersIcon.png';
import deleteIcon from '../assets/delete.png';
import car from '../assets/car.png';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewRides = () => {
  
  const [searchTermUser, setSearchTermUser] = useState("");
  const [searchTermStartPlace, setSearchTermStartPlace] = useState("");
  const [searchTermEndPlace, setSearchTermEndPlace] = useState("");
  const [selectedRide, setSelectedRide] = useState(null);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState("");
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRides();
  }, []);

  const getRides = async () => {
    try {
      const response = await axios.get('http://localhost/ecoRide-Backend/Connection/Ride/AdminDisplayRide.php');
      sessionStorage.setItem("RideCount", response.data.length);
      setRides(response.data);
    } catch (error) {
      setError("There was an error fetching the rides!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSelectRide = (ride) => {
    setSelectedRide(ride);
    console.log("Selected ride:", ride);
};

  const handleUserSearchChange = (event) => {
    setSearchTermUser(event.target.value);
  };

  const handleStartPlaceSearchChange = (event) => {
    setSearchTermStartPlace(event.target.value);
  };

  const handleEndPlaceSearchChange = (event) => {
    setSearchTermEndPlace(event.target.value);
  };

  const handleViewMore = (ride) => {
    setSelectedRide(ride);
  };

  const closeModal = () => {
    console.log("Closing modal");
    setSelectedRide(null);
  };
  

  const showDeleteDialog = () => {
    setIsDeleteDialogVisible(true);
  };

  
  const hideDeleteDialog = () => {
    console.log("Hiding delete dialog");
    setIsDeleteDialogVisible(false);
  };

//   const handleDeleteRide = async () => {
//     const loadingToast = toast.loading("Deleting ride...");
//     console.log('Selected ride:', selectedRide);
    
//     if (!selectedRide || !selectedRide.rideID) {
//         console.error("No ride selected or invalid ride ID");
//         // Close loading toast as the action can't be completed
//         toast.update(loadingToast, { render: "No ride selected!", type: "error", isLoading: false, autoClose: 3000 });
//         return; 
//     }

//     const url = "http://localhost/ecoRide-Backend/Connection/Ride/DeleteRide.php";
//     let fdata = new FormData();
//     fdata.append("rideID", selectedRide.rideID); // This will work only if selectedRide is properly set
//     console.log("rideID", selectedRide.rideID);

//     try {
//         const response = await axios.post(url, fdata);
//         console.log(response.data);
        
//         // Update loading toast based on the response
//         if (response.data.message === "Ride deleted successfully") {
//             toast.update(loadingToast, { render: response.data.message, type: "success", isLoading: false, autoClose: 3000 });
//             setRides(prevRides => prevRides.filter(ride => ride.rideID !== selectedRide.rideID));

//             // window.location.reload(); 
//             hideDeleteDialog(); // Close the delete dialog
//             closeModal(); // Close any additional modal if necessary
//             // Fetch updated rides
//             setSelectedRide(null) ;
//             getRides(); 
//         } else {
//             // Show an error message if deletion was not successful
//             toast.update(loadingToast, { render: response.data.message, type: "error", isLoading: false, autoClose: 3000 });
//         }
//     } catch (error) {
//         console.error("There was an error deleting the ride!", error);
//         // Show an error message if there was a problem with the request
//         toast.update(loadingToast, { render: "Failed to delete the ride. Please try again.", type: "error", isLoading: false, autoClose: 3000 });
//     }
// };
const handleDeleteRide = async () => {
  const loadingToast = toast.loading("Delete Ride...");
  const url = "http://localhost/ecoRide-Backend/Connection/Ride/DeleteRide.php";
  
  // Create FormData and append rideID and rateID
  let fdata = new FormData();
  fdata.append("rideID", selectedRide.rideID);  // Make sure rideID is sent
  fdata.append("rateID", selectedRide.rateID);  // Make sure rateID is sent
fdata.append("BookingID",selectedRide.bookid);

  try {
    const response = await axios.post(url, fdata);
    console.log(response.data);  
    if (response.data.status === 1) {
      toast.update(loadingToast, { render: "Ride deleted successfully", type: "success", isLoading: false, autoClose: 3000 });
      hideDeleteDialog();
      closeModal();
      getRides();
    } else {
      toast.update(loadingToast, { render: "Failed to delete ride", type: "error", isLoading: false, autoClose: 3000 });
    }
    
  } catch (error) {
    console.error("There was an error deleting the ride!", error);
  }
};


  


  const calculateElapsedTime = (publishedTime, publishedDate) => {
    const currentTime = new Date();
    const publishedDateTime = new Date(`${publishedDate}T${publishedTime}`);
    const elapsedTime = currentTime - publishedDateTime;
    const elapsedMinutes = Math.floor(elapsedTime / (1000 * 60));
    const elapsedHours = Math.floor(elapsedTime / (1000 * 60 * 60));
    const elapsedDays = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));

    if (elapsedDays > 0) {
      return `${elapsedDays} days ago`;
    } else if (elapsedHours > 0) {
      return `${elapsedHours} hours ago`;
    } else {
      return `${elapsedMinutes} minutes ago`;
    }
  };

  const formatDate = (dateStr) => {
    const rideDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (rideDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (rideDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return rideDate.toDateString();
    }
  };

  const filteredRides = rides.filter(ride =>
    ride.destinationPoint.toLowerCase().includes(searchTermEndPlace.toLowerCase()) &&
    ride.departurePoint.toLowerCase().includes(searchTermStartPlace.toLowerCase()) &&
    ride.driverName.toLowerCase().includes(searchTermUser.toLowerCase())
  );

  const sortedRides = filteredRides.sort((a, b) => {
    const currentDate = new Date();
    const today = new Date(currentDate.setHours(0, 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (dateA < today && dateB >= today) return 1;
    if (dateA >= today && dateB < today) return -1;
    if (dateA.toDateString() === today.toDateString() && dateB.toDateString() !== today.toDateString()) return -1;
    if (dateA.toDateString() !== today.toDateString() && dateB.toDateString() === today.toDateString()) return 1;
    if (dateA.toDateString() === tomorrow.toDateString() && dateB.toDateString() !== tomorrow.toDateString()) return -1;
    if (dateA.toDateString() !== tomorrow.toDateString() && dateB.toDateString() === tomorrow.toDateString()) return 1;

    return dateA - dateB;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <h1>Ride Details</h1>
      <p className="head-para">Here are the user details.</p>

      <div className="search-con">
        <input
          type="text"
          placeholder="Search by Destination"
          className="search-users"
          value={searchTermEndPlace}
          onChange={handleEndPlaceSearchChange}
        />
        <input
          type="text"
          placeholder="Search by Departure"
          className="search-users"
          value={searchTermStartPlace}
          onChange={handleStartPlaceSearchChange}
        />
        <input
          type="text"
          placeholder="Search by username"
          className="search-users"
          value={searchTermUser}
          onChange={handleUserSearchChange}
        />
      </div>

      <div className="viewRide-bars">
        {sortedRides.map((ride) => (
          <div key={ride.rideID} className="viewRide-bar">
            <div className="viewRide-bar-up">
              <div className="viewRide-details">
                <span className="timeplace">Departure</span>
                <span className="timeplace">{ride.departureTime}</span>
                <span className="timeplace">{ride.departurePoint}</span>
                <span className="timeplace">{formatDate(ride.date)}</span>
              </div>
              <div className="viewRide-details">
                <span className="timeplace">Destination</span>
                <span className="timeplace">{ride.destinationTime}</span>
                <span className="timeplace">{ride.destinationPoint}</span>
              </div>
              <div className="viewRide-details">
                <span className="viewRide-price">LKR {ride.seatCost}</span>
              </div>
            </div>
            <div className="viewRide-bar-middle">
              <hr />
            </div>
            <div className="viewRide-bar-down">
              <div className="car-details-vr">
                <img src={car} alt="car" className="vr-car" />
                <span className="vr-carnumber">{ride.vehicleNo}</span>
              </div>
              <div className="user-details-vr" onClick={() => handleViewMore(ride)}>
                <img src={userIcon} alt="user" className="vr-userimg" />
                <span className="vr-username">{ride.driverName}</span>
              </div>
              {/* Displaying the ride status */}
              <span className={`vr-status ${ride.rideStatus === 'active' ? 'active-status' : 'finished-status'}`}>
                {ride.rideStatus === 'active' ? 'Active' : 'Finished'}
              </span>
              <span className="vr-time">{calculateElapsedTime(ride.publishedTime, ride.publishedDate)}</span>
              <div className="delete-details-vr" onClick={() => { handleSelectRide(ride); showDeleteDialog(); }}>
                <img src={deleteIcon} alt="delete" className="vr-deleteimg" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* <ToastContainer />  */}
      {selectedRide && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Driver Details</h2>
              <button className="close-button" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="user-details">
              <p><strong>Driver ID:</strong> {selectedRide.driver_ID}</p>
              <p><strong>Driver Name:</strong> {selectedRide.driverName}</p>
              <p><strong>Email:</strong> {selectedRide.driverEmail}</p>
              <p><strong>Phone:</strong> {selectedRide.driverPhoneNo}</p>
              <p><strong>Nic-Number:</strong> {selectedRide.driverNicNo}</p>
              <hr />
              <br/>
            </div>
            <div className="modal-header">
            <h2>Passenger Details</h2><br/><br/>
              
            </div>
            <div className="user-details">
             
              
              {selectedRide.passengers ? (
                selectedRide.passengers.split(';').map((passenger, index) => {
                  const [PassengerID, PassengerName, PassengerEmail, PassengerPhoneNo, status,PassengerNicNo] = passenger.split(',');
                  return (
                    <div key={index}>
                      <p><strong>Passenger ID:</strong> {PassengerID.split(':')[1]}</p>
                      <p><strong>Passenger Name:</strong> {PassengerName.split(':')[1]}</p>
                      <p><strong>Email:</strong> {PassengerEmail.split(':')[1]}</p>
                      <p><strong>Phone:</strong> {PassengerPhoneNo.split(':')[1]}</p>
                      <p><strong>Status:</strong> {status.split(':')[1]}</p>
                      <p><strong>Nic-Number:</strong> {PassengerNicNo.split(':')[1]}</p><br/>
                     
                      
                    </div>
                  );
                })
              ) : (
                <p>No passengers</p>
              )}
            </div>
          </div>
        </div>
      )}

      {isDeleteDialogVisible && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this ride?</p>
            <div className="modal-content-delete-button">
              <button className="confirm-delete-button" onClick={handleDeleteRide}>
                Yes
              </button>
              <button className="user-button" onClick={hideDeleteDialog}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
       {/* {isDeleteDialogVisible && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this ride?</p>
            <div className="modal-content-delete-button">
              <button className="confirm-delete-button" onClick={() => { handleDeleteRide();hideDeleteDialog();setSelectedRide(null);getRides();}}>
                Yes
              </button>
              <button className="user-button" onClick={hideDeleteDialog}>
                No
              </button>
            </div>
          </div>
        </div>
      )} */}
      <ToastContainer />
    </>
  );
};

export default ViewRides;
// onClick={() => { handleDeleteRide();hideDeleteDialog() }}