import React, { useState, useEffect, useContext } from "react";
import PostItem from "../Component/PostItem.jsx";
import axios from "axios";
import Loader from "../Component/Loader.jsx";
import { UserContext } from "../Context/userContext.js";

const Bookmark = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useContext(UserContext);
  const token = currentUser?.token;

  useEffect(() => {
    if (!currentUser?.id || !token) {
      console.error("User ID or token is missing");
      return;
    }

    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/bookmarkedPost/${currentUser.id}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPosts(response?.data);
      } catch (err) {
        console.error("Error fetching bookmarked posts:", err);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, [currentUser?.id, token]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="container">
      <div className="category_container">
        <h2 className="category_label">Your Bookmarks</h2>
      </div>
      {posts.length > 0 ? (
        <div className="posts__container">
          {posts.map(
            ({
              _id: id,
              title,
              category,
              description,
              creator,
              thumbnailURL,
              createdAt,
            }) => (
              <PostItem
                key={id}
                postID={id}
                thumbnail={thumbnailURL}
                category={category}
                title={title}
                description={description}
                authorID={creator}
                createdAt={createdAt}
              />
            )
          )}
        </div>
      ) : (
        <h2 className="center blur">
          No bookmarks to display. Start saving content for quick access
          anytime.
        </h2>
      )}
    </section>
  );
};

export default Bookmark;
