import { catchAsync } from "../middleware/error.middleware";
import { asyncHandler } from "../middleware/error.middleware";
import {User} from "../models/user.model.js";
import { ApiError } from "../middleware/error.middleware";
import { generateToken } from "../utils/generateToken.js";
import {uploadMedia,deleteMediaFromCloudinary} from "../utils/cloudinary.js";

export const createUserAccount = asyncHandler(async (req, res) => {

const {name,email,password , role='student'} = req.body;

// we will do the validations globally
const existingUser = await User.findOne({email: email.toLowerCase()});

if(existingUser){
throw new ApiError("User with this email already exists", 400);
}

const user =  await User.create({
name ,
email: email.toLowerCase(),
password,
role
});
await user.updateLastActive();
 generateToken(res, user, "Account created successfully");

});


export const authenticateUser = asyncHandler(async (req, res) => {
const {email, password} = req.body;

const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
if (!user) {
  throw new ApiError("Invalid email or password", 401);
};
const isPasswordValid = await user.comparePassword(password);
if (!isPasswordValid) {
  throw new ApiError("Invalid email or password", 401);
}

await user.updateLastActive();
generateToken(res, user, `Welcome back ${user.name} `);

});


export const signOutUser = asyncHandler(async (req, res) => {
res.cookie("token", "", {maxAge:0})
res.status(200).json({
    success: true,
    message: "Signed out successfully",
});
});


export const getCurrentUserProfile = asyncHandler(async (req, res) => {
const user = await User.findById(req.id)
.populate({
path : "enrolledCourses.course",
select: "title description category thumbnail",
})

if(!user){
throw new ApiError("User not found", 404);
}

res.status(200).json({
success:true,
data : {
...user.toJSON(),
totalEnrolledCourses: user.totalEnrolledCourses || user.enrolledCourses.length, // virtual field

}
})









});


export const updateUserProfile = asyncHandler(async (req, res) => {

const {name,email,bio}= req.body;

const updatedData = {
name,
email : email?.toLowerCase(),
bio
};

if(req.file){
const avatarResult = await uploadMedia(req.file.path);
updatedData.avatar = avatarResult.secure_url;
}

// delete old avatar from cloudinary
  const user = await User.findById(req.id);
  if (user.avatar && user.avatar !== 'default-avatar.png') {
    await deleteMediaFromCloudinary(user.avatar);
  }

// update user and get updated doc
const updatedUser = await User.findByIdAndUpdate(req.id, updatedData, {new:true,runValidators:true});

if(!updatedUser){
  throw new ApiError("User not found", 404);
}

res.status(200).json({
  success: true,
  message: "Profile updated successfully",
  data: updatedUser
});

});