import React from "react";
import { Link } from "react-router-dom";
import PostAuthor from "./PostAuthor.jsx";

const Featured = ({ post }) => {
  if (!post) {
    return null; // or return a loader, placeholder, etc.
  }

  return (
    <article className="featured__post">
      <div className="featured__1">
        <p className="featured__label">FEATURED</p>
        <div className="featured__content">
          <Link to={`posts/${post._id}`}>
            <h1>{post.title}</h1>
          </Link>
        </div>
        <div className="post__footer">
          <PostAuthor authorID={post.creator} createdAt={post.createdAt} />
          <Link
            to={`/posts/categories/${post.category}`}
            className="btn category"
          >
            {post.category}
          </Link>
        </div>
      </div>
      <img src={post.thumbnailURL} alt="Featured Post Thumbnail" />
    </article>
  );
};

export default Featured;
