const express = require("express");
const router = express.Router();

const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

// =======================
// SUPABASE SETUP
// =======================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// safety check (VERY IMPORTANT)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase env variables");
}

// =======================
// MULTER (memory upload)
// =======================
const upload = multer({
  storage: multer.memoryStorage(),
});

// =======================
// GET ALL COMPANIES
// =======================
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =======================
// ADD COMPANY
// =======================
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    let logoUrl = null;

    // =======================
    // UPLOAD LOGO TO SUPABASE STORAGE
    // =======================
    if (file) {
      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;

      const { error: uploadError } = await supabase.storage
        .from("companies")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        return res.status(500).json({
          success: false,
          message: uploadError.message,
        });
      }

      const { data: publicData } = supabase.storage
        .from("companies")
        .getPublicUrl(fileName);

      logoUrl = publicData.publicUrl;
    }

    // =======================
    // INSERT INTO DATABASE
    // =======================
    const { data, error } = await supabase
      .from("companies")
      .insert([{ name, logo: logoUrl }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Company added successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =======================
// DELETE COMPANY
// =======================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // get company first
    const { data: company, error: fetchError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(500).json({
        success: false,
        message: fetchError.message,
      });
    }

    // delete image from storage (if exists)
    if (company?.logo) {
      const fileName = company.logo.split("/").pop();

      await supabase.storage.from("companies").remove([fileName]);
    }

    // delete DB row
    const { error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        message: deleteError.message,
      });
    }

    res.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;