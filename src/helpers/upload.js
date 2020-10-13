var fs = require('fs');
var config = require('../config');
var sharp = require('sharp');
const promisify = require('util').promisify
const copyFile = promisify(fs.copyFile)

module.exports = new Upload();

function Upload(){

}

Upload.prototype.createImageBase64 = function(base64Str, fileName) {
    return new Promise((resolve, reject) => {
        if (base64Str == null) {
            return reject('first arguments base64 string required');
        }

        var base64Arr = base64Str.split(',');
        var fullExt = base64Arr[0].substring(base64Arr[0].lastIndexOf(":")+1, base64Arr[0].lastIndexOf(";"));

        if (fullExt != 'image/jpeg' && fullExt != 'image/png') {
            return reject('Image extension must be jpg or png');
        }

        var ext = (fullExt ==  'image/jpeg') ?  'jpg' : 'png';

        var filePath = config.file_dir + fileName + '.' + ext;

        return fs.writeFile(filePath, new Buffer.from(base64Arr[1], "base64"), err => {
            if (err) {
                return reject(err);
            }

            var fileUrl = config.file_host + fileName + '.' + ext;
            return resolve({path: filePath, url: fileUrl, name: fileName, ext: ext});
        });
    });
}

Upload.prototype.resize = function(src, dest, maxWidth, maxHeight){
    var imgArr = src.split('.');
    var ext = imgArr[imgArr.length - 1];

    return new Promise((resolve, reject) => {
        sharp(src).resize(maxWidth)
        .toFile(dest, (err, info) => {
            if(err) return reject(err)

            console.log('info upload large', JSON.stringify(info));
            resolve(src)
        });
    });
}


Upload.prototype.uploadImageBase = async function (path, val, fileName) {
    let imgUrls = []
    const filePathName = path + fileName;
    let img
  
    try {
      img = await this.createImageBase64(val, filePathName)
    } catch (err) {
      return new Promise((resolve, reject) => {
        return reject(err)
      })
    }
  
    return fileName + '.' + img.ext
  }
  
Upload.prototype.processMultipleUpload = async function (path, images, filename) {
    let imgs = []
    try {
      for (let image of images) {
        const img = await this.uploadImageBase(path, image, filename)
        imgs.push(img)
      }
      return new Promise((resolve, reject) => {
        return resolve(imgs)
      })
    } catch (err) {
      return new Promise((resolve, reject) => {
        return reject(err)
      })
    }
  }



  Upload.prototype.copyResize = async function (src, name, master) {
    try {
      const destLarge = config.file_dir + master + '/large/' + name
      await copyFile(src, destLarge, { replace: false })
      const imgLarge = await this.resize(src, destLarge, 500, 1000)
  
      // const destMedium = config.file_dir + 'product/medium/'+ name
      // await copyFile(src, destMedium, {replace: false})
  
      // const imgMedium = await upload.resize(destMedium, 300, 600)
      return { l: imgLarge }
      //m: imgMedium
    } catch (err) {
      return new Promise((resolve, reject) => {
        return reject(err)
      })
    }
  
  }
