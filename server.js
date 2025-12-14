// ================= LOAD ENV =================
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DATABASE =================
let pool;

if (process.env.DATABASE_URL) {
  // ✅ Production / Render
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // ✅ Local PostgreSQL
  pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "school_db",
    password: "rahul",
    port: 5432,
  });
}

// ================= TEST DB CONNECTION =================
pool.connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch(err => console.error("❌ DB connection error:", err.message));

// ================= TEST API =================
app.get("/api/test", (req, res) => {
  res.json({ message: "Server running successfully" });
});

// ================= ADMIN LOGIN =================
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "12345") {
    return res.json({
      success: true,
      token: "admin-token-123",
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
});

// ================= ADMISSION FORM =================
app.post("/admission", async (req, res) => {
  try {
    const {
      student_name,
      admission_taken,
      gender,
      standard,
      last_school,
      residential_address,
      mobile1,
      mobile2,
      email,
      reference,
    } = req.body;

    await pool.query(
      `INSERT INTO admission_inquiry_form
      (student_name, admission_taken, gender, standard, last_school,
       residential_address, mobile1, mobile2, email, reference)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        student_name,
        admission_taken,
        gender,
        standard,
        last_school,
        residential_address,
        mobile1,
        mobile2,
        email,
        reference,
      ]
    );

    res.json({ message: "Admission submitted successfully" });
  } catch (err) {
    console.error("Admission Error:", err.message);
    res.status(500).json({ message: "Admission error" });
  }
});

// ================= CONTACT FORM =================
app.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    await pool.query(
      `INSERT INTO contact_inquiry (name,email,subject,message)
       VALUES ($1,$2,$3,$4)`,
      [name, email, subject, message]
    );

    res.json({ message: "Contact submitted successfully" });
  } catch (err) {
    console.error("Contact Error:", err.message);
    res.status(500).json({ message: "Contact error" });
  }
});

// ================= ACTIVITIES API =================
let activities = [];

app.get("/api/activities", (req, res) => {
  res.json(activities);
});

app.post("/api/activities", (req, res) => {
  if (req.headers.authorization !== "admin-token-123") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  activities.push(req.body);
  res.json({ success: true });
});

// ================= FRONTEND PAGES =================
// Serve HTML files explicitly
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/about", (req, res) => res.sendFile(path.join(__dirname, "public", "about.html")));
app.get("/contact", (req, res) => res.sendFile(path.join(__dirname, "public", "contact.html")));
app.get("/admission", (req, res) => res.sendFile(path.join(__dirname, "public", "admission.html")));
app.get("/activities", (req, res) => res.sendFile(path.join(__dirname, "public", "activities.html")));

// ================= STATIC FILES =================
// Serve CSS, JS, Images
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "admin")));

// ================= 404 PAGE =================
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html")); // optional 404 page
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
