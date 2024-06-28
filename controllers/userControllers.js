require("dotenv").config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");

const sendResetPasswordEmail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const myOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password Request",
      html: `
        <p>Hi, ${name} <br>
        Please click the below link to reset your password <br>
        <a href="${process.env.HOST_WEBSITE}${token}">Reset Password Link</a>
        </p>

      `,
    };
    transporter.sendMail(myOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Mail has been sent ", info.response);
      }
    });
  } catch (error) {
    return error.message;
  }
};

//create user
const createUser = async (req, res) => {
  const { username, name, email, password } = req.body;
  if (!username || !name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      // Return error if username or email already exists
      return res
        .status(400)
        .send({ message: "Username or email already exists." });
    }

    // Create the user
    const result = await User.create({
      username,
      name,
      email,
      password: bcrypt.hashSync(password, 8),
    });

    // Send success message if user created successfully
    if (result)
      res.status(201).send({ message: "User registered successfully!" });
  } catch (error) {
    // Handle any errors
    res.status(500).send({ message: error.message });
  }
};

// login user
const signin = async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    });

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Invalid Email or Password!",
      });
    }

    const token = jwt.sign(
      { username: user.username, _id: user._id },
      process.env.SECRET_KEY,
      {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: "20d",
      }
    );

    return res.status(200).send({
      _id: user.id,
      username: user.username,
      email: user.email,
      token: token,
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

// Password Change Controller
const changePassword = async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;

  // Validate the userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: "Invalid user ID format." });
  }

  // Find the user based on user id
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).send({ message: "User not found." });
  }

  try {
    // Compare old password hash
    const passwordIsValid = bcrypt.compareSync(oldPassword, user.password);

    if (!passwordIsValid) {
      return res.status(400).send({ message: "Invalid password." });
    }

    // Hash the new password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 8);

    // Update user's password with the new hash
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    return res.status(200).send({ message: "Password changed successfully!" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

// Get all users
const getAllUsers = (req, res) => {
  User.find()
    .select("-password")
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({ error: "Error fetching users" });
    });
};

// Get a user by username
const getUserByUsername = (req, res) => {
  const { username } = req.params;

  User.findOne({ username })
    .select("-password")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    })
    .catch((error) => {
      res.status(500).json({ error: "Error finding user" });
    });
};

//forgot password
const forgot_password = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      const randomString = randomstring.generate();
      const data = await User.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPasswordEmail(user.name, email, randomString);
      return res
        .status(200)
        .json({ message: "Please check your inbox for mail" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//reset password
const reset_password = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const tokenData = await User.findOne({ token: tokenId });
    if (tokenData) {
      const password = req.body.password;
      const newPassword = bcrypt.hashSync(password, 8);
      const userData = await User.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: "" } },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Password has been reseted", data: userData });
    } else {
      return res
        .status(400)
        .json({ message: "Password reset link has been expired" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//Get a user by id
const getUserById = (req, res) => {
  const userId = req.params.userId;

  User.findOne({ _id: userId })
    .select("-password")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User was not found" });
      }
      res.json(user);
    })
    .catch((error) => {
      res.status(404).json({ error: "User was not found" });
    });
};

module.exports = {
  createUser,
  signin,
  changePassword,
  getAllUsers,
  getUserByUsername,
  forgot_password,
  reset_password,
  getUserById,
};
