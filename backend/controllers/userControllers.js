const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Admin = require("../models/adminModel");
const nodemailer = require("nodemailer");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");
const mime = require("mime-types");
const redisClient = require("../redisClient");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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
//------------------------------------------------------------------------
//----------------- SEND OPT -----------------------------------------
const otpStorage = {};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.MAIL_PASS,
  },
});
//---------------------------------------------------------
//
const OTP_for_Register = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
      return next(new HttpError("Please Enter an Email"));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new HttpError("Invalid email address", 422));
    }

    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return next(new HttpError("Email already exists.", 422));
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStorage[email] = otp;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "OTP verification for WordWise",
      html: `<div style="background-color: #f0f0f0; padding: 20px; margin: auto ;">
        <h1 style="color: #333;">OTP from <strong>WordWise</strong></h1>
        <p style="font-size: 18px;">Your OTP code is <strong style="color: blue: ">${otp}</strong>.</p>
        <p style="font-size: 14px; color: #888;">This OTP is valid for a limited time.</p>
      </div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send(error.toString());
      }
      res.status(200).send("OTP sent");
    });
  } catch (error) {
    return next(new HttpError("Failed to send OTP", 500));
  }
};
//////////////////////////////////////////////////////////////////////
//----------------- OTP For Login ---------------------------------
const OTP_for_login = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
      return next(new HttpError("Please Enter an Email"));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new HttpError("Invalid email address", 422));
    }

    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      otpStorage[email] = otp;

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "OTP verification for WordWise Login",
        html: `<div style="background-color: #f0f0f0; padding: 20px; margin: auto ;">
        <h1 style="color: #333;">OTP from <strong>WordWise</strong> to login </h1>
        <p style="font-size: 18px;">Your OTP code is <strong style="color: blue: ">${otp}</strong>.</p>
        <p style="font-size: 14px; color: #888;">This OTP is valid for a limited time.</p>
      </div>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send(error.toString());
        }
        res.status(200).send("OTP sent");
      });
    }
  } catch (error) {
    return next(new HttpError("Failed to send OTP", 500));
  }
};

//--------------------------------------------------------------
//----------------------- REGISTER A NEW USER -------------------
// POST: api/users/register
// UNPROTECTED

const registerUser = async (req, res, next) => {
  console.log("register user is running");
  try {
    const { name, email, password, password2, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const newEmail = email.trim().toLowerCase();

    // Email validation regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return next(new HttpError("Invalid email address", 422));
    }

    const emailExists = await User.findOne({ email: newEmail });
    console.log("third");
    if (emailExists) {
      return next(new HttpError("Email already exists.", 422));
    }
    if (password.trim().length < 6) {
      return next(new HttpError("Password should be at least 6 characters."));
    }
    if (password !== password2) {
      return next(new HttpError("Passwords do not match.", 422));
    }

    const storedOTP = otpStorage[newEmail];
    if (!storedOTP || parseInt(otp) !== storedOTP) {
      return next(new HttpError("Invalid OTP.", 422));
    }

    // Clear the OTP from storage after successful registration
    delete otpStorage[newEmail];

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: newEmail,
      password: hashedPass,
    });

    res.status(201).json(`New user ${newUser.email} registered`);
  } catch (error) {
    return next(new HttpError("User registration failed.", 422));
  }
};

//-------------------------------------------------------------------
//--------------------------- LOGIN A REGISTER USER ------------------
// POST: api/users/login
// UNPROTECTED
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new HttpError("fill in all fields", 422));
    }

    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });

    if (!user) {
      return next(new HttpError("Invalid credentials", 422));
    }
    const comparePass = await bcrypt.compare(password, user.password);

    if (!comparePass) {
      return next(new HttpError("Invalid credentials", 422));
    }
    console.log("first");
    const { _id: id, name } = user;
    console.log("second");
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    console.log("third");
    res.status(200).json({ token, id, name });
  } catch (error) {
    return next(
      new HttpError("Login Failed , please check your credentials", 422)
    );
  }
};
/////////////////////////////////////////////////////////////////////////////
//------------------------ LOGIN USER WITH OTP --------------------------------
const loginUser_with_OTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new HttpError("fill in all fields", 422));
    }
    //
    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });

    if (!user) {
      return next(new HttpError("Invalid credentials", 422));
    }
    //
    const storedOTP = otpStorage[newEmail];
    if (!storedOTP || parseInt(otp) !== storedOTP) {
      return next(new HttpError("Invalid OTP.", 422));
    }

    const { _id: id, name } = user;

    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, id, name });
  } catch (error) {
    return next(
      new HttpError("Login Failed , please check your credentials", 422)
    );
  }
};
//-----------------------------------------------------------------
//----------------- LOGIN AS ADMIN ---------------------
// GET: api/users/login/admin
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new HttpError("fill in all fields", 422));
    }

    const newEmail = email.toLowerCase();

    if (newEmail !== process.env.ADMIN_EMAIL) {
      return next(new HttpError("Please enter correct email", 422));
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return next(new HttpError("Invalid Password", 422));
    }

    const user = await User.findOne({ email: newEmail });
    if (!user) {
      return next(new HttpError("Admin Not Found"));
    }

    const { _id: id, name } = user;
    console.log("second");
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    console.log("third");
    res.status(200).json({ token, id, name });
  } catch (error) {}
};
// //-------------------------------------------------------
// //---------------- USER PROFILE -------------------------
// // POST: api/users/:id
// // ROTECTED
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cachedUser = await redisClient.get(`user:${id}`);
    if (cachedUser) {
      console.log("User data found in cache");
      return res.status(200).json(JSON.parse(cachedUser));
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    let avatarURL;
    if (user.avatar) {
      try {
        avatarURL = await getObjectURL(user.avatar);
      } catch (error) {
        console.error("Error retrieving avatar URL:", error);
      }
    }

    const userResponse = {
      ...user.toObject(),
      avatarURL,
    };

    await redisClient.set(
      `user:${id}`,
      JSON.stringify(userResponse),
      "EX",
      3600
    );

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error fetching user:", error);
    return next(new HttpError(error));
  }
};

///////////////////////////////////////////////////////
///////// -------------- CHANGE USER AVATAR --------------------------

const sharp = require("sharp");

const changeAvatar = async (req, res, next) => {
  try {
    if (!req.files || !req.files.avatar) {
      return next(new HttpError("Please choose an image", 422));
    }

    const { avatar } = req.files;

    // Compress the image if it exceeds the size limit after compression

    let compressedImageBuffer;
    if (avatar.size > 1000000) {
      compressedImageBuffer = await sharp(avatar.data)
        .resize(1024, 1024, { fit: "inside" }) // Resize to fit within 1024x1024
        .jpeg({ quality: 70 }) // Compress to JPEG with 80% quality
        .toBuffer();
    } else {
      compressedImageBuffer = avatar.data;
    }

    // Find user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    // Delete old avatar if exists in S3
    if (user.avatar) {
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: user.avatar,
      };

      try {
        await s3Client.send(new DeleteObjectCommand(deleteParams));
      } catch (err) {
        console.error("Error deleting old avatar from S3:", err);
        throw new HttpError("Failed to delete old avatar from S3", 500);
      }
    }

    // Upload new avatar to AWS S3
    let fileName = avatar.name;
    let splittedFilename = fileName.split(".");
    let newFilename =
      splittedFilename[0] +
      uuid() +
      "." +
      splittedFilename[splittedFilename.length - 1];

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `avatar/${newFilename}`,
      Body: compressedImageBuffer,
      ContentType: mime.lookup(avatar.name) || "application/octet-stream",
      ACL: "private",
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
    } catch (err) {
      console.error("Error uploading avatar to S3:", err);
      throw new HttpError("Error uploading avatar to S3", 500);
    }

    // Store the new avatar key in the database
    const updatedAvatar = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: `avatar/${newFilename}` },
      { new: true }
    );

    if (!updatedAvatar) {
      return next(new HttpError("Avatar couldn't be changed", 422));
    }

    // Generate and return the signed URL for the uploaded avatar
    const avatarURL = await getObjectURL(`avatar/${newFilename}`);
    res.status(200).json({ avatarURL });
  } catch (error) {
    console.error("Error changing avatar:", error);
    return next(new HttpError(error.message, 500));
  }
};

//---------------- EDIT USER DETAILS (from profile) ------------
// POST: api/users/edit-user
// PROTECTED

const editUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, confirmNewPassword } =
      req.body;
    if (!name || !email || !currentPassword || !newPassword) {
      return next(new HttpError("Fill in all fields", 422));
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User not found", 403));
    }

    // Make sure new email doesn't already exist and is not the current user's email
    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists._id != req.user.id) {
      return next(new HttpError("Email already exists", 422));
    }

    // Compare current password to database password
    const validateUserPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!validateUserPassword) {
      return next(new HttpError("Invalid current password", 422));
    }

    // Compare new passwords
    if (newPassword !== confirmNewPassword) {
      return next(new HttpError("New passwords do not match", 422));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Update user info in database
    const newInfo = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, password: hash },
      { new: true }
    );
    res.status(200).json(newInfo);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//---------------- GET AUTHORS ------------
// POST: api/users/edit-user
// UNPROTECTED
const getAuthors = async (req, res, next) => {
  try {
    const authors = await User.find({ posts: { $gt: 0 } }).select("-password");
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
///////////////////////////////////////////////////////////////////////////////////////
//////////-------- ADD BOOKMARK ------------------------------------
const addBookmark = async (req, res, next) => {
  const { userId, postId } = req.body;
  console.log("in book");
  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not found", 404));
    }

    if (!user.bookmarks.includes(postId)) {
      user.bookmarks.push(postId);
      await user.save();
    }

    res.status(200).json({ message: "Post bookmarked" });
  } catch (error) {
    return next(new HttpError("Bookmarking failed, please try again", 500));
  }
};
//////////////////////////////////////////////////////////////////////////////
//-------------- REMOVE BOOKMARK ------------------------------
const removeBookmark = async (req, res, next) => {
  const { userId, postId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    user.bookmarks = user.bookmarks.filter(
      (bookmark) => bookmark.toString() !== postId
    );
    await user.save();

    res.status(200).json({ message: "Bookmark removed" });
  } catch (error) {
    return next(
      new HttpError("Removing bookmark failed, please try again", 500)
    );
  }
};

//////////////////////////////////////////////////////////////////////////////////
//------------------- ALL BOOKMARKED POSTS ------------------------------
const getBookmarkedPosts = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    const bookmarkedPosts = await Promise.all(
      user.bookmarks.map(async (postId) => {
        const post = await Post.findById(postId);
        if (!post) {
          return null;
        }

        const thumbnailURL = await getObjectURL(post.thumbnail, {
          expiresIn: 3600,
        });

        return {
          ...post.toObject(),
          thumbnailURL,
        };
      })
    );

    // Filter out any null values (if any posts were not found)
    const validBookmarkedPosts = bookmarkedPosts.filter(
      (post) => post !== null
    );

    res.status(200).json(validBookmarkedPosts);
  } catch (error) {
    return next(
      new HttpError("Fetching bookmarks failed, please try again", 500)
    );
  }
};
///////////////////////////////////////////////////////////////////////////////////////
//--------------------- ADD REPORT --------------------------------------------
const addReport = async (req, res, next) => {
  console.log("in addReport");
  const { postId, userId } = req.body;
  console.log(postId, userId);

  if (!postId || !userId) {
    return res
      .status(400)
      .json({ message: "Post ID and User ID are required" });
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const admin = await Admin.findOne().session(session);
    if (!admin) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Admin not found" });
    }
    console.log("Admin found:", admin);

    // line 463
    const newReport = {
      reportBy: new mongoose.Types.ObjectId(userId),
      post: new mongoose.Types.ObjectId(postId),
    };
    console.log("New Report:", newReport);

    admin.reports.push(newReport);
    console.log("Report added to admin");

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }
    user.reports.push(new mongoose.Types.ObjectId(postId));
    console.log("Report added to user");

    await admin.save({ session });
    console.log("Admin saved");

    await user.save({ session });
    console.log("User saved");

    await session.commitTransaction();
    session.endSession();
    console.log("Transaction committed");

    res
      .status(200)
      .json({ message: "Report added successfully", report: newReport });
  } catch (error) {
    console.error("Error adding report:", error);
    res.status(500).json({ message: "Failed to add report", error });
  }
};

///////////////////////////////////////////////////////////////////////
////----------- REMOVE REPORT ----------------------------------
const removeReport = async (req, res, next) => {
  const { postId, userId } = req.body;

  if (!postId || !userId) {
    return res
      .status(400)
      .json({ message: "Post ID and User ID are required" });
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const admin = await Admin.findOne().session(session);
    if (!admin) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Admin not found" });
    }

    const reportIndex = admin.reports.findIndex(
      (report) =>
        report.post.toString() === postId &&
        report.reportBy.toString() === userId
    );

    if (reportIndex === -1) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Report not found" });
    }

    admin.reports.splice(reportIndex, 1);

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }
    user.reports = user.reports.filter(
      (report) => report.toString() !== postId
    );

    await admin.save({ session });
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Report removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove report", error });
  }
};

//////////////////////////////////////////////////////////////////////
//------------------------ ADD LIKE -----------------------------------

const add_like = async (req, res, next) => {
  console.log("in like");
  const { userId, postId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not found", 404));
    }

    if (!user.likes.includes(postId)) {
      user.likes.push(postId);
      await user.save();
      // incres the post count here
      post.total_likes += 1;
      await post.save();
    }

    res.status(200).json({ message: "Post liked" });
  } catch (error) {
    return next(new HttpError("Liking failed, please try again", 500));
  }
};

/////////////////////////////////////////////////////////////////////////////
//-------------------------- REMOVE LIKES -----------------------------------

const remove_like = async (req, res, next) => {
  const { userId, postId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not found", 404));
    }

    if (!user.likes.includes(postId)) {
      return next(new HttpError("Post not liked by user", 404));
    }
    user.likes = user.likes.filter((likes) => likes.toString() !== postId);
    await user.save();
    //
    if (post.total_likes > 0) {
      post.total_likes -= 1;
      await post.save();
    }

    res.status(200).json({ message: "Like removed" });
  } catch (error) {
    return next(
      new HttpError("Removing bookmark failed, please try again", 500)
    );
  }
};

////////////////////////////////////////////////////////////////////////////
//--------------------- FOLLOW ----------------------------------
const follow = async (req, res, next) => {
  const { user1, user2 } = req.body;

  try {
    // Find user1 and user2
    const userToFollow = await User.findById(user2);
    const currentUser = await User.findById(user1);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add user2 to the following list of user1
    if (!currentUser.following.includes(user2)) {
      currentUser.following.push(user2);
    }

    // Add user1 to the followers list of user2
    if (!userToFollow.followers.includes(user1)) {
      userToFollow.followers.push(user1);
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};

//////////////////////////////////////////////////////////////////////////
//-------------------- UNFOLLOW -------------------------------------
const unfollow = async (req, res, next) => {
  const { user1, user2 } = req.body;

  try {
    // Find user1 and user2
    const userToUnfollow = await User.findById(user2);
    const currentUser = await User.findById(user1);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove user2 from the following list of user1
    currentUser.following = currentUser.following.filter(
      (userId) => userId.toString() !== user2
    );

    // Remove user1 from the followers list of user2
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (userId) => userId.toString() !== user1
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};
///////////////////////////////////////////////////////////////////////////
//-------------- GET USER FOLLOWERS_FOLLOWING ------------------------
const get_followers_following = async (req, res, next) => {
  const userId = req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId)
      .populate("followers")
      .populate("following")
      .exec(); // Ensure query execution

    if (!user) {
      return next(new Error("User not found", 404));
    }

    const followersData = await Promise.all(
      user.followers.map(async (follower) => ({
        _id: follower._id,
        name: follower.name,
        email: follower.email,
        avatar: follower.avatar ? await getObjectURL(follower.avatar) : null,
      }))
    );

    const followingData = await Promise.all(
      user.following.map(async (following) => ({
        _id: following._id,
        name: following.name,
        email: following.email,
        avatar: following.avatar ? await getObjectURL(following.avatar) : null,
      }))
    );

    res.status(200).json({
      followers: followersData,
      following: followingData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginUser_with_OTP,
  getUser,
  changeAvatar,
  editUser,
  getAuthors,
  getBookmarkedPosts,
  loginAdmin,
  removeBookmark,
  addBookmark,
  addReport,
  removeReport,
  OTP_for_Register,
  OTP_for_login,
  add_like,
  remove_like,
  follow,
  unfollow,
  get_followers_following,
};
