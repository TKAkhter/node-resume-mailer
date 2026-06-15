require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// ─── Load & validate config ───────────────────────────────────────────────────

function loadConfig() {
  const required = ["GMAIL_USER", "GMAIL_APP_PASSWORD", "EMAIL_SUBJECT", "RESUME_PATH"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`❌ Missing env variables: ${missing.join(", ")}`);
    console.error("   Copy .env.example → .env and fill in your values.");
    process.exit(1);
  }

  const resumePath = path.resolve(process.env.RESUME_PATH);
  if (!fs.existsSync(resumePath)) {
    console.error(`❌ Resume file not found: ${resumePath}`);
    process.exit(1);
  }

  // Load email body from file
  const bodyFile = path.resolve(process.env.EMAIL_BODY_FILE || "message.txt");
  if (!fs.existsSync(bodyFile)) {
    console.error(`❌ Message file not found: ${bodyFile}`);
    console.error("   Create a message.txt file with your email body.");
    process.exit(1);
  }
  const body = fs.readFileSync(bodyFile, "utf-8").trim();

  return {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
    subject: process.env.EMAIL_SUBJECT,
    body,
    resumePath,
    resumeName: path.basename(resumePath),
  };
}

// ─── Load recipients ──────────────────────────────────────────────────────────

function loadRecipients(filePath = "recipients.txt") {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Recipients file not found: ${fullPath}`);
    process.exit(1);
  }

  const emails = fs
    .readFileSync(fullPath, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (!emails.length) {
    console.error("❌ No email addresses found in recipients.txt");
    process.exit(1);
  }

  return emails;
}

// ─── Send emails ──────────────────────────────────────────────────────────────

async function sendEmails(config, recipients) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.user, pass: config.pass },
  });

  // Verify credentials before starting
  try {
    await transporter.verify();
    console.log("✅ Gmail connection verified\n");
  } catch (err) {
    console.error("❌ Gmail auth failed:", err.message);
    console.error("   Make sure you're using an App Password, not your regular Gmail password.");
    console.error("   Guide: https://support.google.com/accounts/answer/185833");
    process.exit(1);
  }

  const results = { sent: [], failed: [] };

  for (let i = 0; i < recipients.length; i++) {
    const to = recipients[i];
    const num = `[${i + 1}/${recipients.length}]`;

    try {
      await transporter.sendMail({
        from: `"${config.user}" <${config.user}>`,
        to,
        subject: config.subject,
        text: config.body,
        attachments: [
          {
            filename: config.resumeName,
            path: config.resumePath,
          },
        ],
      });

      console.log(`${num} ✅ Sent → ${to}`);
      results.sent.push(to);

      // Small delay between emails to avoid rate limits
      if (i < recipients.length - 1) await delay(1500);
    } catch (err) {
      console.log(`${num} ❌ Failed → ${to}  (${err.message})`);
      results.failed.push({ email: to, error: err.message });
    }
  }

  return results;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function printSummary(results) {
  console.log("\n─────────────────────────────");
  console.log(`📊 Summary`);
  console.log(`   ✅ Sent:   ${results.sent.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);

  if (results.failed.length) {
    console.log("\n   Failed addresses:");
    results.failed.forEach(({ email, error }) => {
      console.log(`   • ${email} — ${error}`);
    });
  }
  console.log("─────────────────────────────\n");
}

// ─── Entry point ─────────────────────────────────────────────────────────────

(async () => {
  console.log("📧 Resume Mailer\n");

  const config = loadConfig();
  const recipients = loadRecipients();

  console.log(`📎 Resume:     ${config.resumeName}`);
  console.log(`📬 Subject:    ${config.subject}`);
  console.log(`👥 Recipients: ${recipients.length}\n`);

  const results = await sendEmails(config, recipients);
  printSummary(results);
})();
