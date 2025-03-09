const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Admin = require("../models/adminModel");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");
const mime = require("mime-types");
const { Types } = require("mongoose");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const redisClient = require("../redisClient");
//
///// --------------- AWS S3 Setup ----------------------------

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function getObjectURL(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command);
  return url;
}

////////////////////////////////////////////////////////////
//---------------- SET FEATURED POST -------------------------
const addFeaturedPost = async (req, res) => {
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.featured = new mongoose.Types.ObjectId(postId);

    await admin.save();

    // here Featured post is cached
    const post = await Post.findById(postId);
    let thumbnailURL = null;
    if (post.thumbnail) {
      thumbnailURL = await getObjectURL(post.thumbnail);
    }

    const postResponse = { ...post.toObject(), thumbnailURL };

    await redisClient.set(`post:featured`, JSON.stringify(postResponse));
    //

    res.status(200).json({
      message: "Featured post updated successfully",
      featured: admin.featured,
    });
  } catch (error) {
    console.error("Error updating featured post:", error);
    res.status(500).json({ message: "Failed to update featured post", error });
  }
};

////////////////////////////////////////////////////
//------------- GET ALL USERS ----------------------
const getAllUsers = async (req, res, next) => {
  try {
    console.log("in user try");
    const authors = await User.find().select("-password");
    const authorsWithAvatars = await Promise.all(
      authors.map(async (author) => {
        const authorObj = author.toObject();
        if (author.avatar) {
          authorObj.avatarURL = await getObjectURL(author.avatar);
        }
        return authorObj;
      })
    );

    res.json(authorsWithAvatars);
  } catch (error) {
    return next(new HttpError(error));
  }
};
////////////////////////////////////////////////////////////////
//------------ CREATE ADMIN ------------------------------
const CreateAdmin = async (req, res, next) => {
  try {
    console.log("in try");
    const { featured = null, reports = [] } = req.body;
    console.log("After body");
    console.log(featured);
    const newAdmin = await Admin.create({
      featured,
      reports,
    });
    console.log("Admin created");
    res.status(201).json(newAdmin);
  } catch (error) {
    return next(new HttpError("Admin registration fail"));
  }
};
///////////////////////////////////////////////////////////////////////
///------------------ ADD REPORTS -------------------------------
const addReports = async (req, res, next) => {
  const { reportBy, post } = req.body;

  try {
    // Find the admin by ID
    const admin = await Admin.findOne();

    if (!admin) {
      return next(new HttpError("Admin not found", 404));
    }

    // Create a new report object
    const newReport = {
      reportBy,
      post,
    };

    // Push the new report into the reports array
    admin.reports.push(newReport);

    // Save the updated admin document
    await admin.save();

    res.status(201).json(admin);
  } catch (error) {
    return next(new HttpError("Adding report failed, please try again", 500));
  }
};

///////////////////////////////////////////////////////////////////////////////////
////---------------- GET ALL REPORTS ------------------------------------------
const getAllReports = async (req, res, next) => {
  try {
    const admin = await Admin.findOne().select("reports");

    if (!admin) {
      return next(new HttpError("Admin not found", 404));
    }

    res.status(200).json(admin.reports);
  } catch (error) {
    return next(
      new HttpError("Fetching reports failed, please try again later.", 500)
    );
  }
};

///////////////////////////////////////////////////////////////////
// ------------------- DELETER REPORT --------------------------------
const deleteReport = async (req, res, next) => {
  const { userId, postId, reportId } = req.body;

  try {
    // Remove postId from user's reports array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { reports: postId } },
      { new: true }
    );

    // Remove the corresponding report from the admin's reports array
    const admin = await Admin.findOneAndUpdate(
      { "reports._id": reportId },
      { $pull: { reports: { _id: reportId } } },
      { new: true }
    );

    res.status(200).json(admin.reports);
  } catch (error) {
    res.status(500).json({ message: "Error removing report", error });
  }
};
//////////////////////////////////////////////////////////////////
//---------------- User -------------------------------------
const getUser = async (req, res, next) => {
  try {
    const { id } = req.body;
    console.log(id);
    const user = await User.findById(id).select("-password");
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    let avatarURL;
    if (user.avatar) {
      avatarURL = await getObjectURL(user.avatar);
    }

    const userResponse = {
      ...user.toObject(),
    };

    if (avatarURL) {
      userResponse.avatarURL = avatarURL;
    }

    res.status(200).json(userResponse);
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
};
module.exports = {
  getAllUsers,
  CreateAdmin,
  addReports,
  getAllReports,
  deleteReport,
  getUser,
  addFeaturedPost,
};
