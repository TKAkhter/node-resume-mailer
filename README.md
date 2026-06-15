# 📧 Resume Mailer

A lightweight Node.js utility for sending your resume to multiple recruiters via Gmail.

The application reads recipients from a text file, loads your email content from a message template, attaches your resume, and sends emails sequentially while providing a detailed summary of successful and failed deliveries.

---

## Features

- Send emails to multiple recipients
- Automatically attach your resume
- Store email body in a separate text file
- Environment-based configuration
- Gmail App Password authentication
- Connection verification before sending
- Success and failure reporting
- Validation of required files and configuration
- Built-in delay between emails to reduce Gmail rate limiting

## Setup

### 1. Install dependencies

Clone the repository:
```bash

git  clone  https://github.com/yourusername/resume-mailer.git

cd  resume-mailer
```

Install dependencies:
```bash
npm  install

```

### 2. Get a Gmail App Password

You **cannot** use your regular Gmail password. You need an **App Password**:
1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (required)
3. Go to **Security → 2-Step Verification → App passwords**
4. Select app: **Mail**, device: **Other** → name it "Resume Mailer"
5. Copy the 16-character password (e.g. `abcd efgh ijkl mnop`)

### 3. Create your `.env` file

```bash
cp  .env.example  .env

```

Then edit `.env` with your details:

```env
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

EMAIL_SUBJECT=Application for Software Engineer - John Doe

# Path to your message file (default: message.txt)
EMAIL_BODY_FILE=message.txt

# Path to your resume file (PDF recommended)
RESUME_PATH=./resume.pdf
```

### 4. Create `message.txt`

```text
Dear Recruiter,

I hope you're doing well.

I am interested in opportunities within your organization and have attached my resume for consideration.

Thank you for your time and consideration.

Best regards,
John Doe
```

### 5. Add your resume

Place your resume PDF in the project folder and set `RESUME_PATH` in `.env`.

### 6. Add recipients

Edit `recipients.txt` — one email per line:

```
# this line is ignored (comment)

# Technology Recruiters
recruiter1@example.com

# HR Contacts
recruiter2@example.com
```

---

## Project Structure

```text
resume-mailer/
│
├── index.js
├── package.json
├── .env.example
├── .env
├── recipients.txt
├── message.txt
├── resume.pdf
└── README.md
```

---

## Usage

Start the application:

```bash
npm  start
```

Or:

```bash
node  index.js
```

### Output example

```

📧 Resume Mailer

📎 Resume: resume.pdf
📬 Subject: Application for Software Engineer - John Doe
👥 Recipients: 3


✅ Gmail connection verified

[1/3] ✅ Sent → hr@company1.com
[2/3] ✅ Sent → recruiter@company2.com
[3/3] ❌ Failed → bad@email.com (Message failed...)

─────────────────────────────

📊 Summary
✅ Sent: 2
❌ Failed: 1

─────────────────────────────

```

---

## Validation

Before sending emails, the application verifies:

- Required environment variables exist
- Resume file exists
- Message file exists
- Recipients file exists
- Gmail authentication is successful

The application exits immediately if any validation fails.

---

## Security

Add the following to `.gitignore`:

```
gitignore
.env
resume.pdf
recipients.txt
```

---

## Dependencies

- dotenv
- nodemailer
---

## License

MIT

---

## Notes

- Emails are sent **one at a time** with a 1.5s delay to avoid Gmail rate limits
- Gmail allows ~500 emails/day for regular accounts
- Failed emails are listed in the summary — you can retry them

- Never commit:
   - `.env` file (it's in `.gitignore`)
   - Gmail credentials
   - App Passwords
   - Personal resumes
   - Recruiter email lists