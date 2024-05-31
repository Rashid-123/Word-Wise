import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";
const Logout = () => {
  const { setCurrentUser, setIsAdmin } = useContext(UserContext);
  const navigate = useNavigate();

  setCurrentUser(null);
  setIsAdmin(false);
  navigate("/login");
  return <></>;
};

export default Logout;
