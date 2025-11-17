import { Controller, Post, Body, Get, UseGuards, Request, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      const result = await this.authService.googleLogin(req.user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // If OTP verification is required, redirect to OTP page
      if (result.requiresVerification) {
        const params = new URLSearchParams({
          email: req.user.email,
          type: 'login',
        });
        res.redirect(`${frontendUrl}/verify-otp?${params.toString()}`);
        return;
      }
      
      // Normal flow - redirect to callback with token
      const params = new URLSearchParams({
        token: result.token,
        requiresVerification: 'false',
        email: req.user.email,
      });
      res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    } catch (error) {
      console.error('Google callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto.email);
  }

  @Post('login-with-otp')
  async loginWithOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.loginWithOtp(verifyOtpDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.validateUser(req.user.sub);
  }
}
