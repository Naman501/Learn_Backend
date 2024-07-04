import { v2 as cloudinary } from "cloudinary";
import fs from "fs";




    // Configuration
    // cloudinary.config({ 
    //     // cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    //     // api_key: process.env.CLOUDINARY_API_KEY, 
    //     // api_secret: process.env.CLOUDINARY_API_SECRET 
    //     cloud_name: dwngqrtor, 
    //     api_key: 919793442238957, 
    //     api_secret: A3IbIAzH4eKLbWSBLU7DsQO23bY
        


    // });
    
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });


// Upload file to cloudinary
const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if (!localFilePath) {
            console.log("Error bhai");
            return null;
} else {
    const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type : "auto"
     })
    //  console.log("File has been uploaded successfully on Cloudinary." ,response.url);
    // console.log(response);
    fs.unlinkSync(localFilePath)
     return response;
}
    } catch (error) {
        fs.unlinkSync(localFilePath) // Remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


export {uploadOnCloudinary}