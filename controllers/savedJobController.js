const db = require("../config/db");

const saveJob = (req, res) => {
  const { user_id, job_id } = req.body;

  const sql = "INSERT INTO saved_jobs(user_id, job_id) VALUES(?, ?)";

  db.query(sql, [user_id, job_id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    res.json({ success: true, message: "Job saved successfully" });
  });
};

const getSavedJobs = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT saved_jobs.id AS saved_id, jobs.*
    FROM saved_jobs
    JOIN jobs ON saved_jobs.job_id = jobs.id
    WHERE saved_jobs.user_id = ?
    ORDER BY saved_jobs.id DESC
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    res.json({ success: true, data: result });
  });
};

const deleteSavedJob = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM saved_jobs WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    res.json({ success: true, message: "Saved job removed" });
  });
};

module.exports = {
  saveJob,
  getSavedJobs,
  deleteSavedJob,
};