import React, { useState, useEffect } from "react";
import PostItem from "./PostItem";
import Featured from "./Featured.jsx";
import axios from "axios";
import Loader from "../Component/Loader.jsx";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/posts`
        );
        console.log(response.data);
        if (Array.isArray(response.data)) {
          setPosts(response.data);
        }
      } catch (err) {
        console.log(err);
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
      <Featured post={featuredPost} />
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
        <h2 className="center">No Post Found</h2>
      )}
    </section>
  );
};

export default Posts;
