import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";
import ReportPost from "../admin_components/ReportPost";
import ReportUser from "../admin_components/ReportUser";
import Loader from "../Component/Loader";

const Reports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState(null);
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/admin/getReports`
        );

        if (Array.isArray(response.data)) {
          setReports(response.data);
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };

    fetchReports();
  }, []);

  if (isLoading) {
    return <Loader />;
  }
  return (
    <section className="container">
      {reports && reports.length > 0 ? (
        reports.map((report) => (
          <div key={report._id} className="report">
            <div>
              <p>By</p>
              <ReportUser userId={report.reportBy} />
            </div>
            <ReportPost postId={report.post} />
          </div>
        ))
      ) : (
        <div>No reports found.</div>
      )}
    </section>
  );
};

export default Reports;
