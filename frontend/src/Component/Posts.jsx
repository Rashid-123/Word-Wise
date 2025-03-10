import React, { useState, useEffect } from "react";
import PostItem from "./PostItem";
import Featured from "./Featured.jsx";
import axios from "axios";
import Loader from "../Component/Loader.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState(null); // Number of posts initially visible
  const [postsToShow, setPostsToShow] = useState(null); // Posts to show based on window size

  useEffect(() => {
    const fetchFeaturedPost = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/posts/getfeatured`
        );
        setFeaturedPost(response.data);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };
    fetchFeaturedPost();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/posts`
        );
        if (Array.isArray(response.data)) {
          console.log(response.data);
          setPosts(response.data);
        }
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900) {
        setVisiblePosts(6);
        setPostsToShow(6);
      } else {
        setVisiblePosts(8);
        setPostsToShow(8);
      }
    };

    // Set initial value based on window size
    handleResize();

    // // Add event listener
    // window.addEventListener("resize", handleResize);

    // // Clean up event listener on component unmount
    // return () => {
    //   window.removeEventListener("resize", handleResize);
    // };
  }, []);

  const handleShowMore = () => {
    setVisiblePosts((prevVisiblePosts) => prevVisiblePosts + postsToShow);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="container">
      <Featured post={featuredPost} />
      {posts.length > 0 ? (
        <div className="posts__container">
          {posts
            .slice(0, visiblePosts)
            .map(
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
        <h2 className="center">No Post Found</h2>
      )}
      {visiblePosts < posts.length && (
        <div className="center">
          <button onClick={handleShowMore} className="show-more-button">
            Show More <FontAwesomeIcon icon={faChevronDown} />
          </button>
        </div>
      )}
    </section>
  );
};

export default Posts;
