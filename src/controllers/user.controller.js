import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiReasponse.js";

const registerUser = asyncHandler( async (req,res)=>{
// // const register= await 
// res.status(200).json({
//     message: "Backend Code"
// })

const {fullName , email , username , password }=req.body
console.log("email:", email);

// if (fullName == "") {
//     throw new ApiError(400 , "Fullname is required.")
// }

if ([fullName , email , username , password].some((field)=>field ?.trim()=== "")
) {
    throw new ApiError( 400 , "All Fields Are Required.")
}


const existedUser=User.findOne({
    $or: [
        { email },
        { username }
    ]

})
if(existedUser){
    throw new ApiError(409 , "User With Username Or Email Already Exists.")
}

 const avatarLocalPath = req.files?.avatar?.[0]?.path;

 const coverImageLocalPath = req.files?.coverImage?.[0]?.path

if(!avatarLocalPath){
throw new ApiError(400 , "Avatar file is required.")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)

const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
throw new ApiError(400 , "Avatar file is required.")

}

const user = await User.create({
    fullName,
    email,
    username : username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",

})

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
 )

if (!createdUser){
    throw new ApiError(500 , "User Creation Failed.")
}

return registerUser.status(201).json(
    new ApiResponse(200 ,createdUser ,"User Created Successfully." )

)

})
// error, request, response, next


export {registerUser}

//STEPS:
//1.get user details from Frontend.
//2. validate the user details.
//3. check if user already exists in the database : username , email
//4.Check for images , check for avatar
//5.upload them to cloudinary , avatar check
//6.Create user object - create entry in Database
//7.Remove password and refresh token field form response
//8.Check for user creation
//9.return res