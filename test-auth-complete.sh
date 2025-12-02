#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="https://pronet-user-service.onrender.com"
TEST_EMAIL="test-$(date +%s)@example.com"

echo "🧪 Testing Authentication System"
echo "================================"
echo ""

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
echo "Testing: $BASE_URL/health"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "Response: $body"
else
    echo -e "${RED}❌ Health check failed (Status: $status_code)${NC}"
    echo "Response: $body"
fi
echo ""

# Test 2: Ping Endpoint
echo -e "${BLUE}Test 2: Ping Endpoint${NC}"
echo "Testing: $BASE_URL/health/ping"
start_time=$(date +%s%N)
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health/ping")
end_time=$(date +%s%N)
elapsed=$((($end_time - $start_time) / 1000000))
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ Ping successful (${elapsed}ms)${NC}"
    echo "Response: $body"
    if [ $elapsed -lt 5000 ]; then
        echo -e "${GREEN}✅ Service is warm (< 5 seconds)${NC}"
    else
        echo -e "${YELLOW}⚠️  Service might be cold starting (> 5 seconds)${NC}"
    fi
else
    echo -e "${RED}❌ Ping failed (Status: $status_code)${NC}"
fi
echo ""

# Test 3: Registration (Personal)
echo -e "${BLUE}Test 3: Registration (Personal Profile)${NC}"
echo "Testing: POST $BASE_URL/api/auth/register"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test123!@#\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"profession\": \"Software Developer\",
    \"profileType\": \"personal\"
  }")
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" = "201" ] || [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    echo "Response: $body"
    # Extract token for later tests
    TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}❌ Registration failed (Status: $status_code)${NC}"
    echo "Response: $body"
fi
echo ""

# Test 4: Forgot Password (OTP Generation)
echo -e "${BLUE}Test 4: Forgot Password (OTP Generation)${NC}"
echo "Testing: POST $BASE_URL/api/auth/forgot-password"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" = "201" ] || [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ OTP generation successful${NC}"
    echo "Response: $body"
    # Extract OTP for next test
    OTP=$(echo "$body" | grep -o '"otpCode":"[^"]*' | cut -d'"' -f4)
    if [ -n "$OTP" ]; then
        echo -e "${GREEN}✅ OTP extracted: $OTP${NC}"
    fi
else
    echo -e "${RED}❌ OTP generation failed (Status: $status_code)${NC}"
    echo "Response: $body"
fi
echo ""

# Test 5: Verify OTP
if [ -n "$OTP" ]; then
    echo -e "${BLUE}Test 5: Verify OTP${NC}"
    echo "Testing: POST $BASE_URL/api/auth/verify-otp"
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/verify-otp" \
      -H "Content-Type: application/json" \
      -d "{\"email\": \"$TEST_EMAIL\", \"otp\": \"$OTP\"}")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$status_code" = "201" ] || [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ OTP verification successful${NC}"
        echo "Response: $body"
    else
        echo -e "${RED}❌ OTP verification failed (Status: $status_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
fi

# Test 6: Login
echo -e "${BLUE}Test 6: Login${NC}"
echo "Testing: POST $BASE_URL/api/auth/login"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"Test123!@#\"}")
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" = "201" ] || [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "Response: $body"
    # Update token if new one is provided
    NEW_TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$NEW_TOKEN" ]; then
        TOKEN="$NEW_TOKEN"
    fi
else
    echo -e "${RED}❌ Login failed (Status: $status_code)${NC}"
    echo "Response: $body"
fi
echo ""

# Test 7: Get Profile (Authenticated)
if [ -n "$TOKEN" ]; then
    echo -e "${BLUE}Test 7: Get Profile (Authenticated)${NC}"
    echo "Testing: GET $BASE_URL/api/auth/me"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/auth/me" \
      -H "Authorization: Bearer $TOKEN")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ Profile retrieval successful${NC}"
        echo "Response: $body"
    else
        echo -e "${RED}❌ Profile retrieval failed (Status: $status_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
fi

# Test 8: Resend OTP
echo -e "${BLUE}Test 8: Resend OTP${NC}"
echo "Testing: POST $BASE_URL/api/auth/resend-otp"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/resend-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" = "201" ] || [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ Resend OTP successful${NC}"
    echo "Response: $body"
else
    echo -e "${RED}❌ Resend OTP failed (Status: $status_code)${NC}"
    echo "Response: $body"
fi
echo ""

# Summary
echo "================================"
echo -e "${BLUE}📊 Test Summary${NC}"
echo "================================"
echo ""
echo "Test Email: $TEST_EMAIL"
echo "Base URL: $BASE_URL"
echo ""
echo "Next Steps:"
echo "1. Check Render logs for email delivery status"
echo "2. Verify OTP emails are being sent"
echo "3. Test Google OAuth manually in browser"
echo "4. Monitor cron job execution at cron-job.org"
echo ""
echo -e "${GREEN}🎉 Testing complete!${NC}"
echo ""
