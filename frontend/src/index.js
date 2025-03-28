// import React from "react";
// import ReactDOM from "react-dom/client";
// import { RouterProvider, createBrowserRouter } from "react-router-dom";
// import "./index.css";
// import AdminLayout from "./Component/AdminLayout.jsx";
// import Layout from "./Component/Layout";
// import ErrorPage from "./pages/ErrorPage";
// import Home from "./pages/Home.jsx";
// import PostDetail from "./pages/PostDetail.jsx";
// import Register from "./pages/Register.jsx";
// import Login from "./pages/Login.jsx";
// import LoginwithOTP from "./pages/LoginwithOTP.jsx";
// import AdminLogin from "./pages/AdminLogin.jsx";
// import PostDetail_Admin from "./admin_pages/postdetail_admin.jsx";

// import UserProfile from "./pages/UserProfile.jsx";
// import Authors from "./pages/Author.jsx";
// import CreatePost from "./pages/CreatePosts.jsx";
// import EditPosts from "./pages/EditPost.jsx";
// import DeletePost from "./pages/DeletePost.jsx";
// import CatagoryPosts from "./pages/CatagoryPosts.jsx";
// import AuthorPosts from "./pages/AuthorPosts.jsx";
// import Dashboard from "./pages/Dashboard.jsx";
// import Logout from "./pages/Logout.jsx";
// import Bookmark from "./pages/Bookmark.jsx";
// import UserProvider from "./Context/userContext.js";
// import AdminHome from "./admin_pages/AdminHome.jsx";
// import Reports from "./admin_pages/Reports.jsx";

// import Allposts from "./admin_pages/Allposts.jsx";
// import AuthorFollowers from "./pages/AuthorFollowers.jsx";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: (
//       <UserProvider>
//         <Layout />
//       </UserProvider>
//     ),
//     errorElement: <ErrorPage />,
//     children: [
//       { index: true, element: <Home /> },
//       { path: "posts/:id", element: <PostDetail /> },
//       { path: "register", element: <Register /> },
//       { path: "login", element: <Login /> },
//       { path: "loginwithOTP", element: <LoginwithOTP /> },
//       { path: "admin_login", element: <AdminLogin /> },
//       { path: "profile/:id", element: <UserProfile /> },
//       { path: "authors", element: <Authors /> },
//       { path: "create", element: <CreatePost /> },
//       { path: "posts/:id/edit", element: <EditPosts /> },
//       { path: "posts/:id/delete", element: <DeletePost /> },
//       { path: "posts/categories/:category", element: <CatagoryPosts /> },
//       { path: "posts/users/:id", element: <AuthorPosts /> },
//       { path: "user/followers/:id", element: <AuthorFollowers /> },
//       { path: "myposts/:id", element: <Dashboard /> },
//       { path: "logout", element: <Logout /> },
//       { path: "bookmark/:id", element: <Bookmark /> },
//     ],
//   },
//   {
//     path: "/admin",
//     element: (
//       <UserProvider>
//         <AdminLayout />
//       </UserProvider>
//     ),
//     errorElement: <ErrorPage />,
//     children: [
//       { index: true, element: <AdminHome /> },
//       { path: "reports", element: <Reports /> },
//       { path: "posts", element: <Allposts /> },
//       { path: "postDetail/:id", element: <PostDetail_Admin /> },
//     ],
//   },
// ]);
// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <RouterProvider router={router} />
//   </React.StrictMode>
// );
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import AdminLayout from "./Component/AdminLayout.jsx";
import Layout from "./Component/Layout";
import ErrorPage from "./pages/ErrorPage";
import UserProvider from "./Context/userContext.js";

// Lazy load the components
const Home = lazy(() => import("./pages/Home.jsx"));
const PostDetail = lazy(() => import("./pages/PostDetail.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const LoginwithOTP = lazy(() => import("./pages/LoginwithOTP.jsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));
const PostDetail_Admin = lazy(() =>
  import("./admin_pages/postdetail_admin.jsx")
);
const UserProfile = lazy(() => import("./pages/UserProfile.jsx"));
const Authors = lazy(() => import("./pages/Author.jsx"));
const CreatePost = lazy(() => import("./pages/CreatePosts.jsx"));
const EditPosts = lazy(() => import("./pages/EditPost.jsx"));
const DeletePost = lazy(() => import("./pages/DeletePost.jsx"));
const CatagoryPosts = lazy(() => import("./pages/CatagoryPosts.jsx"));
const AuthorPosts = lazy(() => import("./pages/AuthorPosts.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Logout = lazy(() => import("./pages/Logout.jsx"));
const Bookmark = lazy(() => import("./pages/Bookmark.jsx"));
const AdminHome = lazy(() => import("./admin_pages/AdminHome.jsx"));
const Reports = lazy(() => import("./admin_pages/Reports.jsx"));
const Allposts = lazy(() => import("./admin_pages/Allposts.jsx"));
const AuthorFollowers = lazy(() => import("./pages/AuthorFollowers.jsx"));

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
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "posts/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <PostDetail />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "loginwithOTP",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LoginwithOTP />
          </Suspense>
        ),
      },
      {
        path: "admin_login",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLogin />
          </Suspense>
        ),
      },
      {
        path: "profile/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <UserProfile />
          </Suspense>
        ),
      },
      {
        path: "authors",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Authors />
          </Suspense>
        ),
      },
      {
        path: "create",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <CreatePost />
          </Suspense>
        ),
      },
      {
        path: "posts/:id/edit",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <EditPosts />
          </Suspense>
        ),
      },
      {
        path: "posts/:id/delete",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <DeletePost />
          </Suspense>
        ),
      },
      {
        path: "posts/categories/:category",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <CatagoryPosts />
          </Suspense>
        ),
      },
      {
        path: "posts/users/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AuthorPosts />
          </Suspense>
        ),
      },
      {
        path: "user/followers/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AuthorFollowers />
          </Suspense>
        ),
      },
      {
        path: "myposts/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "logout",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Logout />
          </Suspense>
        ),
      },
      {
        path: "bookmark/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Bookmark />
          </Suspense>
        ),
      },
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
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AdminHome />
          </Suspense>
        ),
      },
      {
        path: "reports",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Reports />
          </Suspense>
        ),
      },
      {
        path: "posts",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Allposts />
          </Suspense>
        ),
      },
      {
        path: "postDetail/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <PostDetail_Admin />
          </Suspense>
        ),
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
