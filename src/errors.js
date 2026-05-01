

class UgmarketError extends Error {
    constructor(message = 'Undergroundsync error occurred', code = 'UG_ERROR', statusCode = 500, data = null) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.data = data;
    }
}


class UploadCloudinaryError extends UgmarketError {
    constructor(message = 'Upload cloudinary error occurred', code = 'UG_CLOUDINARY_ERROR', statusCode = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
    }
}

module.exports = {
    UploadCloudinaryError
}
