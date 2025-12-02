#!/bin/bash

echo "🧪 Testing ProNet Authentication System"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
if [ "$1" == "prod" ]; then
    BASE_URL="https://pronet-user-service.onrender.com/api"
    echo "🌐 Testing PRODUCTION environment"
else
    BASE_URL="http://localhost:3001/api"
    echo "💻 Testing LOCAL environment"
fi

echo "Base URL: $BASE_URL"
echo ""

# Test email
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="Test123!@#"

# Test 1: Health Check
echo "1️⃣  Testing Health Endpoints..."
echo "--------------------------------"

echo -n "   /health: "
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/../health")
if [ "$HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED (Status: $HEALTH)${NC}"
fi

echo -n "   /health/ping: "
PING=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/../health/ping")
if [ "$PING" == "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED (Status: $PING)${NC}"
fi

echo -n "   /health/ready: "
READY=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/../health/ready")
if [ "$READY" == "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED (Status: $READY)${NC}"
fi

echo ""

# Test 2: Registration (Personal)
echo "2️⃣  Testing Registration (Personal Profile)..."
echo "-----------------------------------------------"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"profession\": \"Software Engineer\",
    \"profileType\": \"personal\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "   Token: ${TOKEN:0:20}..."
    echo "   User ID: $USER_ID"
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "   Response: $REGISTER_RESPONSE"
fi

echo ""

# Test 3: Login
echo "3️⃣  Testing Login..."
echo "--------------------"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   Token: ${TOKEN:0:20}..."
elif echo "$LOGIN_RESPONSE" | grep -q "requiresOtp"; then
    echo -e "${YELLOW}⚠ OTP verification required${NC}"
    echo "   This is expected behavior after logout"
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
fi

echo ""

# Test 4: Get Profile
echo "4️⃣  Testing Get Profile..."
echo "--------------------------"

if [ -n "$TOKEN" ]; then
    PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$PROFILE_RESPONSE" | grep -q "email"; then
        echo -e "${GREEN}✓ Profile retrieved successfully${NC}"
        echo "   Email: $(echo "$PROFILE_RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)"
    else
        echo -e "${RED}✗ Failed to get profile${NC}"
        echo "   Response: $PROFILE_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠ Skipped (no token available)${NC}"
fi

echo ""

# Test 5: Forgot Password
echo "5️⃣  Testing Forgot Password..."
echo "-------------------------------"

FORGOT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\"
  }")

if echo "$FORGOT_RESPONSE" | grep -q "OTP sent"; then
    echo -e "${GREEN}✓ OTP sent successfully${NC}"
    OTP_CODE=$(echo "$FORGOT_RESPONSE" | grep -o '"otpCode":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$OTP_CODE" ]; then
        echo "   OTP Code: $OTP_CODE"
        echo -e "   ${YELLOW}(Check server logs for OTP if not shown above)${NC}"
    fi
else
    echo -e "${RED}✗ Failed to send OTP${NC}"
    echo "   Response: $FORGOT_RESPONSE"
fi

echo ""

# Test 6: Resend OTP
echo "6️⃣  Testing Resend OTP..."
echo "-------------------------"

RESEND_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/resend-otp" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\"
  }")

if echo "$RESEND_RESPONSE" | grep -q "OTP sent"; then
    echo -e "${GREEN}✓ OTP resent successfully${NC}"
    NEW_OTP=$(echo "$RESEND_RESPONSE" | grep -o '"otpCode":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$NEW_OTP" ]; then
        echo "   New OTP Code: $NEW_OTP"
        OTP_CODE=$NEW_OTP
    fi
else
    echo -e "${RED}✗ Failed to resend OTP${NC}"
    echo "   Response: $RESEND_RESPONSE"
fi

echo ""

# Test 7: Verify OTP
if [ -n "$OTP_CODE" ]; then
    echo "7️⃣  Testing OTP Verification..."
    echo "-------------------------------"
    
    VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/verify-otp" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"otp\": \"$OTP_CODE\"
      }")
    
    if echo "$VERIFY_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ OTP verified successfully${NC}"
    else
        echo -e "${RED}✗ OTP verification failed${NC}"
        echo "   Response: $VERIFY_RESPONSE"
    fi
    echo ""
fi

# Test 8: Reset Password
if [ -n "$OTP_CODE" ]; then
    echo "8️⃣  Testing Password Reset..."
    echo "-----------------------------"
    
    # Generate new OTP for reset
    FORGOT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/forgot-password" \
      -H "Content-Type: application/json" \
      -d "{\"email\": \"$TEST_EMAIL\"}")
    
    RESET_OTP=$(echo "$FORGOT_RESPONSE" | grep -o '"otpCode":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$RESET_OTP" ]; then
        RESET_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/reset-password" \
          -H "Content-Type: application/json" \
          -d "{
            \"email\": \"$TEST_EMAIL\",
            \"otp\": \"$RESET_OTP\",
            \"newPassword\": \"NewPassword123!@#\"
          }")
        
        if echo "$RESET_RESPONSE" | grep -q "success"; then
            echo -e "${GREEN}✓ Password reset successfully${NC}"
        else
            echo -e "${RED}✗ Password reset failed${NC}"
            echo "   Response: $RESET_RESPONSE"
        fi
    else
        echo -e "${YELLOW}⚠ Skipped (no OTP available)${NC}"
    fi
    echo ""
fi

# Test 9: Logout
if [ -n "$TOKEN" ]; then
    echo "9️⃣  Testing Logout..."
    echo "--------------------"
    
    LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$LOGOUT_RESPONSE" | grep -q "Logged out"; then
        echo -e "${GREEN}✓ Logout successful${NC}"
    else
        echo -e "${RED}✗ Logout failed${NC}"
        echo "   Response: $LOGOUT_RESPONSE"
    fi
    echo ""
fi

# Test 10: Organization Registration
echo "🔟 Testing Registration (Organization Profile)..."
echo "--------------------------------------------------"

ORG_EMAIL="org-$(date +%s)@example.com"
ORG_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ORG_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"organizationName\": \"Test Organization\",
    \"profileType\": \"organizational\"
  }")

if echo "$ORG_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Organization registration successful${NC}"
    ORG_TOKEN=$(echo "$ORG_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   Token: ${ORG_TOKEN:0:20}..."
else
    echo -e "${RED}✗ Organization registration failed${NC}"
    echo "   Response: $ORG_RESPONSE"
fi

echo ""
echo "========================================"
echo "✅ Authentication System Test Complete!"
echo "========================================"
echo ""
echo "📝 Notes:"
echo "   - OTP codes are logged to server console"
echo "   - Check Render logs for OTP codes in production"
echo "   - Email delivery requires RESEND_API_KEY configuration"
echo ""
echo "🔗 Useful Links:"
echo "   - Render Dashboard: https://dashboard.render.com"
echo "   - Resend Dashboard: https://resend.com/emails"
echo "   - Cron-Job.org: https://cron-job.org"
echo ""
