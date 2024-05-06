import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { UserContext } from "../Context/userContext";

const Header = () => {
  const [isNavShowing, setIsNavShowing] = useState(window.innerWidth > 800);
  const [isCreateActive, setIsCreateActive] = useState(false);
  const [isProfileActive, setIsProfileActive] = useState(false);
  const [isAuthorActive, setIsAuthorActive] = useState(false);
  const [isLoginActive, setIsLoginActive] = useState(false);
  const { currentUser } = useContext(UserContext);
  const location = useLocation();

  localStorage.setItem("isCreateActive", JSON.stringify(true));

  // In useEffect to check and update the state

  const closeNavHandler = () => {
    setIsNavShowing(window.innerWidth > 800);
  };

  const handleCreateClick = () => {
    setIsCreateActive(true);
    setIsProfileActive(false);
    setIsAuthorActive(false);
    setIsLoginActive(false);
    closeNavHandler();
  };

  const handleProfileClick = () => {
    setIsCreateActive(false);
    setIsProfileActive(true);
    setIsAuthorActive(false);
    setIsLoginActive(false);
    closeNavHandler();
  };

  const handleAuthorClick = () => {
    setIsCreateActive(false);
    setIsProfileActive(false);
    setIsAuthorActive(true);
    setIsLoginActive(false);
    closeNavHandler();
  };

  const handleLoginClick = () => {
    setIsAuthorActive(false);
    setIsLoginActive(true);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsNavShowing(window.innerWidth > 800);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const validPaths = ["profile", "create", "login", "logout", "authors"];
    const isValidPath = validPaths.some((path) =>
      location.pathname.includes(path)
    );

    if (!isValidPath) {
      setIsCreateActive(false);
      setIsProfileActive(false);
      setIsAuthorActive(false);
      setIsLoginActive(false);
    }
  }, [location.pathname]);

  // Reset active buttons when returning to home route
  // useEffect(() => {
  //   if (location.pathname === "/") {
  //     setIsCreateActive(false);
  //     setIsProfileActive(false);
  //     setIsAuthorActive(false);
  //     setIsLoginActive(false);
  //   }
  // }, [location.pathname]);

  return (
    <nav>
      <div className="container nav__container">
        <Link to="/" className="nav__logo" onClick={closeNavHandler}>
          <h2 className="wordwise">WordWise</h2>
        </Link>

        {currentUser?.id && isNavShowing && (
          <ul className="nav__menu">
            <li>
              <Link
                className={isProfileActive ? "active" : "anchor"}
                to={`profile/${currentUser.id}`}
                onClick={handleProfileClick}
              >
                {currentUser.name}
              </Link>
            </li>
            <li>
              <Link
                className={isCreateActive ? "active" : "anchor"}
                to="/create"
                onClick={handleCreateClick}
              >
                Create Post
              </Link>
            </li>
            <li>
              <Link
                className={isAuthorActive ? "active" : "anchor"}
                to="/authors"
                onClick={handleAuthorClick}
              >
                Author
              </Link>
            </li>
            <li>
              <Link className="anchor" to="/logout" onClick={closeNavHandler}>
                Logout
              </Link>
            </li>
          </ul>
        )}

        {!currentUser?.id && isNavShowing && (
          <ul className="nav__menu">
            <li>
              <Link
                className={isAuthorActive ? "active" : "anchor"}
                to="/authors"
                onClick={(event) => {
                  handleAuthorClick();
                  closeNavHandler();
                }}
              >
                Author
              </Link>
            </li>
            <li>
              <Link
                className={isLoginActive ? "active" : "anchor"}
                to="/login"
                onClick={(event) => {
                  handleLoginClick();
                  closeNavHandler();
                }}
              >
                Login
              </Link>
            </li>
          </ul>
        )}

        <button
          className="nav__toggle-btn"
          onClick={() => setIsNavShowing(!isNavShowing)}
        >
          {isNavShowing ? <AiOutlineClose /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Header;
