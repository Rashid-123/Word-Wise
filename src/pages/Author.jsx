import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import axios from "axios";
import Loader from "../Component/Loader";
const Author = () => {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getAuthors = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users`
        );
        setAuthors(response.data);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };
    getAuthors();
  }, []);

  if (isLoading) {
    return <Loader />;
  }
  return (
    <section className="authors">
      {authors.length > 0 ? (
        <div className="container authors__container">
          {authors.map(({ _id: id, avatarURL, name, posts }) => {
            return (
              <Link className="author" key={id} to={`/posts/users/${id}`}>
                <div className="author__avatar">
                  <img src={avatarURL} alt={name} />
                </div>

                <h4>{name}</h4>
                <p>{posts}</p>
              </Link>
            );
          })}
        </div>
      ) : (
        <h2>No users/authors found</h2>
      )}
    </section>
  );
};

export default Author;
