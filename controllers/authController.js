const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER WITH PASSWORD
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, Gmail, phone and password required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimum 6 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users(name,email,password,role,phone) VALUES(?,?,?,?,?)",
      [name.trim(), cleanEmail, hashedPassword, "user", cleanPhone],
      (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message:
              err.code === "ER_DUP_ENTRY"
                ? "Email or phone already exists"
                : err.message,
          });
        }

        res.json({
          success: true,
          message: "Registration successful",
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN WITH PASSWORD
exports.login = (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: "Gmail/Phone and password required",
    });
  }

  const cleanLoginId = identifier.trim().toLowerCase();
  const rawLoginId = identifier.trim();

  db.query(
    "SELECT * FROM users WHERE email=? OR phone=?",
    [cleanLoginId, rawLoginId],
    async (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found. Please signup first.",
        });
      }

      const user = result[0];

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      const token = createToken(user);

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role || "user",
        },
      });
    }
  );
};

// PHONE LOGIN WITHOUT PASSWORD
exports.phoneLogin = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    const cleanPhone = phone.trim();

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    db.query(
      "SELECT * FROM users WHERE phone=?",
      [cleanPhone],
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        if (result.length > 0) {
          const user = result[0];
          const token = createToken(user);

          return res.json({
            success: true,
            message: "Phone login successful",
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role || "user",
            },
          });
        }

        const dummyPassword = await bcrypt.hash("PHONE_LOGIN_USER", 10);

        db.query(
          "INSERT INTO users(name,email,password,role,phone) VALUES(?,?,?,?,?)",
          ["User", null, dummyPassword, "user", cleanPhone],
          (insertErr, insertResult) => {
            if (insertErr) {
              return res.status(500).json({
                success: false,
                message: insertErr.message,
              });
            }

            const newUser = {
              id: insertResult.insertId,
              name: "User",
              email: null,
              phone: cleanPhone,
              role: "user",
            };

            const token = createToken(newUser);

            res.json({
              success: true,
              message: "Phone account created",
              token,
              user: newUser,
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const name = payload.name;
    const email = payload.email.toLowerCase();

    db.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        if (result.length > 0) {
          const user = result[0];
          const jwtToken = createToken(user);

          return res.json({
            success: true,
            message: "Google login successful",
            token: jwtToken,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role || "user",
            },
          });
        }

        const dummyPassword = await bcrypt.hash("GOOGLE_LOGIN_USER", 10);

        db.query(
          "INSERT INTO users(name,email,password,role,phone) VALUES(?,?,?,?,?)",
          [name, email, dummyPassword, "user", null],
          (insertErr, insertResult) => {
            if (insertErr) {
              return res.status(500).json({
                success: false,
                message: insertErr.message,
              });
            }

            const newUser = {
              id: insertResult.insertId,
              name,
              email,
              phone: null,
              role: "user",
            };

            const jwtToken = createToken(newUser);

            res.json({
              success: true,
              message: "Google account created",
              token: jwtToken,
              user: newUser,
            });
          }
        );
      }
    );
  } catch (error) {
    console.log("Google Login Error:", error.message);

    res.status(401).json({
      success: false,
      message: "Invalid Google token",
    });
  }
};