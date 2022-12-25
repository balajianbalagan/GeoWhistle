import { useState, useEffect } from "react";
import ReactMapGL, { Marker, Popup, GeolocateControl } from "react-map-gl";
import { Room, SettingsRemote, Star } from "@material-ui/icons";
import "./app.css";
import axios from "axios";
import { format } from "timeago.js";
import Register from "./components/Register";
import Login from "./components/Login";
import FileBase64 from "react-file-base64";


function App() {
  const myStorage = window.localStorage;
  const [currentUid, setCurrentUid] = useState(myStorage.getItem("userid"));
  
  const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"));
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [image, setImage] = useState(null);
  const [desc, setDesc] = useState(null);
  const [priority, setPriority] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 46,
    longitude: 17,
    zoom: 4,
  });
  const [viewport1, setViewport1] = useState({}); 
  useEffect(() => {
    
    const getPins = async () => {
      try {
        const allPins = await axios.get("http://localhost:8800/api/pins");
        console.log(allPins.data);
        setPins(allPins.data);
      } catch (err) {
        console.log(err);
      }
    };
    
    getPins();
  }, []);

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };

  function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  const handleAddClick = (e) => {
    const [long, lat] = e.lngLat;
    var dist = getDistanceFromLatLonInKm(long,lat,viewport1.longitude,viewport1.latitude);
    console.log(dist);
    if(dist<=1){
      
    setNewPlace({
      lat,
      long,
    });
    }else{
      alert("You can't tweet out of your range!")
      setNewPlace(null);
    }
    
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    console.log(base64)
    setImage({base64})
  }

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      priority,
      lat: newPlace.lat,
      long: newPlace.long,
      image:image.base64,
    };
    console.log(newPin);
    try {
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    //try to use full paths because simple delete isnt working
    console.log(e.currentTarget.getAttribute('data-column'));
    
    let id = e.currentTarget.getAttribute('data-column');
    try {
      const res = await axios.delete("/pins/"+id);
      console.log(res.data);
      setPins(res.data);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    //try to use full paths because simple delete isnt working
    console.log(e.currentTarget.getAttribute('data-column'));
    
    let id = e.currentTarget.getAttribute('data-column');
    let uid = currentUid;
    try {
      const res = await axios.put("/pins/like/"+id+"/"+uid);
      console.log(res.data);
      setPins(res.data);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };
  const handleDislike = async (e) => {
    e.preventDefault();
    //try to use full paths because simple delete isnt working
    console.log(e.currentTarget.getAttribute('data-column'));
    
    let id = e.currentTarget.getAttribute('data-column');
    let uid = currentUid;
    try {
      const res = await axios.put("/pins/dislike/"+id+"/"+uid);
      console.log(res.data);
      setPins(res.data);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };
  const handleLogout = () => {
    myStorage.removeItem("user");
    setCurrentUser(null);
  }
  navigator.geolocation.getCurrentPosition((pos) => {
    setViewport1({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });
    setViewport({
      ...viewport,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      zoom: 15,
    });
  });
  return (
    <div className="App">
    
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
        initialViewState={viewport1}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onDblClick={handleAddClick}
        transitionDuration="100"
      >
      <GeolocateControl
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
        />
        
        {pins.map((p) => (
          <>
            <Marker
              latitude={p.lat}
              longitude={p.long}
              offsetLeft={-viewport.zoom * 3.5}
              offsetTop={-viewport.zoom * 7}
            >
              <Room
                style={{
                  fontSize: viewport.zoom * 7,
                  color: p.username === currentUser ? "tomato" : "slateblue",
                  cursor: "pointer",
                }}
                onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
              />
            


            </Marker>
            {p._id === currentPlaceId && (
              <Popup
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                anchor="left"
                onClose={() => setCurrentPlaceId(null)}
              >
                <div className="card">
                <label>Image</label>
                <img  style={{ width: 150 }} src={p.image} />
                  <label>Title</label>
                  <h4 className="place">{p.title}</h4>
                  <label>Whistle</label>
                  <p className="desc">{p.desc}</p>
                  <label>Priority</label>
                  <div className="stars">
                    {Array(p.priority).fill(<Star className="star" />)}
                  </div>
                  <span className="username">
                    Created by <b>{p.username}</b>
                  </span>
                  <span className="date">{format(p.createdAt)}</span>
                  <span>{p.likes.length} Likes</span>
                  {p.username === currentUser && (
                    <button type="submit" className="submitButton" onClick={handleDelete} data-column={p._id} >Delete</button>
                    )}

                      <span className="likeunlike">
                      {!p.likes.includes(currentUid) && (
                        <div>
                        <button className="LikeButton" data-column={p._id} onClick={handleLike}>Yayy</button>
                        <button className="DislikeButton1" data-column={p._id} >Nayy</button>
                  
                        </div>
                     )}
                     
                     {p.likes.includes(currentUid) && (
                      <div>
                      <button className="LikeButton1" data-column={p._id} onClick={handleLike}>Yayy</button>
                    
                    <button className="DislikeButton" data-column={p._id} onClick={handleDislike}>Nayy</button>
                  
                      </div>
                       )}
                    </span>
                </div>
              </Popup>
            )}
          </>
        ))}
        {newPlace && (
          <Popup
            latitude={newPlace.lat}
            longitude={newPlace.long}
            closeButton={true}
            closeOnClick={false}
            anchor="left"
            onClose={() => setNewPlace(null)}
          >
            <div>
              <form onSubmit={handleSubmit}>
              <input 
          type="file"
          lable="Image"
          name="myFile"
          id='file-upload'
          accept='.jpeg, .png, .jpg'
          onChange={(e) => handleFileUpload(e)}
         />
                <label>Title</label>
                <input
                  placeholder="Enter a title"
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label>Whistle</label>
                <textarea
                  placeholder="Say us something about this place."
                  onChange={(e) => setDesc(e.target.value)}
                />
                <label>Priority</label>
                <select onChange={(e) => setPriority(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>

                <button className="submitButton" type="submit">
                  Add Whistle
                </button>
              </form>
            </div>
          </Popup>
        )}
        {currentUser ? (
          <button className="button logout" onClick={handleLogout}>Logout</button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={() => setShowLogin(true)}>
              Login
            </button>
            <button
              className="button register"
              onClick={() => setShowRegister(true)}
            >
              Register
            </button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister}/>}
        {showLogin && <Login setShowLogin={setShowLogin} myStorage={myStorage} setCurrentUser={setCurrentUser} setCurrentUid={setCurrentUid}/>}
        
      </ReactMapGL>
    </div>
  );
}

export default App;


function convertToBase64(file){
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result)
    };
    fileReader.onerror = (error) => {
      reject(error)
    }
  })
}