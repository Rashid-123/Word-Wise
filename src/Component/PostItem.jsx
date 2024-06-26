import React from "react";
import { Link } from "react-router-dom";
import PostAuthor from "./PostAuthor.jsx";
const PostItem = ({
  postID,
  thumbnail,
  category,
  title,
  description,
  authorID,
  createdAt,
}) => {
  const shortDescription =
    description.length > 90
      ? description.substr(0, 90) + " . . ."
      : description;
  const postTitle = title.length > 46 ? title.substr(0, 45) + " . . ." : title;

  return (
    <article className="post">
      <Link to={`/posts/${postID}`}>
        <div className="post__thumbnail">
          <img src={thumbnail} alt={title}></img>
        </div>
      </Link>

      <div className="post__content">
        <Link to={`/posts/${postID}`}>
          <h3 className="multiline">{postTitle}</h3>
        </Link>
        {/* <p className="shortDescription">{shortDescription}</p> */}
        <div className="post__footer">
          <PostAuthor authorID={authorID} createdAt={createdAt} />
          <Link to={`/posts/categories/${category}`} className="btn category">
            {category}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostItem;
