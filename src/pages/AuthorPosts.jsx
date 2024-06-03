import React, { useState, useEffect, useContext } from "react";
import PostItem from "../Component/PostItem";
import axios from "axios";
import Loader from "../Component/Loader";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { UserContext } from "../Context/userContext";

const AuthorPosts = () => {
  const [posts, setPosts] = useState(null);
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //
  const { currentUser } = useContext(UserContext);
  const token = currentUser?.token;
  const navigate = useNavigate();
  const userId = currentUser?.id;
  //
  const { id } = useParams();

  const toggleFollow = async () => {
    if (!token) {
      navigate("/login");
    }

    try {
      const endpoint = isFollowing ? "unfollow" : "follow";
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/${endpoint}`,
        { user1: currentUser.id, user2: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/posts/users/${id}`
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

  // const filteredPosts = posts.filter((post) => post.creator === id);
  return (
    <section className="user_post_container">
      <div className="user_info">
        <img src={user?.avatarURL} alt="" />
        <div className="">
          <h2>{user?.name}</h2>
          <p>
            <span className="count">{user?.followers.length}</span>followers
          </p>
          <p>
            <span className="count">{user?.following.length}</span>following
          </p>
        </div>
        <div onClick={toggleFollow}>
          {isFollowing ? <button>following</button> : <button>follow</button>}
        </div>
      </div>
      {posts?.length > 0 ? (
        <div className="user_posts__container2">
          {posts?.map(
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

export default AuthorPosts;
