const router = express.Router();

/**
 * POST /wa/product
 * Logs a WhatsApp product inquiry and returns the WhatsApp URL to redirect to.
 * Body: { product_id, seller_id, user_id (optional) }
 * Also captures browser cookies/headers for analytics.
 */
router.post('/product', async (req, res) => {
  try {
    const { product_id, seller_id, user_id } = req.body;

    if (!product_id || !seller_id) {
      return res.status(400).json({ error: 'product_id and seller_id are required' });
    }

    // Look up seller to get phone number
    const sellerRecord = await req.app.locals.sellerModel.findOne({ sel_user_id: seller_id });
    if (!sellerRecord) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Look up product for details
    const product = await res.locals.productModel.findOne({ prod_id: product_id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const sellerPhone = sellerRecord.sel_phone || product['user.user_hp'];
    if (!sellerPhone) {
      return res.status(400).json({ error: 'Seller has no phone number' });
    }

    // Build current URL for the message
    const currentUrl = req.protocol + '://' + req.get('host') + '/products/' + product_id + '/' + (product.prod_slug || '');

    // Build WhatsApp message
    const message = `Halo, saya tertarik dengan ${product['band.band_name']} - ${product.prod_name} (Rp ${(product.prod_price).toLocaleString('id-ID')}) ${currentUrl}`;

    // Build WhatsApp URL
    const waUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;

    // Log the inquiry (for analytics)
    console.log('[WA Product Inquiry]', {
      product_id,
      seller_id,
      user_id: user_id || null,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      cookies: req.cookies,
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      waUrl: waUrl
    });
  } catch (err) {
    console.error('[WA Product Error]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
