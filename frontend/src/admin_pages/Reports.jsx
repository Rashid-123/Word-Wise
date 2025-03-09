import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";
import ReportPost from "../admin_components/ReportPost";
import ReportUser from "../admin_components/ReportUser";
import Loader from "../Component/Loader";

const Reports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState([]);

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

  const clearReport = async (userId, postId, reportId) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/admin/clearReport`,
        {
          data: { userId, postId, reportId },
        }
      );

      // Update the reports state with the new reports list from the response
      if (response.data) {
        setReports(response.data);
      } else {
        setReports((prevReports) =>
          prevReports.filter((report) => report._id !== reportId)
        );
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="container">
      <div className="report_header">
        <h3>By</h3>
        <h3>for</h3>
      </div>
      {reports && reports.length > 0 ? (
        reports.map((report) => (
          <div key={report._id} className="report">
            <div className="report_clear">
              <button
                className="btn pr"
                onClick={() =>
                  clearReport(report.reportBy, report.post, report._id)
                }
              >
                clear
              </button>
            </div>
            <div>
              <ReportUser userId={report.reportBy} />
            </div>
            <div>
              <ReportPost postId={report.post} />
            </div>
          </div>
        ))
      ) : (
        <div className="center">No reports found.</div>
      )}
    </section>
  );
};

export default Reports;
