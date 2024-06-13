import React, { useEffect, useState } from "react";
import { GoContainer } from "react-icons/go";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaRegClipboard,
  FaRegFileAlt,
  FaUserFriends,
} from "react-icons/fa";

import Loader from "../Component/Loader";

import axios from "axios";

const AdminHome = () => {
  const [totalUsers, setTotalUsers] = useState(null);
  const [totalPosts, setTotalPosts] = useState(null);
  const [totalReports, setTotalReports] = useState(null);
  const [UsersWithPost, setUsersWithPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [featuredPost, setFeaturedPost] = useState(null);
  //
  useEffect(() => {
    const fetchFeaturedPost = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/posts/getfeatured`
        );
        console.log(response.data);
        setFeaturedPost(response.data);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };
    fetchFeaturedPost();
  }, []);
  //

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/admin/getReports`
        );
        if (response.data && Array.isArray(response.data)) {
          setTotalReports(response.data.length);
        } else {
          console.log("Unexpected response data format:", response.data);
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };
    fetchReports();
  }, []);
  //
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/admin/users`
        );
        console.log(response);
        if (response.data && Array.isArray(response.data)) {
          setTotalUsers(response.data.length);
          setUsersWithPost(
            response.data.filter((user) => user.posts > 0).length
          );
        } else {
          console.log("Unexpected response data format:", response.data);
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, []);
  //
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(false);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/posts`
        );

        setTotalPosts(response.data.length);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return <Loader />;
  }
  return (
    <section className="container">
      <div className="Box">
        <div className="dashboard_box">
          <div>
            <FaUsers
              style={{
                padding: "5px",
                backgroundColor: "#cbbbff",
                borderRadius: "25%",
              }}
              size={34}
              color="blue"
            />
            <h3>Total Users </h3>
          </div>
          <h2 style={{ color: "blue" }}>{totalUsers}</h2>
        </div>
        <div className="dashboard_box">
          <div>
            <FaRegFileAlt
              style={{
                padding: "5px",
                backgroundColor: "#cbbbff",
                borderRadius: "25%",
              }}
              size={34}
              color="green"
            />
            <h3> Total posts </h3>
          </div>
          <h2 style={{ color: "green" }}>{totalPosts}</h2>
        </div>
        <div className="dashboard_box">
          <div>
            <FaUserFriends
              style={{
                padding: "5px",
                backgroundColor: "#cbbbff",
                borderRadius: "25%",
              }}
              size={34}
              color="purple"
            />
            <h3>Users with Posts</h3>
          </div>
          <h2 style={{ color: "purple" }}>{UsersWithPost}</h2>
        </div>

        <div className="dashboard_box">
          <div>
            <FaRegClipboard
              style={{
                padding: "5px",
                backgroundColor: "#cbbbff",
                borderRadius: "25%",
              }}
              size={34}
              color="red"
            />
            <h3> Reports </h3>
          </div>
          <h2 style={{ color: "red" }}> {totalReports}</h2>
        </div>
      </div>
      <h2 className="dash_featured_tag">Featured Post</h2>
      <div className="home_featured">
        <img src={featuredPost?.thumbnailURL} alt="" />
        <h2>{featuredPost?.title}</h2>
        <Link to={`/admin/featured/${featuredPost?._id}`}>
          <button className="btn pr">view</button>
        </Link>
      </div>
    </section>
  );
};

export default AdminHome;
