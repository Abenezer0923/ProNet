#!/bin/bash

# Test Reset Password Flow
# This script tests the complete forgot password and reset password flow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Reset Password Flow Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "API URL: ${YELLOW}$API_URL${NC}"
echo -e "Test Email: ${YELLOW}$TEST_EMAIL${NC}"
echo ""

# Test 1: Forgot Password (Request OTP)
echo -e "${BLUE}Test 1: Request Password Reset OTP${NC}"
echo "Testing: POST $API_URL/api/auth/forgot-password"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$status_code" -eq 201 ] || [ "$status_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Forgot password request successful${NC}"
    echo "Response: $body"
else
    echo -e "${RED}✗ Forgot password request failed (Status: $status_code)${NC}"
    echo "Response: $body"
    exit 1
fi

echo ""
echo -e "${YELLOW}Check your email or console logs for the OTP code${NC}"
echo ""

# Prompt for OTP
read -p "Enter the OTP code: " OTP

if [ -z "$OTP" ]; then
    echo -e "${RED}No OTP provided. Exiting.${NC}"
    exit 1
fi

# Prompt for new password
read -sp "Enter new password: " NEW_PASSWORD
echo ""

if [ -z "$NEW_PASSWORD" ]; then
    echo -e "${RED}No password provided. Exiting.${NC}"
    exit 1
fi

# Test 2: Reset Password
echo ""
echo -e "${BLUE}Test 2: Reset Password${NC}"
echo "Testing: POST $API_URL/api/auth/reset-password"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"otp\": \"$OTP\", \"newPassword\": \"$NEW_PASSWORD\"}")

status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$status_code" -eq 201 ] || [ "$status_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Password reset successful${NC}"
    echo "Response: $body"
else
    echo -e "${RED}✗ Password reset failed (Status: $status_code)${NC}"
    echo "Response: $body"
    exit 1
fi

# Test 3: Login with new password
echo ""
echo -e "${BLUE}Test 3: Login with New Password${NC}"
echo "Testing: POST $API_URL/api/auth/login"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$NEW_PASSWORD\"}")

status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$status_code" -eq 201 ] || [ "$status_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Login with new password successful${NC}"
    echo "Response: $body"
else
    echo -e "${RED}✗ Login with new password failed (Status: $status_code)${NC}"
    echo "Response: $body"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All tests passed! ✓${NC}"
echo -e "${GREEN}========================================${NC}"
