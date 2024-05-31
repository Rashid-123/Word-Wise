import React from "react";
import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import AdminHeader from "./AdminHeader";
const AdminLayout = () => {
  return (
    <>
      <AdminHeader />
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export default AdminLayout;
