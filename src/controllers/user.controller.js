import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiReasponse.js";
import { ApiError } from "../utils/apiError.js";

const generateAccessAndRefreshTokens = async (userId)=>{
    try {
      const user =   await User.findById(userId)
      const accessToken=user.generateAccessToken()
      const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken

      await user.save({validateBeforeSave : false})

      return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token.")
    }
}


const registerUser = asyncHandler( async (req,res)=>{
// // const register= await 
// res.status(200).json({
//     message: "Backend Code"
// })

const {fullName , email , username , password }=req.body
// console.log("email:", email);

// if (fullName == "") {
//     throw new ApiError(400 , "Fullname is required.")
// }

if ([fullName , email , username , password].some((field)=>field ?.trim()=== "")
) {
    throw new ApiError( 400 , "All Fields Are Required.")
}


const existedUser=await User.findOne({
    $or: [
        { email },
        { username }
    ]

})
if(existedUser){
    throw new ApiError(409 , "User With Username Or Email Already Exists.")
}

console.log(req.files);

 const avatarLocalPath = req.files?.avatar?.[0]?.path;

//  const coverImageLocalPath = req.files?.coverImage?.[0]?.path

let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
}

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

return res.status(201).json(
    new ApiResponse(200 ,createdUser ,"User Created Successfully." )

)

})
// error, request, response, next


const loginUser = asyncHandler(async (req,res)=>{
     //req body -> data
    //username or email
    //find the user
    //check password
    //access and refresh token
    //send cookies

const {email , username , password }=req.body
    if (!username || !email) {
        throw new ApiError(400 , "username or password is required.")
    }

        const user   = await  User.findOne({
            $or: [
                { email},
                { username}
            ]
        })

            if(!user){
                throw new ApiError(404 , "User Not Found.")
            
            }
        
     const isPasswordValid =    await user.isPasswordCorrect(password)
                if (!isPasswordValid) {
                    throw new ApiError(401 , "Invalid user credentials");
}

const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await  User.findById(user._id).
    select("-password -refreshToken")

    // res.status(200).cookie("refreshToken" , refreshToken , {
    //     httpOnly : true,
    //     secure : true,
    //     path : "/api/v1/auth/refreshToken"
    // })

const options  = {
    httpOnly : true,
    secure : true,
    path : "/api/v1/auth/refreshToken"
}

return res
.status(200)
.cookie("accessToken" , accessToken , options)
.cookie("refreshToken" , refreshToken , options)
.json(
    new ApiResponse(200 , {
        user :loggedInUser,
        accessToken,
        refreshToken

    } ,
     "User Logged In Successfully.")

)

})

const logoutUser = asyncHandler(async (req,res) =>{
User.findByIdAndUpdate(
 req.user._id,
 {
    $set:{
        refreshToken : ""
    }
 },
 {
    new : true
}
    
)
const options  = {
    httpOnly : true,
    secure : true,
    path : "/api/v1/auth/refreshToken"
}

return res.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200,{},"User Logged Out."))
})


export {
    registerUser,
    loginUser,
    logoutUser
}

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

//In summary, access tokens enable short-term access to resources, while refresh tokens provide a mechanism for obtaining new access tokens without re-authentication.


//middleware : jaane se pehle milke jaiyega