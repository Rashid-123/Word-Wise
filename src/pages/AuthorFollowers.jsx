import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../Component/Loader";

const AuthorFollowers = () => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [follwerActive, setfollowerActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();

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
  const follower_lable_handler = () => {
    setfollowerActive(!follwerActive);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="author-followers ">
      <div className="follower_label">
        <button
          className={follwerActive ? "follower_active" : "follower_disable"}
          onClick={follower_lable_handler}
          disabled={follwerActive}
        >
          Followers
        </button>
        <button
          className={!follwerActive ? "follower_active" : "follower_disable"}
          onClick={follower_lable_handler}
          disabled={!follwerActive}
        >
          Followings
        </button>
      </div>
      {follwerActive ? (
        <div>
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
            <p>No followers found.</p>
          )}
        </div>
      ) : (
        <div>
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
            <p>No following found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthorFollowers;
