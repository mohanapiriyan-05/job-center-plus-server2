const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.getDashboardStats = async (req, res) => {
  try {
    // Jobs count
    const jobs = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true });

    // Applications count
    const applications = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true });

    // Interview count
    const interviews = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "interview");

    // Hired count
    const hired = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "hired");

    res.json({
      success: true,
      data: {
        jobs: jobs.count || 0,
        applications: applications.count || 0,
        interviews: interviews.count || 0,
        hired: hired.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};