const db = require("../config/db");

exports.getDashboardStats = (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM jobs) AS jobs,
      (SELECT COUNT(*) FROM applications) AS applications,
      (SELECT COUNT(*) FROM applications WHERE status = 'interview') AS interviews,
      (SELECT COUNT(*) FROM applications WHERE status = 'hired') AS hired
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  });
};