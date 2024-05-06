import React, { useState, useEffect } from "react";
import PostItem from "../Component/PostItem";
import axios from "axios";
import Loader from "../Component/Loader";
import { useParams } from "react-router-dom";

const CatagoryPosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { category } = useParams();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/posts/categories/${category}`
        );
        setPosts(response?.data || []); // Set posts to an empty array if response.data is null or undefined
      } catch (err) {
        console.log(err);
        setPosts([]); // Set posts to an empty array on error
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, [category]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="container">
      <div className="category_container">
        <h1 className="category_label">{category}</h1>
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
              thumbnail,
              createdAt,
            }) => (
              <PostItem
                key={id}
                postID={id}
                thumbnail={thumbnail}
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
        <h2 className="center">No Post Found for {category}</h2>
      )}
    </section>
  );
};

export default CatagoryPosts;
