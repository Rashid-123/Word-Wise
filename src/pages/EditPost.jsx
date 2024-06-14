import React, { useContext, useEffect, useState, useTransition } from "react";
import ReactQuill from "react-quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../Context/userContext";
const EditPost = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  const { currentUser } = useContext(UserContext);
  const token = currentUser?.token;

  // redirect to login page for any user who isn't logged in
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  const POST_CATEGORIES = [
    "Agriculture",
    "Business",
    "Education",
    "Entertainment",
    "Art",
    "Weather",
    "Investment",
    "programming",
    "others",
  ];

  useEffect(() => {
    const getPost = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/posts/${id}`
        );
        const postData = response.data; // Assuming the response is an object with title, description, etc.
        setTitle(postData.title);
        setShortDescription(postData.shortDescription);
        setCategory(postData.category);
        setDescription(postData.description);
        // Assuming thumbnail is stored in postData.thumbnail
        // If it's a file, you may need additional handling
        setThumbnail(postData.thumbnail);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred.");
      }
    };
    getPost(); // Call getPost only once
  }, []); // Empty dependency array ensures it runs only on component mount

  const editPost = async (e) => {
    e.preventDefault();
    const postData = new FormData();
    postData.append("title", title);
    postData.append("shortDescription", shortDescription);
    postData.append("category", category);
    postData.append("description", description);
    if (thumbnail) {
      postData.append("thumbnail", thumbnail);
    }

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/posts/${id}`,
        postData,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        return navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <section className="create-post">
      <div className="container">
        <h2>Edit Post</h2>
        {error && <p className="form__error-message">{error} </p>}
        <form className="form create-post__form" onSubmit={editPost}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />{" "}
          <textarea
            placeholder="Short Description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows="3"
            style={{ resize: "vertical" }}
            // autoFocus
          />
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {POST_CATEGORIES.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <ReactQuill
            className="custom-editor"
            theme="snow"
            style={{ height: "400px" }}
            modules={modules}
            formats={formats}
            value={description}
            onChange={setDescription}
          />
          <input
            type="file"
            style={{ marginTop: "40px" }}
            onChange={(e) => setThumbnail(e.target.files[0])}
            accept="png , jpg , jpeg"
          />
          <button type="submit" className="btn primary">
            Update
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditPost;
