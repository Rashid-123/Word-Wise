import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PostAuthor from "./PostAuthor.jsx";

const Featured = ({ post }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (post && post.thumbnailURL) {
      const img = new Image();
      img.src = post.thumbnailURL;
      img.onload = () => setImageLoaded(true);
    }
  }, [post]);

  const truncateText = (text, maxLength) => {
    if (!text) return ""; // Null check added here
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  if (!post) {
    return null; // or return a loader, placeholder, etc.
  }

  return (
    <article className="featured__post">
      <div className="featured__1">
        <p className="featured__label">FEATURED</p>
        <div className="featured__content">
          <Link to={`posts/${post?._id}`}>
            <h1 className="featured_title">{post?.title}</h1>
          </Link>
          <p className="featured__description">
            {truncateText(post?.shortDescription, 350)}
          </p>
        </div>
        <div className="post__footer">
          <PostAuthor authorID={post?.creator} createdAt={post.createdAt} />
          <Link
            to={`/posts/categories/${post?.category}`}
            className="btn category"
          >
            {post?.category}
          </Link>
        </div>
      </div>
      <div className="image_box">
        <div className={`featured__image ${imageLoaded ? "loaded" : ""}`}>
          {imageLoaded ? (
            <img src={post?.thumbnailURL} alt="Featured Post Thumbnail" />
          ) : (
            <div className="image-placeholder"></div>
          )}
        </div>
      </div>
    </article>
  );
};

export default Featured;
