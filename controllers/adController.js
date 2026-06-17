const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================
// GET ADS
// =====================
exports.getAds = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ads")
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

// =====================
// ADD AD
// =====================
exports.addAd = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      button_text,
      bg_color,
    } = req.body;

    const image = req.file
      ? `/uploads/ads/${req.file.filename}`
      : null;

    const { data, error } = await supabase
      .from("ads")
      .insert([
        {
          title,
          subtitle,
          description,
          button_text,
          image,
          bg_color,
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

    res.json({
      success: true,
      message: "Ad added successfully",
      id: data.id,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================
// DELETE AD
// =====================
exports.deleteAd = async (req, res) => {
  try {
    const { error } = await supabase
      .from("ads")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      message: "Ad deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};