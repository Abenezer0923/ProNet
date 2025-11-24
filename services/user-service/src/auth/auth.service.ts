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
      });

      console.log('Saving user to database...');
      await this.userRepository.save(user);
      console.log('User saved successfully');

      // Generate token
      const token = this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token,
      };
    } catch (error) {
      console.error('Registration error:', error);
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

    // Check if user needs OTP verification (logged out previously)
    const session = await this.loginSessionRepository.findOne({
      where: { userId: user.id },
    });

    if (session && session.requiresOtp) {
      // Generate and send OTP
      await this.generateAndSendOtp(email);

      return {
        requiresOtp: true,
        email: user.email,
        message: 'OTP sent to your email',
      };
    }

    // Create or update session
    await this.updateLoginSession(user.id, email, false);

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
      requiresOtp: false,
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
        });
        await this.userRepository.save(user);
        isNewUser = true;
        console.log('New user created successfully');
      } else {
        console.log('Existing user found');
      }

      // Try to generate OTP - if it fails, allow login without OTP
      let requiresVerification = false;
      let otpCode = '';
      try {
        console.log('Generating OTP for Google authentication');
        otpCode = await this.generateAndSendOtp(email);
        requiresVerification = true;
        console.log('OTP generated successfully');
      } catch (otpError) {
        console.error('OTP generation failed (table may not exist yet):', otpError);
        console.log('Allowing login without OTP verification');
        requiresVerification = false;
      }

      // If OTP verification is required, don't generate token yet
      if (requiresVerification) {
        return {
          user: this.sanitizeUser(user),
          token: null,
          requiresVerification: true,
          isNewUser,
          otpCode, // Include OTP for demo purposes
        };
      }

      // No OTP required - generate token and allow login
      const token = this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token,
        requiresVerification: false,
        isNewUser,
      };
    } catch (error) {
      console.error('Google login error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async generateAndSendOtp(email: string): Promise<string> {
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

    // Log OTP immediately for console fallback
    console.log(`📧 OTP for ${email}: ${otp}`);
    console.log(`⏰ OTP expires at: ${expiresAt}`);

    // Send OTP via email asynchronously (don't wait for it)
    this.emailService.sendOtpEmail(email, otp)
      .then(() => {
        console.log(`✅ OTP email sent successfully to ${email}`);
      })
      .catch((error) => {
        console.error(`⚠️  Failed to send email to ${email}:`, error.message);
      });

    // Return OTP for demo purposes
    return otp;
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

  async resendOtp(email: string): Promise<{ message: string; otpCode: string }> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate and send new OTP
    const otpCode = await this.generateAndSendOtp(email);

    return {
      message: 'OTP sent successfully',
      otpCode, // Include OTP for demo purposes
    };
  }

  async logout(userId: string) {
    // Mark session as requiring OTP on next login
    await this.updateLoginSession(userId, null, true);

    return { message: 'Logged out successfully' };
  }

  async loginWithOtp(verifyOtpDto: VerifyOtpDto) {
    // Verify OTP first
    await this.verifyOtp(verifyOtpDto);

    // Find user
    const user = await this.userRepository.findOne({
      where: { email: verifyOtpDto.email }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Create or update session - mark as not requiring OTP (until next logout)
    await this.updateLoginSession(user.id, user.email, false);

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  private async updateLoginSession(userId: string, email: string | null, requiresOtp: boolean) {
    let session = await this.loginSessionRepository.findOne({
      where: { userId },
    });

    if (session) {
      session.requiresOtp = requiresOtp;
      session.lastLoginAt = new Date();
      if (email) session.email = email;
    } else {
      session = this.loginSessionRepository.create({
        userId,
        email: email || '',
        requiresOtp,
        lastLoginAt: new Date(),
      });
    }

    await this.loginSessionRepository.save(session);
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
