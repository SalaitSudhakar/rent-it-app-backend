import cloudinary from "../config/cloudinaryConfig.js";
import { Readable } from "stream";

const uploadToCloud = async (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {folder},
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );

        // convert buffer -> readable stream -> pipe to cloudinary
        Readable.from(fileBuffer).pipe(stream)
    });
};

export default uploadToCloud;