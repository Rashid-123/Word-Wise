import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { UserContext } from "../Context/userContext.js";

const LoginwithOTP = () => {
  //
  const [otpSend, setOtpsend] = useState(false);
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState({
    email: "",
    otp: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { setCurrentUser } = useContext(UserContext);

  const changeInputHandler = (e) => {
    setUserData((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
  };

  //
  const sendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/loginOTP`,
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

  const loginUser = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/loginwithOTP`,
        userData
      );
      const user = await response.data;
      setCurrentUser(user);
      navigate("/");
    } catch (err) {
      setError(err.response.data.message);
    }
  };
  //

  return (
    <section className="login ">
      <div className="container">
        <h2>sign in</h2>
        <form className="form  login__form" onSubmit={loginUser}>
          {error && <p className="form__error-message">{error}</p>}
          <input
            type="text"
            placeholder="Email"
            name="email"
            value={userData.email}
            onChange={changeInputHandler}
          />
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
                Login
              </button>
            </>
          )}
        </form>
        <small>
          Don't have an account ? ....
          <Link to="/Register">Sign up</Link>
        </small>
      </div>
    </section>
  );
};

export default LoginwithOTP;
