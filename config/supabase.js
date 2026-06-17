require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("SUPABASE DEBUG:", {
  url: !!url,
  key: !!key,
});

if (!url || !key) {
  throw new Error("Missing Supabase environment variables");
}

module.exports = createClient(url, key);