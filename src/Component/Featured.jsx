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
      <Link className="star" to={`posts/${post?._id}`}>
        <p className="featured__label">
          <span className="featured_icon">★</span>FEATURED
        </p>
      </Link>
      <Link to={`posts/${post?._id}`}>
        <h1 className="featured_title">{post?.title}</h1>
      </Link>{" "}
      <Link className="image_box">
        <div className={`featured__image ${imageLoaded ? "loaded" : ""}`}>
          {imageLoaded ? (
            <Link to={`posts/${post?._id}`}>
              <img src={post?.thumbnailURL} alt="Featured Post Thumbnail" />
            </Link>
          ) : (
            <div className="image-placeholder"></div>
          )}
        </div>
      </Link>
      <Link to={`posts/${post?._id}`}>
        <p className="featured__description">
          {truncateText(post?.shortDescription, 350)}
        </p>
      </Link>
      <div className="post__footer">
        <PostAuthor authorID={post?.creator} createdAt={post.createdAt} />
        <Link
          to={`/posts/categories/${post?.category}`}
          className="btn category"
        >
          {post?.category}
        </Link>
      </div>
    </article>
  );
};

export default Featured;
