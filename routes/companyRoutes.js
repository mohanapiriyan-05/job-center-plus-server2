const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads/companies folder if not exists
const uploadDir = path.join(__dirname, "../uploads/companies");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// =================================
// GET ALL COMPANIES
// =================================
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM companies ORDER BY id DESC",
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      res.json(results);
    }
  );
});

// =================================
// ADD COMPANY
// =================================
router.post("/", upload.single("logo"), (req, res) => {
  try {
    console.log("========== COMPANY ADD ==========");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const name = req.body?.name;
    const logo = req.file ? req.file.filename : null;

    console.log("NAME:", name);
    console.log("LOGO:", logo);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    db.query(
      "INSERT INTO companies (name, logo) VALUES (?, ?)",
      [name, logo],
      (err, result) => {
        if (err) {
          console.error("MYSQL ERROR:", err);

          return res.status(500).json({
            success: false,
            message: "Database error",
            error: err.message,
          });
        }

        console.log("INSERT SUCCESS:", result);

        res.status(201).json({
          success: true,
          message: "Company added successfully",
          id: result.insertId,
          logo,
        });
      }
    );
  } catch (error) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =================================
// DELETE COMPANY
// =================================
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT logo FROM companies WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (results.length > 0 && results[0].logo) {
        const filePath = path.join(
          __dirname,
          "../uploads/companies",
          results[0].logo
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      db.query(
        "DELETE FROM companies WHERE id = ?",
        [id],
        (err2) => {
          if (err2) {
            return res.status(500).json(err2);
          }

          res.json({
            success: true,
            message: "Company deleted successfully",
          });
        }
      );
    }
  );
});

module.exports = router;