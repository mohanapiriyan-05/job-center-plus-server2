const supabase = require("../config/supabase");
const nodemailer = require("nodemailer");


// ================================
// EMAIL: JOB ALERT SYSTEM
// ================================
const sendJobUpdateToSubscribers = async (job) => {
  try {
    const { data: subscribers, error } = await supabase
      .from("newsletter_subscribers")
      .select("email");

    if (error) {
      console.log("FETCH SUBSCRIBERS ERROR:", error.message);
      return;
    }

    const emails = (subscribers || []).map((item) => item.email);

    if (emails.length === 0) {
      console.log("No newsletter subscribers found");
      return;
    }

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
};


// ================================
// GET ALL JOBS
// ================================
exports.getJobs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
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
};


// ================================
// ADD JOB
// ================================
exports.addJob = async (req, res) => {
  try {
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

    const { data, error } = await supabase
      .from("jobs")
      .insert([
        {
          company,
          title,
          location,
          type,
          category,
          days_left,
          salary,
          description,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // send response first
    res.status(201).json({
      success: true,
      message: "Job added successfully",
      jobId: data.id,
    });

    // async email (non-blocking)
    sendJobUpdateToSubscribers(data);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ================================
// DELETE JOB
// ================================
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      message: "Job deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};