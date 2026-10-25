require("dotenv").config();
const express = require("express");
const { requireVerified } = require("../middleware/authMiddleware");
const {
  authLimiter,
  resendVerificationLimiter,
  passwordResetLimiter,
  verifyEmailLimiter,
} = require("../middleware/rateLimiter");

const runRouteTests = async () => {
  console.log("============================================================");
  console.log(" HIREHUB ROUTE & MIDDLEWARE UNIT VERIFICATION TESTS");
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

  const app = express();
  app.use(express.json());

  // Test requireVerified middleware
  app.get("/test-protected-verified", (req, res, next) => {
    req.user = { id: "123", email: "test@hirehub.com", isEmailVerified: false };
    next();
  }, requireVerified, (req, res) => {
    res.json({ success: true, message: "Welcome to protected area" });
  });

  app.get("/test-protected-allowed", (req, res, next) => {
    req.user = { id: "123", email: "test@hirehub.com", isEmailVerified: true };
    next();
  }, requireVerified, (req, res) => {
    res.json({ success: true, message: "Welcome to protected area" });
  });

  // Test rate limiter on endpoint
  app.post("/test-rate-limit", resendVerificationLimiter, (req, res) => {
    res.json({ success: true });
  });

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. requireVerified blocks unverified user
    const blockRes = await fetch(`${baseUrl}/test-protected-verified`);
    const blockData = await blockRes.json();

    assert(
      blockRes.status === 403 && blockData.isEmailVerified === false,
      "1. requireVerified middleware intercepts unverified user with status 403 and isEmailVerified=false"
    );

    // 2. requireVerified permits verified user
    const allowRes = await fetch(`${baseUrl}/test-protected-allowed`);
    const allowData = await allowRes.json();

    assert(
      allowRes.status === 200 && allowData.success === true,
      "2. requireVerified middleware permits verified user with status 200"
    );

    // 3. Test rate limiting enforcement (limit is 10)
    let rateLimited = false;
    for (let i = 0; i < 15; i++) {
      const res = await fetch(`${baseUrl}/test-rate-limit`, { method: "POST" });
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }

    assert(
      rateLimited === true,
      "3. Rate limiting middleware triggers 429 Too Many Requests when threshold exceeded"
    );
  } catch (err) {
    console.error("Route test error:", err);
    failed++;
  } finally {
    server.close();
  }

  console.log("\n============================================================");
  console.log(`ROUTE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("============================================================\n");

  if (failed > 0) process.exit(1);
};

runRouteTests();
