import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "../Component/Loader";
import DeletePost from "../pages/DeletePost";
const ReportPost = ({ postId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState(null);
  useEffect(() => {
    const getPost = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/posts/${postId}`
        );
        setPost(response.data);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };
    getPost();
  }, [postId]);
  if (isLoading) {
    return <Loader />;
  }
  if (!post) {
    return <div>No post data available</div>;
  }
  return (
    <div className="report_post">
      <img src={post.thumbnailURL} alt="" />
      <h3>{post.title}</h3>
      <Link className="btn sm" to={`/admin/postDetail/${postId}`}>
        view
      </Link>
      <DeletePost postId={postId} />
    </div>
  );
};

export default ReportPost;
