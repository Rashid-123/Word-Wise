import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../Component/Loader";

const ReportUser = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/admin/user`,
          { id: userId }
        );
        console.log(response.data);
        setUser(response.data);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [userId]);

  if (isLoading) {
    return <Loader />;
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="report_user">
      <img src={user.avatarURL} alt="" />
      <h3>{user.name}</h3>
    </div>
  );
};

export default ReportUser;
