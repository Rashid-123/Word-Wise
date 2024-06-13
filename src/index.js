import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import AdminLayout from "./Component/AdminLayout.jsx";
import Layout from "./Component/Layout";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages/Home.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import PostDetail_Admin from "./admin_pages/postdetail_admin.jsx";

import UserProfile from "./pages/UserProfile.jsx";
import Authors from "./pages/Author.jsx";
import CreatePost from "./pages/CreatePosts.jsx";
import EditPosts from "./pages/EditPost.jsx";
import DeletePost from "./pages/DeletePost.jsx";
import CatagoryPosts from "./pages/CatagoryPosts.jsx";
import AuthorPosts from "./pages/AuthorPosts.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Logout from "./pages/Logout.jsx";
import Bookmark from "./pages/Bookmark.jsx";
import UserProvider from "./Context/userContext.js";
import AdminHome from "./admin_pages/AdminHome.jsx";
import Reports from "./admin_pages/Reports.jsx";

import Allposts from "./admin_pages/Allposts.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <UserProvider>
        <Layout />
      </UserProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "posts/:id", element: <PostDetail /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "admin_login", element: <AdminLogin /> },
      { path: "profile/:id", element: <UserProfile /> },
      { path: "authors", element: <Authors /> },
      { path: "create", element: <CreatePost /> },
      { path: "posts/:id/edit", element: <EditPosts /> },
      { path: "posts/:id/delete", element: <DeletePost /> },
      { path: "posts/categories/:category", element: <CatagoryPosts /> },
      { path: "posts/users/:id", element: <AuthorPosts /> },
      { path: "myposts/:id", element: <Dashboard /> },
      { path: "logout", element: <Logout /> },
      { path: "bookmark/:id", element: <Bookmark /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <UserProvider>
        <AdminLayout />
      </UserProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AdminHome /> },
      { path: "reports", element: <Reports /> },
      { path: "posts", element: <Allposts /> },
      { path: "featured/:id", element: <PostDetail_Admin /> },
    ],
  },
]);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
