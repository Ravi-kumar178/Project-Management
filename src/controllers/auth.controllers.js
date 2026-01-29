import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { sendMail, emailVerificationMailgenContent } from "../utils/mail.js";
import { asyncHandler } from "../utils/async-handler.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating token", []);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //check whether the user exist or not
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with same email or username exist", []);
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  //generate random temporary token for email verification
  const { unHashedTokens, hashedTokens, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedTokens;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendMail({
    email: user.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedTokens}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationExpiry -emailVerificationToken -forgotPasswordExpiry -forgotPasswordToken",
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User created successfully and verification email is sent",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!email) {
    throw new ApiError(404, "Email is required", []);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = user.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { refreshToken, accessToken } = generateAccessAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationExpiry -emailVerificationToken -forgotPasswordExpiry -forgotPasswordToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "User Logged In successfully",
      ),
    );
});

export { registerUser, loginUser };
