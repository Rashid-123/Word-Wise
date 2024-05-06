import React from "react";
import { Link } from "react-router-dom";
import PostAuthor from "./PostAuthor.jsx";
const Featured = ({
  postID,
  thumbnail,
  category,
  title,
  description,
  authorID,
  createdAt,
}) => {
  const shortDescription =
    description.length > 400
      ? description.substr(0, 400) + " . . ."
      : description;
  const postTitle = title.length > 40 ? title.substr(0, 40) + " . . ." : title;
  return (
    <article className="featured__post">
      <div className="featured__1">
        <p className="featured__label">FEATURED</p>
        <div className="featured__content">
          <Link to={`posts/${postID}`}>
            <h1>{postTitle}</h1>
          </Link>
          <p>{shortDescription}</p>
        </div>
        <div className="post__footer">
          <PostAuthor authorID={authorID} createdAt={createdAt} />
          <Link to={`/posts/categories/${category}`} className="btn category">
            {category}
          </Link>
        </div>
      </div>
      <img
        src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${thumbnail}`}
        alt="Featured Post Thumbnail"
      />
    </article>
  );
};
export default Featured;
