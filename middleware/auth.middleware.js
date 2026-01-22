import { asyncHandler } from "./error.middleware.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "./error.middleware.js";


export const isAuthenticated = asyncHandler(async (req, res, next) =>{
const token = req.cookies.token;
if(!token){
throw new ApiError("You are not logged in", 401);
}

try {
const decoded =  await jwt.verify(token, process.env.JWT_SECRET);
req.id = decoded.userId; 

 const user = await User.findById(req.id);

if (!user) {
throw new AppError("User not found", 404);
}
req.user = user;
next();
    
} catch (error) {
      if (error.name === "JsonWebTokenError") {
      throw new ApiError("Invalid token. Please log in again.", 401);
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError("Your token has expired. Please log in again.", 401);
    }
    throw error;
}


})