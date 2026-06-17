const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// APPLY JOB
exports.applyJob = async (req, res) => {
  try {
    const { job_id, job_title, company, name, email, phone, message } = req.body;

    if (!job_id || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and job are required",
      });
    }

    const resumePath = req.file
      ? `/uploads/resumes/${req.file.filename}`
      : null;

    const { data, error } = await supabase
      .from("applications")
      .insert([
        {
          job_id,
          job_title,
          company,
          name,
          email,
          phone,
          resume: resumePath,
          message,
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

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      id: data.id,
      resume: resumePath,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET APPLICATIONS
exports.getApplications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("applications")
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

// DELETE APPLICATION
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};