import { Cancel, Room } from "@material-ui/icons";
import axios from "axios";
import { useRef, useState } from "react";
import "./register.css";

export default function Register({ setShowRegister }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [success1, setSuccess1] = useState(false);
  const [error1, setError1] = useState(false);

  const nameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const passwordRef = useRef();
  const otpRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUser = {
      username: nameRef.current.value,
      email: emailRef.current.value,
      phone: phoneRef.current.value,
      password: passwordRef.current.value,
    };

    try {
      await axios.post("/users/reg", newUser);
      setError(false);
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    const newUser = {
      username: nameRef.current.value,
      email: emailRef.current.value,
      phone: phoneRef.current.value,
      password: passwordRef.current.value,
      code : otpRef.current.value
    };

    try {
      await axios.post("/users/register", newUser);
      setError1(false);
      setSuccess1(true);
    } catch (err) {
      setError1(true);
    }
  };

  return (
    <div className="registerContainer">
      <div className="logo">
        <Room /> Register
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="username" ref={nameRef} />
        <input type="email" placeholder="email" ref={emailRef} />
        <input type="tel" placeholder="phone" ref={phoneRef} />
        <input type="password" placeholder="password" ref={passwordRef} />
        <button className="registerBtn">Register</button>
        </form>
        {success && (
          <div >Enter OTP
          <form onSubmit={handleOTP}>
          <span>
          <input type="text" ref={otpRef}  placeholder="OTP"></input>
          <button className="registerBtn" onClick={handleOTP}>Send OTP</button>
          
          {success1 && (
              <span className="success">Successfully registered</span>
          )}
          </span>
          </form>
          
          </div>
        )}
        {error && <span className="failure">Something went wrong!</span>}
     
      <Cancel
        className="registerCancel"
        onClick={() => setShowRegister(false)}
      />
    </div>
  );
}
