import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath, options = {}) => {
    try {
        if(!localFilePath) return null;
        //uplaod file of cloudianry
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            ...options,
        })
        //succefull uplaod
        fs.unlinkSync(localFilePath);
        //console.log("file has been uplaoded", response.url);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove locally saved file as upload oprn failed
        return null;
    }
}

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

export { uploadOnCloudinary, deleteFromCloudinary }