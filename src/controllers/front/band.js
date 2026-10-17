const express = require("express");
const router = express.Router();
const URI = require("urijs");

const { getCountryFlag } = require("../../helpers/countryFlag");
const config = require("../../config");

router.get("/", async (req, res, next) => {
  let obj = {
    error: null,
    js: ["band_list_new"],
    data: {
      breadcrumb: [{ link: "#", text: "bands" }],
      pageTitle: "Bands Marchandise | Undergroundsync",
      pageDescription: "Jelajahi daftar band lengkap dari dalam dan luar negeri. Temukan merchandise resmi dari band favorit kamu di Undergroundsync.",
      pageKeywords: "band, musik, merchandise band, official merchandise, Undergroundsync",
      bands: [],
      genres: [],
      imageBaseUrl: config.file_host,
      uri: { path: "", params: "", query: {} },
      sizes: req.app.locals.sizes,
    },
  };

  var url = new URI(req.originalUrl);
  obj.data.uri.query = url.query();

  let query = { band_enabled: 1 };

  try {
    const doc = await res.locals.bandModel.find(query, { page: 1, limit: 100000 });

    if (doc.length > 0) {
      obj.data.bands = doc.map((val) =>
        Object.assign({}, val, {
          thumbnail: val.band_image,
          bandCountryFlag: getCountryFlag(val.band_country),
          has_products: val.band_total_product > 0,
        })
      );
    }

    obj.data.bandTotal = doc.length;

    return res.render("front/band_list_new", obj);
  } catch (err) {
    console.error(err);
    obj.error = "An Error occured while load your band";
    return res.render("front/band_list_new", obj);
  }
});

module.exports = router;
