import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";

const Post = ({
  postID,
  thumbnail,
  category,
  title,
  description,
  authorID,
  createdAt,
}) => {
  const setFeatured = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/admin/featured`,
        { postId: postID }
      );
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="admin_Posts">
      <img src={thumbnail} alt="" />
      <h3>{title}</h3>
      <div>
        <Link className="btn_1">view</Link>
        <Link onClick={setFeatured} className="btn_2">
          feature
        </Link>
      </div>
    </div>
  );
};

export default Post;
