const db = require("../config/db");

// APPLY JOB + CV SAVE
exports.applyJob = (req, res) => {
  const {
    job_id,
    job_title,
    company,
    name,
    email,
    phone,
    message,
  } = req.body;

  if (!job_id || !name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: "Name, email, phone and job are required",
    });
  }

  const resumePath = req.file
    ? `/uploads/resumes/${req.file.filename}`
    : null;

  const sql = `
    INSERT INTO applications
    (job_id, job_title, company, name, email, phone, resume, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      job_id,
      job_title,
      company,
      name,
      email,
      phone,
      resumePath,
      message,
    ],
    (err, result) => {
      if (err) {
        console.log("APPLICATION ERROR:", err.message);

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        id: result.insertId,
        resume: resumePath,
      });
    }
  );
};

// GET ALL APPLICATIONS
exports.getApplications = (req, res) => {
  const sql = "SELECT * FROM applications ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log("GET APPLICATION ERROR:", err.message);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};

// DELETE APPLICATION
exports.deleteApplication = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM applications WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("DELETE APPLICATION ERROR:", err.message);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  });
};