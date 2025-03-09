import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaCheck } from "react-icons/fa";
import { UserContext } from "../Context/userContext";

const UserProfile = () => {
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState(null); // Changed initial state for avatar to null
  const [name, setName] = useState("");
  const [email, setemail] = useState("");
  const [currentPassword, setcurrentPassword] = useState("");
  const [newPassword, setnewPassword] = useState("");
  const [confirmNewPassword, setconfirmNewPassword] = useState("");
  const [isAvatarTouched, setIsAvatarTouched] = useState(false);
  const [user, setUser] = useState(null);
  const { currentUser } = useContext(UserContext);
  const token = currentUser?.token;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/${currentUser.id}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data);
        const { name, email, avatarURL } = response.data;
        setName(name);
        setemail(email);
        setAvatar(avatarURL);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUser();
  }, [currentUser.id, token]);

  const changeAvatarHandler = async () => {
    setIsAvatarTouched(false);
    try {
      const postData = new FormData();
      postData.append("avatar", avatar); // Changed set to append
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/change-avatar`,
        postData,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setAvatar(response?.data.avatarURL);
    } catch (error) {
      console.error("Error changing avatar:", error);
      // You can add code here to display an error message to the user
    }
  };

  const updateUserDetails = async (e) => {
    e.preventDefault();
    try {
      const userData = new FormData();
      userData.set("name", name);
      userData.set("email", email);
      userData.set("currentPassword", currentPassword);
      userData.set("newPassword", newPassword);
      userData.set("confirmNewPassword", confirmNewPassword);

      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/users/edit-user`,
        userData,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        // log user out
        navigate("/logout");
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };
  return (
    <section className="profile">
      <div className="container profile__container">
        <div className="profile_details_container">
          <h1 className="edit_lable">Edit Profile</h1>
          <div className="avatar__wrapper">
            <div className="profile__avatar">
              <img src={avatar} alt="" />
            </div>
            <form className="avatar__form">
              <input
                type="file"
                name="avatar"
                id="avatar"
                onChange={(e) => setAvatar(e.target.files[0])}
                accept="png,jpg,jpeg" // Removed spaces in accept attribute
              />
              <label htmlFor="avatar" onClick={() => setIsAvatarTouched(true)}>
                <FaEdit />
              </label>
            </form>
            {isAvatarTouched && (
              <button
                className="profile__avatar-btn"
                onClick={changeAvatarHandler}
              >
                <FaCheck />
              </button>
            )}
          </div>
          <div>
            <h1 className="profile_name">{currentUser.name}</h1>

            <Link to={`/user/followers/${currentUser.id}`}>
              <p>
                <span className="count">{user?.followers?.length}</span>
                followers
              </p>
            </Link>
            <Link to={`/user/followers/${currentUser.id}`}>
              <p>
                <span className="count">{user?.following?.length}</span>
                following
              </p>
            </Link>
          </div>

          <div className="bookmark_box">
            <Link className="bookmark_link" to={`/myposts/${currentUser.id}`}>
              Posts
            </Link>
            <Link className="bookmark_link" to={`/bookmark/${currentUser.id}`}>
              Bookmarks
            </Link>
          </div>
        </div>

        <form className="form profile__form" onSubmit={updateUserDetails}>
          {error && <p className="form__error-message">{error}</p>}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            disabled
            onChange={(e) => setemail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setcurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setnewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmNewPassword}
            onChange={(e) => setconfirmNewPassword(e.target.value)}
          />
          <button type="submit" className="btn primary">
            Update details
          </button>
        </form>
      </div>
    </section>
  );
};

export default UserProfile;
