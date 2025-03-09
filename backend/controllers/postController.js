const Post = require("../models/postModel");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
// const { post } = require("../routes/postRoutes");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");
const mime = require("mime-types");
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

////////////////////----------- CREATE A POST ------------------------
// POST : api/posts
// PROTECTED

const createPost = async (req, res, next) => {
  try {
    let { title, shortDescription, category, description } = req.body;
    if (!title || !category || !description || !req.files) {
      return next(
        new HttpError("Fill in all fields and choose thumbnail", 422)
      );
    }

    const { thumbnail } = req.files;

    let compressedImageBuffer;
    try {
      compressedImageBuffer = await sharp(thumbnail.data)
        .resize({ width: 800 }) // Adjust the size as needed
        .jpeg({ quality: 50 }) // Start with a lower quality to ensure file size reduction
        .toBuffer();

      // If the compressed image is still larger than 2MB, adjust quality iteratively
      let quality = 50;
      while (compressedImageBuffer.length > 2000000 && quality > 10) {
        quality -= 10;
        compressedImageBuffer = await sharp(thumbnail.data)
          .resize({ width: 800 }) // Adjust the size as needed
          .jpeg({ quality }) // Reduce quality
          .toBuffer();
      }
    } catch (err) {
      console.error("Error compressing image:", err);
      return next(new HttpError("Error compressing image", 500));
    }

    // Check final file size
    if (compressedImageBuffer.length > 2000000) {
      return next(
        new HttpError(
          "Thumbnail too big after compression. Should be less than 2MB",
          422
        )
      );
    }

    const fileName = thumbnail.name;
    const newFilename =
      fileName.split(".")[0] + uuid() + "." + fileName.split(".").pop();

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `thumbnail/${newFilename}`,
      Body: compressedImageBuffer,
      ContentType: mime.lookup(thumbnail.name) || "application/octet-stream",
      ACL: "private",
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
    } catch (err) {
      console.error("Error uploading thumbnail to S3:", err);
      throw new HttpError("Error uploading thumbnail to S3", 500);
    }

    const newPost = await Post.create({
      title,
      shortDescription,
      category,
      description,
      thumbnail: `thumbnail/${newFilename}`,
      creator: req.user.id,
    });

    if (!newPost) {
      return next(new HttpError("Post couldn't be created", 422));
    }

    const currentUser = await User.findById(req.user.id);
    const userPostCount = currentUser.posts + 1;
    await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return next(new HttpError(error.message, 500));
  }
};

//-------------------- GET ALL POST------------------------------
// GET : api/posts
// PROTECTED

const getPosts = async (req, res, next) => {
  console.log("in all posts");
  try {
    console.log("in tyr ");
    const posts = await Post.find().sort({ updatedAt: -1 });
    const postsWithUrls = await Promise.all(
      posts.map(async (post) => {
        if (post.thumbnail) {
          const thumbnailURL = await getObjectURL(post.thumbnail);
          return {
            ...post.toObject(),
            thumbnailURL,
          };
        }
        return post.toObject();
      })
    );
    // console.log(postsWithUrls);
    res.status(200).json(postsWithUrls);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//-------------------- GET SINGLE POST ---------------------
// GET : api/posts/:id
// UNPROTECTED

const getSinglePost = async (req, res, next) => {
  console.log("int getsingle post");
  try {
    console.log("in try");
    const postId = req.params.id;
    const cachedPost = await redisClient.get(`post:${postId}`);
    if (cachedPost) {
      console.log("Post data found in cache");
      return res.status(200).json(JSON.parse(cachedPost));
    }
    console.log("first");
    const post = await Post.findById(postId);
    let thumbnailURL = null;
    if (post.thumbnail) {
      thumbnailURL = await getObjectURL(post.thumbnail);
    }

    const postResponse = { ...post.toObject(), thumbnailURL };

    await redisClient.set(
      `post:${postId}`,
      JSON.stringify(postResponse),
      "EX",
      7200
    );
    //
    res.status(200).json(postResponse);
  } catch (error) {
    return next(new HttpError(error));
  }
};

///////////--------------- GET POST BY CATEGORY -----------------------
// GET : api/posts/categories/:category
// UNPROTECTED

const getCatPosts = async (req, res, next) => {
  try {
    const { category } = req.params;
    //
    const cached_Category = await redisClient.get(`category:${category}`);
    if (cached_Category) {
      console.log("category data found in cache");
      return res.status(200).json(JSON.parse(cached_Category));
    }
    //
    const catPOsts = await Post.find({ category }).sort({ updatedAt: -1 });
    const postsWithUrls = await Promise.all(
      catPOsts.map(async (post) => {
        if (post.thumbnail) {
          const thumbnailURL = await getObjectURL(post.thumbnail);
          return {
            ...post.toObject(),
            thumbnailURL,
          };
        }
        return post.toObject();
      })
    );
    //
    await redisClient.set(
      `category:${category}`,
      JSON.stringify(postsWithUrls),
      "EX",
      3600
    );
    //
    res.status(200).json(postsWithUrls);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//-------------------- GET USER/AUTHOR POST
// GET : api/posts/users/:id
// UNPROTECTED

const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ creator: id }).sort({ updatedAt: -1 });
    const postsWithUrls = await Promise.all(
      posts.map(async (post) => {
        if (post.thumbnail) {
          const thumbnailURL = await getObjectURL(post.thumbnail);
          return {
            ...post.toObject(),
            thumbnailURL,
          };
        }
        return post.toObject();
      })
    );

    res.status(200).json(postsWithUrls);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//-------------------- EDIT POST -----------------------------------
// PATCH : api/posts/:id
// PROTECTED
////
const removeCachedPost = async (postId) => {
  try {
    await redisClient.del(`post:${postId}`);
    console.log(`Cache for post:${postId} removed successfully`);
  } catch (error) {
    console.error(`Error removing cache for post:${postId}:`, error);
  }
};
//////
const editPost = async (req, res, next) => {
  try {
    let updatedPost;
    const postId = req.params.id;
    let { title, shortDescription, category, description } = req.body;

    if (!title || !category || !shortDescription || description.length < 12) {
      return next(new HttpError("Fill in all fields", 422));
    }

    if (!req.files || !req.files.thumbnail) {
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { title, shortDescription, category, description },
        { new: true }
      );
    } else {
      // Get old post from database
      const oldPost = await Post.findById(postId);
      if (!oldPost) {
        return next(new HttpError("Post not found", 404));
      }

      // Delete old thumbnail from AWS S3
      if (oldPost.thumbnail) {
        const deleteParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: oldPost.thumbnail,
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
      }

      // Compress new thumbnail
      const { thumbnail } = req.files;
      let compressedImageBuffer;

      try {
        compressedImageBuffer = await sharp(thumbnail.data)
          .resize({ width: 800 }) // Adjust the size as needed
          .jpeg({ quality: 50 }) // Start with a lower quality to ensure file size reduction
          .toBuffer();

        // If the compressed image is still larger than 2MB, adjust quality iteratively
        while (compressedImageBuffer.length > 2000000 && quality > 10) {
          quality -= 10;
          compressedImageBuffer = await sharp(thumbnail.data)
            .resize({ width: 800 }) // Adjust the size as needed
            .jpeg({ quality }) // Reduce quality
            .toBuffer();
        }
      } catch (err) {
        console.error("Error compressing image:", err);
        return next(new HttpError("Error compressing image", 500));
      }

      // Check final file size
      if (compressedImageBuffer.length > 2000000) {
        return next(
          new HttpError(
            "Thumbnail too big after compression. Should be less than 2MB",
            422
          )
        );
      }

      // Upload new thumbnail
      const fileName = thumbnail.name;
      const newFilename = `${fileName.split(".")[0]}-${uuid()}.${fileName
        .split(".")
        .pop()}`;

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `thumbnail/${newFilename}`,
        Body: compressedImageBuffer,
        ContentType: mime.lookup(thumbnail.name) || "application/octet-stream",
        ACL: "private",
      };

      try {
        await s3Client.send(new PutObjectCommand(uploadParams));
      } catch (err) {
        console.error("Error uploading thumbnail to S3:", err);
        throw new HttpError("Error uploading thumbnail to S3", 500);
      }

      // Update post with new thumbnail
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          title,
          shortDescription,
          category,
          description,
          thumbnail: `thumbnail/${newFilename}`,
        },
        { new: true }
      );
    }

    if (!updatedPost) {
      return next(new HttpError("Couldn't update post", 400));
    }
    //
    await removeCachedPost(postId);
    //
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error editing post:", error);
    return next(new HttpError(error.message, 500));
  }
};

//----------------------------- DELETE POST --------------------------------------
// DELETE : api/posts/:id
// PROTECTED

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      return next(new HttpError("Post unavailable", 400));
    }

    const post = await Post.findById(postId);
    const fileName = post?.thumbnail;

    if (req.user.id == post.creator || req.user.id === process.env.ADMIN_ID) {
      // Delete thumbnail from AWS S3
      if (fileName) {
        const deleteParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileName,
        };

        try {
          await s3Client.send(new DeleteObjectCommand(deleteParams));
        } catch (err) {
          return next(new HttpError("Failed to delete thumbnail from S3", 500));
        }
      }

      // Delete post from database
      await Post.findByIdAndDelete(postId);

      // Find user and reduce post count by 1
      if (req.user.id === post.creator) {
        const currentUser = await User.findById(req.user.id);
        let userPostCount = currentUser?.posts - 1;
        if (userPostCount < 0) userPostCount = 0;
        await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
      }

      if (req.user.id === process.env.ADMIN_ID) {
        const currentUser = await User.findById(post.creator);
        let userPostCount = currentUser?.posts - 1;
        if (userPostCount < 0) userPostCount = 0;
        await User.findByIdAndUpdate(post.creator, { posts: userPostCount });
      }
      //
      await removeCachedPost(postId);
      //
      res.json(`Post ${postId} deleted successfully`);
    } else {
      return next(new HttpError("Post couldn't be deleted", 403));
    }
  } catch (error) {
    return next(new HttpError(error));
  }
};
/////////////////////////////////////////////////////
//---------- Get Featured post ---------------------
const getFeaturedPost = async (req, res, next) => {
  try {
    const admin = await Admin.findOne();
    const post = await Post.findById(admin.featured);
    const cached_Featured = await redisClient.get("post:featured");
    if (cached_Featured) {
      console.log("Featured data found in cache");
      return res.status(200).json(JSON.parse(cached_Featured));
    }
    //
    let thumbnailURL = null;
    if (post.thumbnail) {
      thumbnailURL = await getObjectURL(post.thumbnail);
    }

    const featuredResponse = { ...post.toObject(), thumbnailURL };
    //
    await redisClient.set(
      "post:featured",
      JSON.stringify(featuredResponse),
      "EX",
      3600
    );
    //
    res.status(200).json(featuredResponse);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getSinglePost,
  getCatPosts,
  getUserPosts,
  editPost,
  deletePost,
  getFeaturedPost,
};
