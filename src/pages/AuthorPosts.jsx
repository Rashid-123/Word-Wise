import React, { useState, useEffect } from "react";
import PostItem from "../Component/PostItem";
import axios from "axios";
import Loader from "../Component/Loader";
import { useParams } from "react-router-dom";

const AuthorPosts = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/posts`
        );
        setPosts(response?.data);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/${id}`
        );
        setUser(response?.data);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [id]);

  // console.log(random);

  if (isLoading) {
    return <Loader />;
  }
  console.log(posts);
  const filteredPosts = posts.filter((post) => post.creator === id);
  return (
    <section className="container">
      <div className="category_container">
        <h2 className="category_label"> Blogs by {user.name}</h2>
      </div>
      {filteredPosts.length > 0 ? (
        <div className="posts__container">
          {filteredPosts.map(
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
        <h2 className="center">No Post Found</h2>
      )}
    </section>
  );
};

export default AuthorPosts;
