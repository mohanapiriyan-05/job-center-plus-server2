const { createClient } = require("@supabase/supabase-js");

// ========================
// SUPABASE CLIENT
// ========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ========================
// SAVE JOB
// ========================
const saveJob = async (req, res) => {
  try {
    const { user_id, job_id } = req.body;

    if (!user_id || !job_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and job_id are required",
      });
    }

    // optional: prevent duplicate save
    const { data: existing } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("user_id", user_id)
      .eq("job_id", job_id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Job already saved",
      });
    }

    const { data, error } = await supabase
      .from("saved_jobs")
      .insert([{ user_id, job_id }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      message: "Job saved successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================
// GET SAVED JOBS
// ========================
const getSavedJobs = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const { data, error } = await supabase
      .from("saved_jobs")
      .select(`
        id,
        user_id,
        job_id,
        jobs (
          id,
          company,
          title,
          location,
          type,
          category,
          days_left,
          salary,
          description
        )
      `)
      .eq("user_id", user_id)
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================
// DELETE SAVED JOB
// ========================
const deleteSavedJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    const { data, error } = await supabase
      .from("saved_jobs")
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
        message: "Saved job not found",
      });
    }

    res.json({
      success: true,
      message: "Saved job removed",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  saveJob,
  getSavedJobs,
  deleteSavedJob,
};