

const up = async (cloudinary, file, options = {}) => {
    try {
        const upCloud = await cloudinary.uploader.upload(file, options);
        console.log('[UPLOAD_CLOUDINARY][INFO] ', upCloud);
        return upCloud.secure_url;
        
    } catch (err) {
        console.log('[UPLOAD_CLOUDINARY][ERROR] ', err)
    }
}

module.exports = up;
