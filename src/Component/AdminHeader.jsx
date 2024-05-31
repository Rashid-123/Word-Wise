import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const AdminHeader = () => {
  return (
    <nav>
      <div className="container nav_container">
        <ul className="admin_navbar">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link>Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/posts">allposts</Link>
          </li>
          <li>
            <Link>featured</Link>
          </li>
          <li>
            <Link to="/admin/reports">reports</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default AdminHeader;
