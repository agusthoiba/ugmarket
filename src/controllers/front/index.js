const router = express.Router();
const cloudinaryTransformation = require("../../helpers/cloudinaryTransformation");

router.get("/", async (req, res, next) => {
  var obj = { error: null, data: { products: [], bands: [], collections: [] } };
  var query = { prod_is_visible: 1, band_enabled: 1 };
  const sort = { prod_id: "DESC" };
  const doc = await res.locals.productModel.findRaw(query, sort);

  if (doc.length > 0) {
    obj.data.products = doc.map((val) => {
      val.is_visible = val.prod_is_visible === 1;

      if (val.prod_images) {
        const images = val.prod_images.split(",");
        val.thumbnail = req.app.locals.cloudinary.url(images[0], {
          width: 200,
          height: 200,
          crop: "thumb",
          ...cloudinaryTransformation.watermark,
        });
      }
      return val;
    });
  }

  const optionsFindBands = {
    sort: [["band_total_product", "DESC"]],
    limit: 12,
  };
  const queryBand = { band_enabled: 1 };
  const findBands = await res.locals.bandModel.find(
    queryBand,
    optionsFindBands,
  );

  if (findBands.length > 0) {
    obj.data.bands = findBands.map((band) => {
      band.band_logo = band.thumbnail;
      return band;
    });
  }

  obj.data.collections = (req.app.locals.collections || [])
    .filter((col) => col.col_is_visible == 1)
    .sort((a, b) => (a.col_sort || 0) - (b.col_sort || 0));

  const carouselSlides = [];
  obj.data.collections = obj.data.collections.map((col) => {
    if (col.col_thumbnail) {
      col.thumbnailUrl = req.app.locals.cloudinary.url(col.col_thumbnail, {
        width: 320,
        height: 320,
        crop: "thumb",
        ...cloudinaryTransformation.watermark,
      });
    } else {
      col.thumbnailUrl = "https://via.placeholder.com/320x320?text=No+Image";
    }
    if (col.col_banner_isdisplay_home == 1) {
      carouselSlides.push({
        desktop: col.col_banner_desktop,
        mobile: col.col_banner_mobile,
        alt: col.col_name,
        href: `/products?collection=${col.col_slug}`,
      });
    }
    return col;
  });

  obj.data.carousels = carouselSlides.map((slide) => ({
    href: slide.href,
    desktopUrl: req.app.locals.cloudinary.url(slide.desktop, {
      ...cloudinaryTransformation.watermarkCarousel,
    }),
    mobileUrl: req.app.locals.cloudinary.url(slide.mobile, {
      ...cloudinaryTransformation.watermarkCarousel,
    }),
    alt: slide.alt,
  }));

  if (req.query.json == "1") {
    return res.json(obj);
  }

  return res.render("front/index", obj);
});

module.exports = router;
