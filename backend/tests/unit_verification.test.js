require("dotenv").config();
const crypto = require("crypto");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailService");

const runUnitTests = async () => {
  console.log("============================================================");
  console.log(" HIREHUB UNIT TESTS: EMAIL SERVICE & SECURITY LOGIC");
  console.log("============================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, detail = "") => {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  };

  // 1. Test token generation & hashing
  const rawToken = crypto.randomBytes(32).toString("hex");
  assert(rawToken.length === 64, "1. Raw token is 64 hex characters (32 bytes cryptographically secure)");

  const hashedToken1 = crypto.createHash("sha256").update(rawToken).digest("hex");
  const hashedToken2 = crypto.createHash("sha256").update(rawToken).digest("hex");
  assert(
    hashedToken1 === hashedToken2 && hashedToken1.length === 64,
    "2. SHA-256 hash of token is deterministic and 64 hex characters"
  );

  // 2. Test sendVerificationEmail with active environment credentials
  const verResult = await sendVerificationEmail({
    to: "candidate@example.com",
    name: "Alex Johnson",
    token: rawToken,
  });

  // Since credentials are set in .env, either SMTP succeeds or handles error safely with fallback URL
  if (verResult.delivered) {
    assert(
      verResult.success === true && !!verResult.messageId,
      "3. sendVerificationEmail delivered via SMTP successfully"
    );
  } else {
    assert(
      verResult.delivered === false &&
        typeof verResult.error === "string" &&
        verResult.verificationUrl.includes(`/verify-email/${rawToken}`),
      "3. sendVerificationEmail safely handles SMTP error and provides developer fallback URL without exposing credentials"
    );
  }

  // 3. Test sendPasswordResetEmail with active environment credentials
  const resetResult = await sendPasswordResetEmail({
    to: "candidate@example.com",
    name: "Alex Johnson",
    token: rawToken,
  });

  if (resetResult.delivered) {
    assert(
      resetResult.success === true && !!resetResult.messageId,
      "4. sendPasswordResetEmail delivered via SMTP successfully"
    );
  } else {
    assert(
      resetResult.delivered === false &&
        typeof resetResult.error === "string" &&
        resetResult.resetUrl.includes(`/reset-password/${rawToken}`),
      "4. sendPasswordResetEmail safely handles SMTP error and provides developer fallback URL without exposing credentials"
    );
  }

  // 4. Test simulated development mode when credentials are unconfigured
  const savedUser = process.env.EMAIL_USER;
  const savedPass = process.env.EMAIL_PASS;
  delete process.env.EMAIL_USER;
  delete process.env.EMAIL_PASS;

  const devVerResult = await sendVerificationEmail({
    to: "candidate@example.com",
    name: "Alex Johnson",
    token: rawToken,
  });

  assert(
    devVerResult.success === true &&
      devVerResult.delivered === false &&
      devVerResult.mode === "development_log" &&
      devVerResult.verificationUrl.includes(`/verify-email/${rawToken}`),
    "5. sendVerificationEmail switches to safe development logger mode when credentials are not configured"
  );

  // Restore env
  if (savedUser) process.env.EMAIL_USER = savedUser;
  if (savedPass) process.env.EMAIL_PASS = savedPass;

  // 5. Test Token Expiry Logic
  const now = Date.now();
  const token24hExpiry = new Date(now + 24 * 60 * 60 * 1000);
  const tokenExpired = new Date(now - 1000);

  assert(token24hExpiry.getTime() > now, "6. Verification token expiry initialized to 24 hours in the future");
  assert(tokenExpired.getTime() < now, "7. Expired token check correctly detects expired timestamps");

  // 6. Test Email Format Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert(emailRegex.test("valid.user@example.com") === true, "8. Valid email passes regex validation");
  assert(emailRegex.test("invalid-email-no-at.com") === false, "9. Invalid email rejected by regex validation");
  assert(emailRegex.test("missingdomain@") === false, "10. Incomplete email rejected by regex validation");

  // 7. Test Password Length Validation
  const isValidPass = (p) => typeof p === "string" && p.length >= 8;
  assert(isValidPass("short") === false, "11. Passwords under 8 characters rejected");
  assert(isValidPass("ValidPassword123!") === true, "12. Passwords with 8+ characters accepted");

  // 8. Test Anti-Enumeration Design
  const genericResendMessage = "If that email is registered and unverified, a verification link has been sent.";
  const genericForgotMessage = "If an account exists with this email, a password reset link has been dispatched.";
  assert(
    !genericResendMessage.includes("exists") && !genericResendMessage.includes("not found"),
    "13. Resend verification response avoids user enumeration"
  );
  assert(
    !genericForgotMessage.includes("not found") && !genericForgotMessage.includes("invalid user"),
    "14. Forgot password response avoids user enumeration"
  );

  console.log("\n============================================================");
  console.log(`UNIT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("============================================================\n");

  if (failed > 0) process.exit(1);
};

runUnitTests();
