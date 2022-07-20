const cloudinary = require('cloudinary');
const fs = require('fs');
const promisify = require('util').promisify
const { UploadCloudinaryError } = require('../errors');

class Upload {
  /* constructor() {

  } */

  async uploadToLocal(base64Str, path, filename) {
    // base64Str. 
    console.log('imhere uploadToLocal', path, filename)

    return new Promise((resolve, reject) => {
      if (base64Str == null) {
        return reject('first arguments base64 string required');
      }

      var base64Arr = base64Str.split(',');
      var fullExt = base64Arr[0].substring(base64Arr[0].lastIndexOf(":") + 1, base64Arr[0].lastIndexOf(";"));

      if (fullExt != 'image/jpeg' && fullExt != 'image/png') {
        return reject('Image extension must be jpg or png');
      }

      var ext = (fullExt == 'image/jpeg') ? 'jpg' : 'png';

      var filePath = config.file_dir + filename + '.' + ext;

      return fs.writeFile(filePath, new Buffer.from(base64Arr[1], "base64"), err => {
        if (err) {
          console.error('utils upload err', err)
          return reject(err);
        }

        var fileUrl = config.file_host + filename + '.' + ext;
        return resolve(filePath);
      });
    });
  }

  async uploadToCloud(localPathFile) {
    console.log('uploadToCloud', localPathFile)

    try {
      const resultUpload = await cloudinary.v2.uploader.upload(localPathFile);
      console.log('resultUpload', resultUpload)

      return `${resultUpload.public_id}.${resultUpload.format}`;

    } catch (err) {
      console.log(err);

      throw new UploadCloudinaryError(err.message, err.code)
    }
  }

  async processMultipleUpload(imagesBase64, path, filename) {
    console.log('upload processMultipleUpload', path, filename)
    try {
      let imgs = [];
      for (let imgBase64 of imagesBase64) {
        const imgLocalPath = await this.uploadToLocal(imgBase64, path, filename);


        const img = await this.uploadToCloud(imgLocalPath)
        imgs.push(img)
      }
      return imgs;

    } catch (err) {
      console.log('inerro proc', err);

      throw new UploadCloudinaryError(err.message, err.code)
    }
  }

}

module.exports = Upload;
