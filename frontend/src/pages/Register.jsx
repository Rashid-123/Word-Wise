import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
const Register = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    otp: "",
  });

  const [otpSend, setOtpsend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const changeInputHandler = (e) => {
    setUserData((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
  };

  const sendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/registerOTP`,
        { email: userData.email }
      );
      setOtpsend(true);
      // setError(response.data);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(
        error.response
          ? error.response.data.message
          : "Failed to send OTP. Please try again."
      );
    }
    setLoading(false);
  };

  const registerUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/register`,
        userData
      );
      const newUser = await response.data;
      console.log(newUser);
      if (!newUser) {
        setError("Couldn't register user. Please try again");
      }
      navigate("/login");
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="register">
      <div className="container">
        <h2>Sign Up</h2>
        <form className="form register__form" onSubmit={registerUser}>
          {error && <p className="form__error-message">{error}</p>}
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            value={userData.name}
            onChange={changeInputHandler}
            autoFocus
          />
          <input
            type="text"
            placeholder="Email"
            name="email"
            value={userData.email}
            onChange={changeInputHandler}
            disabled={otpSend}
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Set a Password"
            name="password"
            value={userData.password}
            onChange={changeInputHandler}
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            name="password2"
            value={userData.password2}
            onChange={changeInputHandler}
          />
          <button
            type="button"
            className="btn secondary"
            onClick={togglePasswordVisibility}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>

          {!otpSend && !loading && (
            <button type="button" className="btn primary" onClick={sendOtp}>
              Send OTP
            </button>
          )}
          {loading && <p>Sending OTP...</p>}
          {otpSend && (
            <>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={userData.otp}
                onChange={changeInputHandler}
              />
              <button type="submit" className="btn primary">
                Register
              </button>
            </>
          )}
        </form>
        <small>
          Already have an account? <Link to="/login">Sign in</Link>
        </small>
      </div>
    </section>
  );
};

export default Register;
