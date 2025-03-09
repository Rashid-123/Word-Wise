import React, { useContext, useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const AdminHeader = () => {
  const [Btn_allposts, setBtn_allposts] = useState(false);
  const [Btn_report, setBtn_report] = useState(false);
  const [Btn_dashboard, setBtn_dashboard] = useState(true);

  const togglehandler = (button) => {
    setBtn_allposts(false);
    setBtn_dashboard(false);
    setBtn_report(false);
    if (button === "dashboard") {
      setBtn_dashboard(true);
    } else if (button === "allPosts") {
      setBtn_allposts(true);
    } else if (button === "reports") {
      setBtn_report(true);
    }
  };
  return (
    <nav>
      <div className="container nav_container">
        <ul className="admin_navbar">
          <li>
            <Link to="/">
              <FaHome
                style={{
                  padding: "5px",
                }}
                size={34}
                color="white"
              />
            </Link>
          </li>
          <li>
            <Link
              className={Btn_dashboard ? "active" : "anchor"}
              onClick={() => togglehandler("dashboard")}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              className={Btn_allposts ? "active" : "anchor"}
              to="/admin/posts"
              onClick={() => togglehandler("allPosts")}
            >
              posts
            </Link>
          </li>

          <li>
            <Link
              className={Btn_report ? "active" : "anchor"}
              to="/admin/reports"
              onClick={() => togglehandler("reports")}
            >
              reports
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default AdminHeader;
