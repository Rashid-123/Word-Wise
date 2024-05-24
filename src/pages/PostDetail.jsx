import react, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PostAuthor from "../Component/PostAuthor";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
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
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    };
    getPost();
  }, []);

  const toggleBookmark = async () => {
    const postId = id;
    try {
      if (isBookmarked) {
        // Remove bookmark
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/bookmarks/remove`,
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
          `${process.env.REACT_APP_BASE_URL}/bookmarks/add`,
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
  if (isLoading) {
    return <Loader />;
  }
  return (
    <section className="container">
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
          <h1 className="post_title">{post.title}</h1>
          <div className="post-detail__thumbnail">
            <img src={post.thumbnailURL} alt="" />
          </div>
          <p dangerouslySetInnerHTML={{ __html: post.description }}></p>
          {currentUser?.id && (
            <div className="bookmark" onClick={toggleBookmark}>
              {isBookmarked ? (
                <FaBookmark
                  style={{
                    width: "25px",
                    height: "25px",
                    color: "gold",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <FaRegBookmark
                  style={{
                    width: "25px",
                    height: "25px",
                    color: "grey",
                    cursor: "pointer",
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default PostDetail;
