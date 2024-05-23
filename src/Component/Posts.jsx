import React, { useState, useEffect, useMemo } from "react";
import PostItem from "./PostItem";
import Featured from "./Featured.jsx";
import axios from "axios";
import Loader from "../Component/Loader.jsx";
import { v4 as uuidv4 } from "uuid";

const Posts = () => {
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
        setPosts(response?.data);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };
    fetchPosts();
  }, []);

  const random = useMemo(() => {
    if (posts.length > 0) {
      const middleIndex = Math.floor(posts.length / 2);
      return posts[middleIndex];
    }
    return null;
  }, [posts]);
  // console.log(random);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="container">
      {posts.length > 0 ? (
        <Featured
          key={uuidv4()}
          postID={random._id}
          thumbnail={random.thumbnailURL}
          category={random.category}
          title={random.title}
          description={random.description}
          authorID={random.creator}
          createdAt={random.createdAt}
        />
      ) : (
        <h2></h2>
      )}
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
