import {asyncHandler} from "../utils/asyncHandler.js"

const registerUser = asyncHandler( async (req,res)=>{
// const register= await 
res.status(200).json({
    message: "Backend Code"
})
})
// error, request, response, next


export {registerUser}