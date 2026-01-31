import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Otp } from './entities/otp.entity';
import { LoginSession } from './entities/login-session.entity';
import { EmailService } from './email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { generateUniqueUsername } from '../users/utils/username.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(LoginSession)
    private loginSessionRepository: Repository<LoginSession>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async register(registerDto: RegisterDto) {
    try {
      const { email, password, firstName, lastName, profession, profileType = 'personal', organizationName } = registerDto;

      console.log('Registration attempt for:', email, 'Type:', profileType);

      // Validate required fields based on profile type
      if (profileType === 'personal') {
        if (!firstName || !lastName) {
          throw new BadRequestException('First name and last name are required for personal profiles');
        }
      } else if (profileType === 'organizational') {
        if (!organizationName) {
          throw new BadRequestException('Organization name is required for organizational profiles');
        }
      }

      // Check if user exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate unique username
      const baseName = profileType === 'organizational' ? organizationName : firstName;
      const secondaryName = profileType === 'organizational' ? 'org' : lastName;
      const username = await this.generateAvailableUsername(baseName, secondaryName);

      // Create user
      const user = this.userRepository.create({
        email,
        username,
        password: hashedPassword,
        firstName: profileType === 'personal' ? firstName : null,
        lastName: profileType === 'personal' ? lastName : null,
        organizationName: profileType === 'organizational' ? organizationName : null,
        profileType,
        profession: profileType === 'personal' ? profession : null,
        isEmailVerified: false, // Require email verification
      });

      console.log('Saving user to database...');
      await this.userRepository.save(user);
      console.log('User saved successfully');

      // Generate and send verification OTP
      console.log('Generating verification OTP...');
      try {
        await this.generateAndSendOtp(email, 'verify');
        console.log('Verification OTP sent successfully');
      } catch (otpError) {
        console.error('Failed to generate/send OTP:', otpError);
        // Don't fail registration if OTP fails - user can request resend
        console.log('Continuing registration despite OTP failure');
      }

      return {
        success: true,
        message: 'Registration successful. Please check your email for verification code.',
        email: user.email,
        requiresVerification: true,
      };
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return {
        success: false,
        requiresVerification: true,
        message: 'Please verify your email address before logging in',
        email: user.email,
      };
    }

    // Generate token - no OTP required for normal login
    const token = this.generateToken(user);

    return {
      success: true,
      user: this.sanitizeUser(user),
      token,
      message: 'Login successful',
    };
  }

  async validateUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async googleLogin(googleUser: any) {
    try {
      const { email, firstName, lastName, picture } = googleUser;

      console.log('Google login attempt for:', email);

      // Check if user exists
      let user = await this.userRepository.findOne({ where: { email } });
      let isNewUser = false;

      if (!user) {
        console.log('Creating new user from Google profile');
        // Generate unique username
        const username = await this.generateAvailableUsername(firstName, lastName);

        // Create new user from Google profile
        user = this.userRepository.create({
          email,
          username,
          firstName,
          lastName,
          profilePicture: picture,
          password: '', // No password for OAuth users
          profileType: 'personal',
          isEmailVerified: true, // Google OAuth verifies email
        });
        await this.userRepository.save(user);
        isNewUser = true;
        console.log('New user created successfully');
      } else {
        console.log('Existing user found');
        // Update profile picture if missing
        if (!user.profilePicture && picture) {
          console.log('Updating missing profile picture from Google');
          user.profilePicture = picture;
          await this.userRepository.save(user);
        }
        
        // Mark email as verified if not already (OAuth confirms email)
        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
          await this.userRepository.save(user);
        }
      }

      // Generate token immediately - OAuth is already secure, no OTP needed
      const token = this.generateToken(user);

      return {
        success: true,
        user: this.sanitizeUser(user),
        token,
        isNewUser,
        message: 'Google login successful',
      };
    } catch (error) {
      console.error('Google login error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async generateAndSendOtp(email: string, purpose: 'verify' | 'reset' | 'login' = 'verify'): Promise<string> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Delete any existing OTPs for this email
    await this.otpRepository.delete({ email });

    // Save new OTP
    const otpEntity = this.otpRepository.create({
      email,
      otp,
      expiresAt,
    });
    await this.otpRepository.save(otpEntity);

    // Log OTP for development/debugging (remove in production or use proper logging)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 [DEV] OTP for ${email}: ${otp}`);
      console.log(`⏰ [DEV] OTP expires at: ${expiresAt}`);
    }

    // Send OTP via email (Fire and forget to avoid timeout)
    const emailSubject = purpose === 'reset' ? 'Password Reset Code' : 'Email Verification Code';
    this.emailService.sendOtpEmail(email, otp, emailSubject)
      .then(() => console.log(`✅ OTP email sent successfully to ${email}`))
      .catch((error) => console.error(`⚠️  Failed to send email to ${email}:`, error.message));

    // Don't return OTP in production for security
    return process.env.NODE_ENV === 'development' ? otp : '';
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ success: boolean; message: string }> {
    const { email, otp } = verifyOtpDto;

    // Clean up expired OTPs
    await this.otpRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    // Find the OTP
    const otpEntity = await this.otpRepository.findOne({
      where: { email, otp, verified: false },
    });

    if (!otpEntity) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if expired
    if (otpEntity.expiresAt < new Date()) {
      await this.otpRepository.delete({ id: otpEntity.id });
      throw new BadRequestException('OTP has expired');
    }

    // Mark OTP as verified
    otpEntity.verified = true;
    await this.otpRepository.save(otpEntity);

    // Delete the OTP after successful verification
    await this.otpRepository.delete({ id: otpEntity.id });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async verifyEmail(verifyOtpDto: VerifyOtpDto): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    const { email, otp } = verifyOtpDto;

    // Verify OTP first
    await this.verifyOtp(verifyOtpDto);

    // Find user and mark as verified
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isEmailVerified = true;
    await this.userRepository.save(user);

    // Generate token now that email is verified
    const token = this.generateToken(user);

    return {
      success: true,
      message: 'Email verified successfully. You can now log in.',
      token,
      user: this.sanitizeUser(user),
    };
  }

  async resendOtp(email: string): Promise<void> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Determine purpose based on verification status
    const purpose = user.isEmailVerified ? 'reset' : 'verify';

    // Generate and send new OTP
    await this.generateAndSendOtp(email, purpose);
  }

  async logout(userId: string) {
    // Simple logout - just invalidate the token on client side
    // No need to track sessions or require OTP on next login
    return { 
      success: true,
      message: 'Logged out successfully' 
    };
  }

  async loginWithOtp(verifyOtpDto: VerifyOtpDto) {
    // This endpoint is now only for special cases (e.g., suspicious activity)
    // Not used in normal flow
    await this.verifyOtp(verifyOtpDto);

    const user = await this.userRepository.findOne({
      where: { email: verifyOtpDto.email }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = this.generateToken(user);

    return {
      success: true,
      user: this.sanitizeUser(user),
      token,
      message: 'Login successful',
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists - but still return success
      console.log(`Forgot password attempt for non-existent email: ${email}`);
      return;
    }

    // Generate and send OTP for password reset
    await this.generateAndSendOtp(email, 'reset');
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, otp, newPassword } = resetPasswordDto;

    // Verify OTP
    await this.verifyOtp({ email, otp });

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { 
      success: true,
      message: 'Password reset successfully. You can now login with your new password.' 
    };
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }

  private async generateAvailableUsername(
    firstName: string,
    lastName: string,
  ): Promise<string> {
    let username = generateUniqueUsername(firstName, lastName);
    let attempts = 0;
    const maxAttempts = 10;

    // Keep trying until we find an available username
    while (attempts < maxAttempts) {
      const existing = await this.userRepository.findOne({
        where: { username },
      });

      if (!existing) {
        return username;
      }

      // Add random number and try again
      const random = Math.floor(Math.random() * 9999);
      username = `${generateUniqueUsername(firstName, lastName)}-${random}`;
      attempts++;
    }

    // Fallback: use timestamp
    return `${generateUniqueUsername(firstName, lastName)}-${Date.now()}`;
  }
}
