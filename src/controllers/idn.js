
var router = express.Router();

router.get('/address', async (req, res) => {
    const obj = {
        error: null,
        data: req.app.locals.address
    }
    
    return res.json(obj);
});

router.get('/villages/:districtId', async (req, res, next) => {
    const obj = {
        error: null,
        data: req.app.locals.villages.filter(v => v.district_id == (req.params.districtId).trim())
    }
    
    return res.json(obj);
});

module.exports = router;
