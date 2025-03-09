import React from "react";
import { Link } from "react-router-dom";

const categories = [
  "Agriculture",
  "Business",
  "Education",
  "Entertainment",
  "Art",
  "Investment",
  "Weather",
  "Programming",
  "Others",
];

const Footer = () => {
  return (
    <footer>
      <ul className="footer__categories">
        {categories.map((category) => (
          <li key={category}>
            <Link to={`/posts/categories/${category}`}>{category}</Link>
          </li>
        ))}
      </ul>
      <div className="footer__copyright">
        <small>All Rights Reserved &copy; Copyright, SHADAN RASHID</small>
      </div>
    </footer>
  );
};

export default Footer;
