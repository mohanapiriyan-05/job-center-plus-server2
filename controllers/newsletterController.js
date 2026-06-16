const db = require("../config/db");

exports.subscribeNewsletter = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  const sql =
    "INSERT INTO newsletter_subscribers (email) VALUES (?)";

  db.query(sql, [cleanEmail], (err, result) => {
    if (err) {
      console.log("NEWSLETTER DB ERROR:", err.message);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "This email is already subscribed",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Database error occurred",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully!",
      id: result.insertId,
    });
  });
};