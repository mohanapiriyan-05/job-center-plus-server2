const db = require("../config/db");
const nodemailer = require("nodemailer");

// SEND JOB UPDATE TO SUBSCRIBERS
const sendJobUpdateToSubscribers = (job) => {
  db.query(
    "SELECT email FROM newsletter_subscribers",
    async (err, subscribers) => {
      if (err) {
        console.log("FETCH SUBSCRIBERS ERROR:", err.message);
        return;
      }

      const emails = subscribers.map((item) => item.email);

      if (emails.length === 0) {
        console.log("No newsletter subscribers found");
        return;
      }

      try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          console.log("Email credentials missing");
          return;
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"JobCenter+" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL,
          bcc: emails,
          subject: `New Job Alert: ${job.title}`,
          html: `
            <div style="font-family:Arial;background:#f4f7fb;padding:20px;">
              <div style="max-width:600px;margin:auto;background:white;padding:25px;border-radius:16px;">
                <h2 style="color:#2563eb;">New Job Opportunity</h2>

                <h3>${job.title}</h3>

                <p><b>Company:</b> ${job.company}</p>
                <p><b>Location:</b> ${job.location}</p>
                <p><b>Type:</b> ${job.type}</p>
                <p><b>Category:</b> ${job.category || "N/A"}</p>
                <p><b>Salary:</b> ${job.salary || "Not mentioned"}</p>
                <p><b>Days Left:</b> ${job.days_left || "N/A"}</p>

                <p>${job.description || ""}</p>

                <hr />

                <p style="font-size:12px;color:#64748b;">
                  You received this email because you subscribed to JobCenter+ job alerts.
                </p>
              </div>
            </div>
          `,
        });

        console.log("Job alert sent to subscribers");
      } catch (error) {
        console.log("JOB ALERT EMAIL ERROR:", error.message);
      }
    }
  );
};

// GET ALL JOBS
exports.getJobs = (req, res) => {
  const sql = "SELECT * FROM jobs ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log("GET JOBS ERROR:", err.message);

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

// ADD JOB
exports.addJob = (req, res) => {
  const {
    company,
    title,
    location,
    type,
    category = "",
    days_left = "",
    salary = "",
    description = "",
  } = req.body;

  if (!company || !title || !location || !type) {
    return res.status(400).json({
      success: false,
      message: "Company, title, location and type are required",
    });
  }

  const sql = `
    INSERT INTO jobs
    (company, title, location, type, category, days_left, salary, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      company,
      title,
      location,
      type,
      category,
      days_left,
      salary,
      description,
    ],
    (err, result) => {
      if (err) {
        console.log("ADD JOB ERROR:", err.message);

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Job added successfully",
        jobId: result.insertId,
      });

      sendJobUpdateToSubscribers({
        company,
        title,
        location,
        type,
        category,
        days_left,
        salary,
        description,
      });
    }
  );
};

// DELETE JOB
exports.deleteJob = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM jobs WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("DELETE JOB ERROR:", err.message);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  });
};