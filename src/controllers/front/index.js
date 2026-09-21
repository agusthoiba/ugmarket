const router = express.Router();
const cloudinaryTransformation = require("../../helpers/cloudinaryTransformation");

router.get("/", async (req, res, next) => {
  var obj = {
    error: null,
    data: {
      products: [],
      bands: [],
      collections: [],
      pageTitle: "Beranda - Undergroundsync Merchandise",
      pageDescription: "Temukan berbagai macam merchandise musik, kaos, hoodie, vinyl, dan aksesoris dari band favorit kamu hanya di Undergroundsync.",
      pageKeywords: "Undergroundsync, merchandise, musik, kaos, hoodie, vinyl, band, aksesoris",
    },
  };
  var query = { prod_is_visible: 1, band_enabled: 1 };

  // Check if user is logged in
  const isLoggedIn = !!(req.session && req.session.user);
  obj.data.isLoggedIn = isLoggedIn;
  const sort = { prod_id: "DESC" };
  const optionsFindBands = {
    sort: [["band_total_product", "DESC"]],
    limit: 12,
  };
  const queryBand = { band_enabled: 1 };

  // The two queries do not depend on each other, so they run together to save
  // a database round trip. The product query is limited to what the page shows.
  const [doc, findBands] = await Promise.all([
    res.locals.productModel.findRaw(query, sort, 0, 20),
    res.locals.bandModel.find(queryBand, optionsFindBands),
  ]);

  if (doc.length > 0) {
    obj.data.products = doc.map((val) => {
      val.is_visible = val.prod_is_visible === 1;

      if (val.prod_images) {
        const images = val.prod_images.split(",");
        val.thumbnail = req.app.locals.cloudinary.url(images[0], {
          width: 200,
          height: 200,
          crop: "thumb",
          fetch_format: "auto",
          quality: "auto",
          ...cloudinaryTransformation.watermark,
        });
      }
      return val;
    });
  }

  if (findBands.length > 0) {
    obj.data.bands = findBands.map((band) => {
      band.band_logo = band.thumbnail;
      return band;
    });
  }

  const allCollections = (req.app.locals.collections || [])
    .sort((a, b) => (a.col_sort || 0) - (b.col_sort || 0));

  const carouselSlides = [];
  obj.data.collections = allCollections
    .filter((col) => col.col_is_visible == 1)
    .map((col) => {
      col.href = `/products?collection=${col.col_slug}`;
      if (col.col_thumbnail) {
        col.thumbnailUrl = req.app.locals.cloudinary.url(col.col_thumbnail, {
          width: 320,
          height: 320,
          crop: "thumb",
          fetch_format: "auto",
          quality: "auto",
          ...cloudinaryTransformation.watermark,
        });
      } else {
        col.thumbnailUrl = "https://via.placeholder.com/320x320?text=No+Image";
      }
      return col;
    });

  allCollections.forEach((col) => {
    if (col.col_banner_isdisplay_home == 1) {
      carouselSlides.push({
        desktop: col.col_banner_desktop,
        mobile: col.col_banner_mobile,
        alt: col.col_name,
        href: `/products?collection=${col.col_slug}`,
      });
    }
  });

  // Banners are only displayed at the size of the container, so they are
  // capped to keep the images light (the desktop/mobile versions are also
  // separated in the carousel template so only one of them is downloaded).
  obj.data.carousels = carouselSlides.map((slide) => ({
    href: slide.href,
    desktopUrl: req.app.locals.cloudinary.url(slide.desktop, {
      width: 1350,
      crop: "limit",
      fetch_format: "auto",
      quality: "auto",
      ...cloudinaryTransformation.watermarkCarousel,
    }),
    mobileUrl: req.app.locals.cloudinary.url(slide.mobile, {
      width: 828,
      crop: "limit",
      fetch_format: "auto",
      quality: "auto",
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
