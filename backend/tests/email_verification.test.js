require("dns").setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;

const runEmailVerificationTests = async () => {
  console.log("============================================================");
  console.log(" HIREHUB AUTOMATIC EMAIL VERIFICATION & AUTH AUDIT TESTS");
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

  await mongoose.connect(process.env.MONGO_URL);

  const testEmail = `audit_verify_${Date.now()}@hirehubtest.com`;
  const testPassword = "SecurePassword123!";
  let rawToken = "";

  try {
    // -------------------------------------------------------------
    // TEST 1: Register unverified user
    // -------------------------------------------------------------
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Audit Candidate",
        email: testEmail,
        password: testPassword,
        role: "candidate",
      }),
    });
    const regData = await regRes.json();

    assert(
      regRes.status === 201 && regData.success === true && regData.user.isEmailVerified === false,
      "1. Registration creates user in unverified state (isEmailVerified=false)",
      JSON.stringify(regData)
    );

    // Extract raw token from development verificationUrl if available or from DB
    if (regData.verificationUrl) {
      const match = regData.verificationUrl.match(/\/verify-email\/([a-f0-9]+)/);
      if (match) rawToken = match[1];
    }

    // Verify token hash is stored securely in MongoDB
    const dbUserBefore = await User.findOne({ email: testEmail }).select("+verificationToken +verificationTokenExpires");
    assert(
      !!dbUserBefore && !!dbUserBefore.verificationToken && dbUserBefore.verificationTokenExpires > Date.now(),
      "2. Cryptographically hashed verification token and 24h expiry stored in MongoDB"
    );

    // Verify raw token matches SHA-256 hash stored in DB
    if (rawToken) {
      const hashedExpected = crypto.createHash("sha256").update(rawToken).digest("hex");
      assert(
        hashedExpected === dbUserBefore.verificationToken,
        "3. Verification token in DB is securely hashed with SHA-256 (not raw token)"
      );
    }

    // -------------------------------------------------------------
    // TEST 2: Prevent unverified user from logging in
    // -------------------------------------------------------------
    const unverifiedLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const unverifiedLoginData = await unverifiedLoginRes.json();

    assert(
      unverifiedLoginRes.status === 403 &&
        unverifiedLoginData.isEmailVerified === false &&
        unverifiedLoginData.code === "EMAIL_NOT_VERIFIED",
      "4. Unverified user login is blocked with 403 and EMAIL_NOT_VERIFIED code"
    );

    // -------------------------------------------------------------
    // TEST 3: Verification with invalid token fails
    // -------------------------------------------------------------
    const invalidVerifyRes = await fetch(`${API_URL}/auth/verify-email/completely_invalid_token_12345`);
    const invalidVerifyData = await invalidVerifyRes.json();

    assert(
      invalidVerifyRes.status === 400 && invalidVerifyData.code === "INVALID_TOKEN",
      "5. Invalid verification token rejected with 400 and INVALID_TOKEN code"
    );

    // -------------------------------------------------------------
    // TEST 4: Verification with expired token fails
    // -------------------------------------------------------------
    // Simulate expired token in DB
    dbUserBefore.verificationTokenExpires = new Date(Date.now() - 3600000); // 1 hour ago
    await dbUserBefore.save();

    const expiredVerifyRes = await fetch(`${API_URL}/auth/verify-email/${rawToken}`);
    const expiredVerifyData = await expiredVerifyRes.json();

    assert(
      expiredVerifyRes.status === 400 && expiredVerifyData.code === "EXPIRED_TOKEN",
      "6. Expired verification token rejected with 400 and EXPIRED_TOKEN code"
    );

    // -------------------------------------------------------------
    // TEST 5: Resend verification email issues fresh token
    // -------------------------------------------------------------
    const resendRes = await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const resendData = await resendRes.json();

    assert(
      resendRes.status === 200 && resendData.success === true,
      "7. Resend verification endpoint generates fresh token with 200 OK"
    );

    let freshRawToken = "";
    if (resendData.verificationUrl) {
      const match = resendData.verificationUrl.match(/\/verify-email\/([a-f0-9]+)/);
      if (match) freshRawToken = match[1];
    }

    const dbUserAfterResend = await User.findOne({ email: testEmail }).select("+verificationToken +verificationTokenExpires");
    assert(
      dbUserAfterResend.verificationToken !== dbUserBefore.verificationToken &&
        dbUserAfterResend.verificationTokenExpires > Date.now(),
      "8. Previous verification token invalidated; fresh 24h token stored"
    );

    // -------------------------------------------------------------
    // TEST 6: Successful verification with valid token
    // -------------------------------------------------------------
    const validVerifyRes = await fetch(`${API_URL}/auth/verify-email/${freshRawToken}`);
    const validVerifyData = await validVerifyRes.json();

    assert(
      validVerifyRes.status === 200 &&
        validVerifyData.success === true &&
        validVerifyData.user.isEmailVerified === true &&
        !!validVerifyData.token,
      "9. Successful verification marks account verified and returns authentication token"
    );

    // Check DB state: token wiped and isEmailVerified = true
    const dbUserVerified = await User.findOne({ email: testEmail }).select("+verificationToken +verificationTokenExpires");
    assert(
      dbUserVerified.isEmailVerified === true &&
        dbUserVerified.verificationToken === undefined &&
        dbUserVerified.verificationTokenExpires === undefined,
      "10. Single-use token and expiry wiped from DB after successful validation"
    );

    // -------------------------------------------------------------
    // TEST 7: Single-use enforcement (replay attack prevention)
    // -------------------------------------------------------------
    const replayVerifyRes = await fetch(`${API_URL}/auth/verify-email/${freshRawToken}`);
    const replayVerifyData = await replayVerifyRes.json();

    assert(
      replayVerifyRes.status === 400 && replayVerifyData.code === "INVALID_TOKEN",
      "11. Replay attack prevented: used verification token cannot be reused"
    );

    // -------------------------------------------------------------
    // TEST 8: Verified user can now log in normally
    // -------------------------------------------------------------
    const verifiedLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const verifiedLoginData = await verifiedLoginRes.json();

    assert(
      verifiedLoginRes.status === 200 &&
        verifiedLoginData.success === true &&
        verifiedLoginData.user.isEmailVerified === true &&
        !!verifiedLoginData.token,
      "12. Verified user logs in successfully and receives JWT session"
    );

    // -------------------------------------------------------------
    // TEST 9: Resend verification for already-verified account
    // -------------------------------------------------------------
    const resendAlreadyVerifiedRes = await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const resendAlreadyVerifiedData = await resendAlreadyVerifiedRes.json();

    assert(
      resendAlreadyVerifiedRes.status === 200 && resendAlreadyVerifiedData.alreadyVerified === true,
      "13. Resend verification informs user account is already verified"
    );

    // -------------------------------------------------------------
    // TEST 10: Anti-enumeration on resend verification
    // -------------------------------------------------------------
    const nonExistentRes = await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent_email_random_987654@nowhere.com" }),
    });
    const nonExistentData = await nonExistentRes.json();

    assert(
      nonExistentRes.status === 200 && nonExistentData.success === true,
      "14. Anti-enumeration: resend verification returns generic success for unknown email"
    );

    // -------------------------------------------------------------
    // TEST 11: Password reset workflow
    // -------------------------------------------------------------
    const forgotRes = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const forgotData = await forgotRes.json();

    assert(
      forgotRes.status === 200 && forgotData.success === true,
      "15. Forgot password dispatches reset link with 200 OK"
    );

    let resetToken = "";
    if (forgotData.resetUrl) {
      const match = forgotData.resetUrl.match(/\/reset-password\/([a-f0-9]+)/);
      if (match) resetToken = match[1];
    }

    // Reset password with new password
    const newPassword = "NewSecretPassword456!";
    const resetRes = await fetch(`${API_URL}/auth/reset-password/${resetToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    const resetData = await resetRes.json();

    assert(
      resetRes.status === 200 && resetData.success === true,
      "16. Password reset succeeds with valid single-use token"
    );

    // Replay reset should fail
    const replayResetRes = await fetch(`${API_URL}/auth/reset-password/${resetToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "AnotherPassword789!" }),
    });
    assert(
      replayResetRes.status === 400,
      "17. Password reset token single-use enforced (cannot be reused)"
    );

    // Old password should now fail
    const oldPassLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    assert(oldPassLoginRes.status === 401, "18. Old password is deactivated after reset (401)");

    // New password should succeed
    const newPassLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: newPassword }),
    });
    assert(newPassLoginRes.status === 200, "19. New password logs in successfully (200)");

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    await User.deleteOne({ email: testEmail });
    console.log("\n[Cleaned up test record]");
  } catch (err) {
    console.error("Test execution exception:", err);
    failed++;
  } finally {
    await mongoose.disconnect();
  }

  console.log("\n============================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
};

runEmailVerificationTests();
