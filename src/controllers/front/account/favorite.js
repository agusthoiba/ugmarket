var router = express.Router();
const moment = require("moment");
const pagination = require("../../../helpers/pagination");

router.get("/", async (req, res, next) => {
  const userId = parseInt(req.session.user.id);
  const pageLimit = 20;

  const query = { fav_user_id: userId };

  const option = {
    limit: pageLimit,
    page:
      req.query.page &&
      !isNaN(parseInt(req.query.page)) &&
      parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1,
    sort: [["fav_id", "DESC"]],
  };

  const favCount = await req.app.locals.favoriteModel.count(query);
  const doc = await req.app.locals.favoriteModel.find(query, option);

  const obj = {
    error: null,
    data: {
      favorites: [],
    },
  };

  if (doc.length > 0) {
    obj.data.favorites = doc.map((val) => {
      const product = val["product.prod_name"]
        ? {
            id: val["product.prod_id"],
            name: val["product.prod_name"],
            slug: val["product.prod_slug"],
            price: val["product.prod_price"],
            images: val["product.prod_images"],
            band_name: val["product.band.band_name"],
            band_slug: val["product.band.band_slug"],
            user_name: val["product.user.user_name"],
            user_username: val["product.user.user_username"],
          }
        : null;

      let thumbnail = "/image/no-image-180x180.png";
      if (product && product.images) {
        const thumbArr = product.images.split(",");
        thumbnail = req.app.locals.cloudinary.url(thumbArr[0], {
          width: 100,
          height: 100,
          crop: "thumb",
        });
      }

      return {
        fav_id: val.fav_id,
        fav_created_at: val.fav_created_at,
        product,
        thumbnail,
      };
    });
  }

  const basePath = "/account/favorite";
  const paginate = pagination(pageLimit, option.page, favCount, basePath);
  Object.assign(obj, paginate);

  if (req.query.json == "1") return res.json(obj);
  return res.render("front/account/favorite_list", obj);
});

router.post("/toggle", async (req, res, next) => {
  const userId = parseInt(req.session.user.id);
  const prodId = parseInt(req.body.prod_id);

  if (!prodId || isNaN(prodId)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  try {
    const existing = await req.app.locals.favoriteModel.findOne({
      fav_user_id: userId,
      fav_prod_id: prodId,
    });

    if (existing) {
      await req.app.locals.favoriteModel.remove({
        fav_user_id: userId,
        fav_prod_id: prodId,
      });
      return res.json({ status: "removed", favorited: false });
    } else {
      await req.app.locals.favoriteModel.create({
        fav_user_id: userId,
        fav_prod_id: prodId,
        fav_created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
      return res.json({ status: "added", favorited: true });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/check/:prodId", async (req, res, next) => {
  const userId = parseInt(req.session.user.id);
  const prodId = parseInt(req.params.prodId);

  if (!prodId || isNaN(prodId)) {
    return res.status(400).json({ favorited: false });
  }

  try {
    const existing = await req.app.locals.favoriteModel.findOne({
      fav_user_id: userId,
      fav_prod_id: prodId,
    });
    return res.json({ favorited: !!existing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/remove/:id", async (req, res, next) => {
  const userId = parseInt(req.session.user.id);
  const favId = parseInt(req.params.id);

  try {
    await req.app.locals.favoriteModel.remove({
      fav_id: favId,
      fav_user_id: userId,
    });
    return res.redirect("/account/favorite");
  } catch (err) {
    console.error(err);
    return res.redirect("/account/favorite");
  }
});

module.exports = router;
