import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { env } from '../config/env';

cloudinary.config({
    cloud_name: env.CLOUD_NAME,
    api_key: env.API_KEY,
    api_secret: env.API_SECRET,
});

console.log('Cloudinary configured with cloud_name:', env.CLOUD_NAME);

export const uploadOperation = async (localFilePath: string): Promise<any> => {
    try {
        if (!localFilePath) {
            console.error('uploadOperation: No file path provided');
            return null;
        }

        console.log('uploadOperation: Starting upload for file:', localFilePath);

        // Check if file exists
        if (!fs.existsSync(localFilePath)) {
            console.error('uploadOperation: File does not exist at path:', localFilePath);
            return null;
        }

        console.log('uploadOperation: File exists, uploading to Cloudinary...');

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });

        console.log('✅ File uploaded to Cloudinary successfully!');
        console.log('   URL:', response.url);
        console.log('   Public ID:', response.public_id);

        // Remove the locally saved temporary file
        fs.unlinkSync(localFilePath);
        console.log('   Local temp file deleted:', localFilePath);

        return response;
    } catch (error) {
        console.error('❌ uploadOperation failed:');
        console.error('   File path:', localFilePath);
        console.error('   Error:', error);

        // Remove the locally saved temporary file as the upload operation failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log('   Cleaned up temp file after error');
        }

        return null;
    }
};

export const deleteOperation = async (cloudinaryUrl: string): Promise<boolean> => {
    try {
        if (!cloudinaryUrl) return false;

        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{format}
        const urlParts = cloudinaryUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');

        if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
            console.error('Invalid Cloudinary URL format:', cloudinaryUrl);
            return false;
        }

        // Get everything after 'upload/' and before the file extension
        const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
        // Remove version number if present (starts with 'v' followed by digits)
        const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
        // Remove file extension to get public_id
        const publicId = pathWithoutVersion.replace(/\.[^.]+$/, '');

        console.log('Deleting from Cloudinary with public_id:', publicId);

        const response = await cloudinary.uploader.destroy(publicId);

        if (response.result === 'ok') {
            console.log('Successfully deleted from Cloudinary:', publicId);
            return true;
        } else {
            console.log('Cloudinary deletion response:', response);
            return false;
        }
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return false;
    }
};
