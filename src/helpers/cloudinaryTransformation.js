 
 const cloudinaryTransformation = {
    watermark: {
         transformation: [
            {
              overlay: 'v1777553810:logo1_sv25li.png',
              gravity: 'south_east',
              opacity: 30,
              width: 0.3,
              flags: ['relative'],
            },
            { flags: 'layer_apply' },
         ]
    },
    watermarkCarousel: {
         transformation: [
            {
              overlay: 'v1777553810:logo1_sv25li.png',
              gravity: 'south_east',
              opacity: 20,
              width: 0.3,
              flags: ['relative'],
            },
            { flags: 'layer_apply' },
         ]
    }
}


module.exports = cloudinaryTransformation;
