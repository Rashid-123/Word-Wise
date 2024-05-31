import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Loader from "../Component/Loader.jsx";
import { v4 as uuidv4 } from "uuid";
import Post from "../admin_components/Post.jsx";

const Allposts = () => {
  const [posts, setPosts] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

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
      {posts?.length > 0 ? (
        <div className="admin_allPosts">
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
              <Post
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

export default Allposts;
