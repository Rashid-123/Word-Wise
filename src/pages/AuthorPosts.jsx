import Loader from "../Component/Loader";
import React, { useState, useEffect, useContext } from "react";
import PostItem from "../Component/PostItem";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../Context/userContext";

const AuthorPosts = () => {
  const [posts, setPosts] = useState(null);
  const [user2, setUser2] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  //
  const [activeTab, setActiveTab] = useState("posts");
  //

  const { currentUser } = useContext(UserContext);
  const token = currentUser?.token;
  const navigate = useNavigate();
  const userId = currentUser?.id;

  const { id } = useParams();

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/users/${userId}`
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUsersData = async () => {
      setIsLoading(true);
      const currentUserData = await fetchUserData(currentUser?.id);
      const otherUserData = await fetchUserData(id);

      if (currentUserData) {
        setIsFollowing(currentUserData.following.includes(id));
      }
      if (otherUserData) {
        setUser2(otherUserData);
        setIsFollowing(otherUserData.followers.includes(userId));
      }
      setIsLoading(false);
    };

    fetchUsersData();
  }, [currentUser?.id, id, userId]);
  //
  //
  useEffect(() => {
    const fetchFollowersFollowing = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/users/followers-followings`, // Adjust endpoint as needed
          { userId: id }
        );

        setFollowers(response.data.followers);
        setFollowing(response.data.following);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching followers and following data:", error);
        setIsLoading(false);
      }
    };

    fetchFollowersFollowing();
  }, [id]);
  //
  //
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/posts/users/${id}`
        );
        setPosts(response.data);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };
    fetchPosts();
  }, [id]);

  const toggleFollow = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const endpoint = isFollowing ? "unfollow" : "follow";
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/${endpoint}`,
        { user1: currentUser?.id, user2: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(!isFollowing);

      setUser2((prevUser2) => ({
        ...prevUser2,
        followers: isFollowing
          ? prevUser2.followers.filter((followerId) => followerId !== userId)
          : [...prevUser2.followers, userId],
      }));
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="user_post_container">
      <div className="user_info">
        <img src={user2?.avatarURL} alt="" />
        <div className="name_box">
          <h2>{user2?.name}</h2>
          <div>
            <span className="count">{user2?.followers.length}</span> followers
            <span className="count">{user2?.following.length}</span> following
          </div>
        </div>
        <div className="follow">
          <div onClick={toggleFollow}>
            {currentUser?.id !== id &&
              (isFollowing ? (
                <button className="follow_button">Following</button>
              ) : (
                <button className="follow_button">Follow</button>
              ))}
          </div>
        </div>
      </div>
      <div className="user_button_container">
        <button
          className={activeTab === "posts" ? "button_active" : "button_disable"}
          onClick={() => setActiveTab("posts")}
          disabled={activeTab === "posts"}
        >
          Posts
        </button>
        <button
          className={
            activeTab === "followers" ? "button_active" : "button_disable"
          }
          onClick={() => setActiveTab("followers")}
          disabled={activeTab === "followers"}
        >
          Followers
        </button>
        <button
          className={
            activeTab === "following" ? "button_active" : "button_disable"
          }
          onClick={() => setActiveTab("following")}
          disabled={activeTab === "following"}
        >
          Followings
        </button>
      </div>
      {activeTab === "posts" &&
        (posts?.length > 0 ? (
          <div className="user_posts__container2">
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
        ))}
      {activeTab === "followers" && (
        <div className="followers_box">
          {followers.length > 0 ? (
            followers.map((follower) => (
              <Link
                to={`/posts/users/${follower._id}`}
                key={follower._id}
                className="follower_ind"
              >
                <img src={follower.avatar} alt={follower.name} />
                <p>{follower.name}</p>
              </Link>
            ))
          ) : (
            <p className="center"> 0 Followors</p>
          )}
        </div>
      )}
      {activeTab === "following" && (
        <div className="followers_box">
          {following.length > 0 ? (
            following.map((following) => (
              <Link
                to={`/posts/users/${following._id}`}
                key={following._id}
                className="follower_ind"
              >
                <img src={following.avatar} alt={following.name} />
                <p>{following.name}</p>
              </Link>
            ))
          ) : (
            <p className="center">0 Following</p>
          )}
        </div>
      )}
    </section>
  );
};

export default AuthorPosts;
