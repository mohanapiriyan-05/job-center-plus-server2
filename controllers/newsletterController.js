const { createClient } = require("@supabase/supabase-js");

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================================
// SUBSCRIBE NEWSLETTER
// ================================
exports.subscribeNewsletter = async (req, res) => {
  try {
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

    // ================================
    // CHECK EXISTING EMAIL
    // ================================
    const { data: existing, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({
        success: false,
        message: fetchError.message,
      });
    }

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed",
      });
    }

    // ================================
    // INSERT NEW SUBSCRIBER
    // ================================
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email: cleanEmail }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully!",
      id: data.id,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};