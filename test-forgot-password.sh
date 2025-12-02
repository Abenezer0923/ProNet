#!/bin/bash

echo "🧪 Testing Forgot Password Flow"
echo "================================"
echo ""

# Configuration
if [ "$1" == "prod" ]; then
    BASE_URL="https://pronet-user-service.onrender.com/api"
    echo "🌐 Testing PRODUCTION"
else
    BASE_URL="http://localhost:3001/api"
    echo "💻 Testing LOCAL"
fi

echo "Base URL: $BASE_URL"
echo ""

# Test email
TEST_EMAIL="test@example.com"

echo "1️⃣  Testing Forgot Password Request..."
echo "--------------------------------------"

RESPONSE=$(curl -s -X POST "$BASE_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

echo "Response: $RESPONSE"
echo ""

# Check if OTP is in response (should NOT be!)
if echo "$RESPONSE" | grep -q "otpCode"; then
    echo "❌ SECURITY ISSUE: OTP found in response!"
    echo "   OTP should only be sent via email, not in API response"
else
    echo "✅ SECURE: No OTP in response"
fi

echo ""

# Check if message is generic
if echo "$RESPONSE" | grep -q "If an account exists"; then
    echo "✅ SECURE: Generic message (prevents user enumeration)"
else
    echo "⚠️  WARNING: Message might reveal if user exists"
fi

echo ""
echo "2️⃣  Check Your Email or Console Logs..."
echo "---------------------------------------"
echo "   For local: Check terminal output"
echo "   For production: Check Render logs"
echo ""
echo "3️⃣  Test Resend OTP..."
echo "----------------------"

RESEND_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/resend-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

echo "Response: $RESEND_RESPONSE"
echo ""

if echo "$RESEND_RESPONSE" | grep -q "otpCode"; then
    echo "❌ SECURITY ISSUE: OTP found in resend response!"
else
    echo "✅ SECURE: No OTP in resend response"
fi

echo ""
echo "================================"
echo "✅ Security Test Complete!"
echo "================================"
echo ""
echo "📝 Summary:"
echo "   - OTP should NOT appear in API responses"
echo "   - OTP should only be sent via email"
echo "   - Check email or console logs for OTP"
echo "   - User must manually enter OTP"
echo ""
