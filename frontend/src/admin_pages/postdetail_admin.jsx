import react, { useState, useContext, useEffect } from "react";
import { Link, navigate, useNavigate, useParams } from "react-router-dom";
import PostAuthor from "../Component/PostAuthor";

import Loader from "../Component/Loader";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
const PostDetail_Admin = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getPost = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/posts/${id}`
        );
        setPost(response.data);
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    };
    getPost();
  }, []);
  //

  if (isLoading) {
    return <Loader />;
  }
  return (
    <>
      <div className="container">
        {error && <p className="error">{error}</p>}
        {post && (
          <div className="container post-detail__container">
            <div className="post-detail__header">
              <PostAuthor authorID={post.creator} createdAt={post.createdAt} />
              <div>
                <p className="likes_count">{post.total_likes}</p>
                <FaHeart
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "#ef4444",
                    cursor: "pointer",
                    marginLeft: "5px",
                  }}
                />
              </div>
            </div>
            <div className="title_container">
              <h1 className="post_Detail_title">{post.title}</h1>
            </div>
            <div className="post-detail__thumbnail">
              <img src={post.thumbnailURL} alt="" />
            </div>
            <p
              className="post-description"
              dangerouslySetInnerHTML={{ __html: post.description }}
            ></p>
          </div>
        )}
      </div>
    </>
  );
};

export default PostDetail_Admin;
