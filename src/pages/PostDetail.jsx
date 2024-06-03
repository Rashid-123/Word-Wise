import react, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PostAuthor from "../Component/PostAuthor";
import {
  FaBookmark,
  FaRegBookmark,
  FaClipboard,
  FaRegClipboard,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

import { UserContext } from "../Context/userContext";
import Loader from "../Component/Loader";
import axios from "axios";
import DeletePost from "./DeletePost";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [creatorID, setCreatorID] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  //
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsliked] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [totalLikes, setTotalLikes] = useState(null);
  //
  const { currentUser } = useContext(UserContext);
  const token = currentUser?.token;
  const userId = currentUser?.id;

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/${currentUser?.id}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.bookmarks.includes(id)) {
          setIsBookmarked(true);
        }
        if (response.data.reports.includes(id)) {
          setIsReported(true);
        }
        if (response.data.likes.includes(id)) {
          setIsliked(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUser();
  }, [currentUser?.id, token]);
  //
  useEffect(() => {
    const getPost = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/posts/${id}`
        );
        setPost(response.data);
        setCreatorID(response.data.creator);
        setTotalLikes(response.data.total_likes);
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    };
    getPost();
  }, []);
  //
  const toggleReport = async () => {
    const postId = id;
    try {
      if (isReported) {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/users/removeReport`,
          { userId, postId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/users/addReport`,
          { userId, postId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      setIsReported(!isReported);
    } catch (error) {
      console.error("Error toggling bookmark", error);
      setError("Failed to update bookmark");
    }
  };
  //
  const toggleBookmark = async () => {
    const postId = id;
    try {
      if (isBookmarked) {
        // Remove bookmark
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/users/removeBookmark`,
          { userId, postId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Add bookmark
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/users/addBookmark`,
          { userId, postId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark", error);
      setError("Failed to update bookmark");
    }
  };
  //
  const toggleLike = async () => {
    const postId = id;
    try {
      if (isLiked) {
        // Remove like
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/users/removeLike`,
          { userId, postId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTotalLikes((prev) => prev - 1);
      } else {
        // Add bookmark
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/users/addLike`,
          { userId, postId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTotalLikes((prev) => prev + 1);
      }
      setIsliked(!isLiked);
    } catch (error) {
      console.error("Error toggling bookmark", error);
      setError("Failed to update bookmark");
    }
  };
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
              {currentUser?.id === post?.creator && (
                <div className="post-detail__buttons">
                  <Link
                    to={`/posts/${post?._id}/edit`}
                    className="btn sm primary"
                  >
                    Edit
                  </Link>
                  <DeletePost postId={id} />
                </div>
              )}
            </div>

            <h1 className="post_Detail_title">{post.title}</h1>
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
      {currentUser?.id && (
        <div className="Post_details_footer">
          <div className="like_icon" onClick={toggleLike}>
            <div>
              {isLiked ? (
                <FaHeart
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "#ef4444",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <FaRegHeart
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "gray",
                    cursor: "pointer",
                  }}
                />
              )}
              <p className="likes_count">{totalLikes}</p>
            </div>
          </div>

          <div className="bookmark_icon" onClick={toggleBookmark}>
            {isBookmarked ? (
              <FaBookmark
                style={{
                  width: "20px",
                  height: "20px",
                  color: "#f8fafc",
                  cursor: "pointer",
                }}
              />
            ) : (
              <FaRegBookmark
                style={{
                  width: "20px",
                  height: "20px",
                  color: "#f8fafc",
                  cursor: "pointer",
                }}
              />
            )}
          </div>
          <div className="report_icon" onClick={toggleReport}>
            {isReported ? (
              <FaClipboard
                style={{
                  width: "20px",
                  height: "20px",
                  color: "red",
                  cursor: "pointer",
                }}
              />
            ) : (
              <FaRegClipboard
                style={{
                  width: "20px",
                  height: "20px",
                  color: "#f8fafc",
                  cursor: "pointer",
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PostDetail;
