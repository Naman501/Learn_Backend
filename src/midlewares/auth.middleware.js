import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model";

export const verifyJWT = asyncHandler(async(req ,res , next)=>{
  try {
     const token= req.cookies?.accessToken || req.header("authorization")?.replace("Bearer", "")
  
     if (!token) {
      throw new ApiError(401, 'Unauthorized request')
  }
  
  const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SCRET)
  
  const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
  
  if(!user){
      //TODO : discuss about frontend
      throw new ApiError(401, 'Invalid Access Token')
  }
  
  req.user = user;
  next()
  
  } catch (error) {
   throw new ApiError(401 , error?.message || "Invalid access token.")
  }

})
