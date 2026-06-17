var router = express.Router();
const moment = require("moment");
const pagination = require("../../../helpers/pagination");

router.get("/", async (req, res, next) => {
  const userId = parseInt(req.session.user.id);
  const pageLimit = 20;

  const query = { cart_user_id: userId };

  const option = {
    limit: pageLimit,
    page:
      req.query.page &&
      !isNaN(parseInt(req.query.page)) &&
      parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1,
    sort: [["cart_id", "DESC"]],
  };

  const cartCount = await req.app.locals.cartModel.count(query);
  const doc = await req.app.locals.cartModel.find(query, option);

  const obj = {
    error: null,
    data: {
      cartItems: [],
      totalPrice: 0,
      totalItems: 0,
    },
    isShowMenu: false
  };

  let totalPrice = 0;
  let totalItems = 0;

  if (doc.length > 0) {
    obj.data.cartItems = doc.map((val) => {
      const product = val["product.prod_name"]
        ? {
            id: val["product.prod_id"],
            name: val["product.prod_name"],
            slug: val["product.prod_slug"],
            price: val["product.prod_price"],
            stock: val["product.prod_stock"],
            images: val["product.prod_images"],
            band_name: val["product.band.band_name"],
            band_slug: val["product.band.band_slug"],
            user_name: val["product.user.user_name"],
            user_username: val["product.user.user_username"],
            user_hp: val["product.user.user_hp"],
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

      const itemTotal = product ? product.price * val.cart_qty : 0;
      totalPrice += itemTotal;
      totalItems += val.cart_qty;

      return {
        cart_id: val.cart_id,
        cart_qty: val.cart_qty,
        cart_size: val.cart_size,
        cart_created_at: val.cart_created_at,
        product,
        thumbnail,
        itemTotal,
      };
    });

    obj.data.totalPrice = totalPrice;
    obj.data.totalItems = totalItems;

    // Build WhatsApp link from the first cart item's seller
    const firstItem = doc[0];
    const sellerHp = firstItem["product.user.user_hp"];
    const sellerName = firstItem["product.user.user_name"];
    const bandName = firstItem["product.band.band_name"];
    const prodName = firstItem["product.prod_name"];
    const prodPrice = firstItem["product.prod_price"];
    const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    if (sellerHp) {
      obj.data.waHref = `https://wa.me/${sellerHp}?text=Halo, saya tertarik dengan ${bandName} - ${prodName} (Rp ${prodPrice.toLocaleString('id-ID')}) ${currentUrl}`;
    }
  }

  const basePath = "/account/cart";
  const paginate = pagination(pageLimit, option.page, cartCount, basePath);
  Object.assign(obj, paginate);

  if (req.query.json == "1") return res.json(obj);
  return res.render("front/account/cart_list", obj);
});

router.post("/add", async (req, res, next) => {
  const userId = parseInt(req.session.user.id);
  const prodId = parseInt(req.body.prod_id);
  const qty = parseInt(req.body.qty) || 1;
  const size = req.body.size || null;

  if (!prodId || isNaN(prodId)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  if (qty < 1 || isNaN(qty)) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  try {
    // Check if product exists and has stock
    const product = await res.locals.productModel.findOne({ prod_id: prodId });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.prod_stock < 1) {
      return res.status(400).json({ error: "Product is out of stock" });
    }

    // Check if user can only add products from one seller
    const existingCartItems = await req.app.locals.cartModel.find({ cart_user_id: userId });
    if (existingCartItems.length > 0) {
      // Get the seller of the first existing cart item
      const firstCartItem = existingCartItems[0];
      const existingProduct = await res.locals.productModel.findOne({ prod_id: firstCartItem.cart_prod_id });
      if (existingProduct && existingProduct.prod_user_id !== product.prod_user_id) {
        return res.status(400).json({
          error: "Kamu hanya bisa membeli produk dari satu penjual dalam satu waktu. Selesaikan atau hapus pesanan dari penjual sebelumnya terlebih dahulu."
        });
      }
    }

    // Check if item already in cart
    const existingQuery = {
      cart_user_id: userId,
      cart_prod_id: prodId,
    };
    if (size) {
      existingQuery.cart_size = size;
    }

    const existing = await req.app.locals.cartModel.findOne(existingQuery);

    if (existing) {
      // Update quantity
      const newQty = existing.cart_qty + qty;
      if (newQty > product.prod_stock) {
        return res.status(400).json({ error: "Quantity exceeds available stock" });
      }
      await req.app.locals.cartModel.update(
        { cart_id: existing.cart_id },
        {
          cart_qty: newQty,
          cart_updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        }
      );
      return res.json({ status: "updated", cart_id: existing.cart_id, qty: newQty });
    } else {
      // Create new cart item
      const created = await req.app.locals.cartModel.create({
        cart_user_id: userId,
        cart_prod_id: prodId,
        cart_qty: qty,
        cart_size: size,
        cart_created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        cart_updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
      return res.json({ status: "added", cart_id: created.cart_id, qty: qty });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/update", async (req, res, next) => {
  const userId = parseInt(req.session.user.id);
  const cartId = parseInt(req.body.cart_id);
  const qty = parseInt(req.body.qty);

  if (!cartId || isNaN(cartId)) {
    return res.status(400).json({ error: "Invalid cart ID" });
  }

  if (!qty || isNaN(qty) || qty < 1) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  try {
    const cartItem = await req.app.locals.cartModel.findOne({
      cart_id: cartId,
      cart_user_id: userId,
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Check stock
    const product = await res.locals.productModel.findOne({ prod_id: cartItem.cart_prod_id });
    if (product && qty > product.prod_stock) {
      return res.status(400).json({ error: "Quantity exceeds available stock" });
    }

    await req.app.locals.cartModel.update(
      { cart_id: cartId },
      {
        cart_qty: qty,
        cart_updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      }
    );

    return res.json({ status: "updated", qty });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/remove/:id", async (req, res, next) => {
  const userId = parseInt(req.session.user.id);
  const cartId = parseInt(req.params.id);

  try {
    await req.app.locals.cartModel.remove({
      cart_id: cartId,
      cart_user_id: userId,
    });
    return res.redirect("/account/cart");
  } catch (err) {
    console.error(err);
    return res.redirect("/account/cart");
  }
});

router.get("/count", async (req, res, next) => {
  if (!req.session.user) {
    return res.json({ count: 0 });
  }

  const userId = parseInt(req.session.user.id);

  try {
    const total = await req.app.locals.cartModel.count({
      cart_user_id: userId,
    });
    return res.json({ count: total });
  } catch (err) {
    console.error(err);
    return res.json({ count: 0 });
  }
});

module.exports = router;
