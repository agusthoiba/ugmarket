const express = require("express");
const { result } = require("underscore");
const router = express.Router();
const multer = require("multer");

const { collectionsSchema } = require("../../models/schema");
const validate = require("../../middleware/validate");
// Configure multer for file uploads
const uploadMulter = multer({ dest: "/tmp/upload" }); // Store files in /tmp/upload

function authCheckSession(req, resp, next) {
  if (req.session && !req.session.user_admin) {
    console.log("redirect to login");
    return resp.redirect("/admin/auth/login");
  }

  return next();
}

async function cleanPayload(body) {
  let result = {};

  if (body.col_name) {
    result.col_name = body.col_name.trim();
    result.col_slug = slug(body.col_name.toLowerCase());
  }
  if (body.col_desc) {
    result.col_desc = body.col_desc.trim();
  }
  if (body.col_banner_isdisplay_home != null) {
    result.col_banner_isdisplay_home =
      body.col_banner_isdisplay_home != null ? 1 : 0;
  }
  if (body.col_is_visible != null) {
    result.col_is_visible = body.col_is_visible != null ? 1 : 0;
  }
  if (body.col_sort) {
    result.col_sort = parseInt(body.col_sort);
  }

  if (body.col_thumbnail) {
    result.col_thumbnail = body.col_thumbnail || "";
  }
  if (body.col_banner_desktop) {
    result.col_banner_desktop = body.col_banner_desktop || "";
  }
  if (body.col_banner_mobile) {
    result.col_banner_mobile = body.col_banner_mobile || "";
  }
  return result;
}

async function uploadFile(locals, file, prefix) {
  let fileName = "";
  if (file) {
    var current_time = new Date().valueOf().toString();
    fileName = `${prefix}_${current_time}`;

    try {
      console.log("Uploading to Cloudinary...");
      await locals.uploadCloudinary.uploadToCloud(file.path, "", fileName);
    } catch (err) {
      console.log("[ERROR][CLEANPOST_UPLOAD] in prod ", err);
      return err;
    }
  }
  return fileName;
}

// Create a new collection (supports multiple file uploads)
const uploadFields = uploadMulter.fields([
  { name: "col_thumbnail_file", maxCount: 1 },
  { name: "col_banner_desktop", maxCount: 1 },
  { name: "col_banner_mobile", maxCount: 1 },
]);

router.post(
  "/",
  authCheckSession,
  uploadFields,
  validate(collectionsSchema),
  async (req, res) => {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    try {
      // Handle multiple file uploads
      if (req.files) {
        if (
          req.files["col_thumbnail_file"] &&
          req.files["col_thumbnail_file"][0]
        ) {
          req.body.col_thumbnail = await uploadFile(
            res.locals,
            req.files["col_thumbnail_file"][0],
            "col_thumbnail",
          );
        }
        if (
          req.files["col_banner_desktop"] &&
          req.files["col_banner_desktop"][0]
        ) {
          req.body.col_banner_desktop = await uploadFile(
            res.locals,
            req.files["col_banner_desktop"][0],
            "col_banner_desktop",
          );
        }
        if (
          req.files["col_banner_mobile"] &&
          req.files["col_banner_mobile"][0]
        ) {
          req.body.col_banner_mobile = await uploadFile(
            res.locals,
            req.files["col_banner_mobile"][0],
            "col_banner_mobile",
          );
        }
      }

      const payload = await cleanPayload(req.body);

      const newCollection =
        await req.app.locals.collectionModel.create(payload);

      res.status(201).json(newCollection);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },
);

// Read all collections
router.get("/", authCheckSession, async (req, res) => {
  console.log("Fetching collections...");
  var obj = {
    error: null,
    data: {
      bands: [],
    },
  };
  try {
    const collections = await req.app.locals.collectionModel.find({});
    console.log("collections:", collections);

    collections.map((col) => {
      if (col.col_thumbnail) {
        col.col_thumbnail = req.app.locals.cloudinary.url(col.col_thumbnail, {
          width: 100,
          height: 100,
        });
      }
      return col;
    });

    if (req.query.json == "1") {
      return res.status(200).json(collections);
    }
    return res.render("admin/collections", obj);
  } catch (error) {
    if (req.query.json == "1") {
      return res.status(500).json({ error: error.message });
    }
    obj.error = error.message;
    return res.render("admin/collections", obj);
  }
});

// Read a single collection by ID
router.get("/:id", authCheckSession, async (req, res) => {
  try {
    const collection = await req.app.locals.collectionModel.findOne({
      col_id: req.params.id,
    });
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a collection
router.put("/:id", authCheckSession, uploadFields, async (req, res) => {
  try {
    delete req.body.col_id;
    // Handle multiple file uploads
    if (req.files) {
      if (
        req.files["col_thumbnail_file"] &&
        req.files["col_thumbnail_file"][0]
      ) {
        req.body.col_thumbnail = await uploadFile(
          res.locals,
          req.files["col_thumbnail_file"][0],
          "col_thumbnail",
        );
      }
      if (
        req.files["col_banner_desktop"] &&
        req.files["col_banner_desktop"][0]
      ) {
        req.body.col_banner_desktop = await uploadFile(
          res.locals,
          req.files["col_banner_desktop"][0],
          "col_banner_desktop",
        );
      }
      if (req.files["col_banner_mobile"] && req.files["col_banner_mobile"][0]) {
        req.body.col_banner_mobile = await uploadFile(
          res.locals,
          req.files["col_banner_mobile"][0],
          "col_banner_mobile",
        );
      }
    }
    const payload = await cleanPayload(req.body);

    const updated = await req.app.locals.collectionModel.update(
      { col_id: req.params.id },
      payload,
    );
    if (!updated) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a collection
router.delete("/:id", authCheckSession, async (req, res) => {
  try {
    const deleted = await req.app.locals.collectionModel.softDelete({
      col_id: req.params.id,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
