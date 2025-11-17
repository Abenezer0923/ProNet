import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Otp } from './entities/otp.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    try {
      const { email, password, firstName, lastName, profession } = registerDto;

      console.log('Registration attempt for:', email);

      // Check if user exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        profession,
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

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
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
        // Create new user from Google profile
        user = this.userRepository.create({
          email,
          firstName,
          lastName,
          profilePicture: picture,
          password: '', // No password for OAuth users
        });
        await this.userRepository.save(user);
        isNewUser = true;
        console.log('New user created successfully');
      } else {
        console.log('Existing user found');
      }

      // Generate token
      const token = this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token,
        requiresVerification: false, // Disable OTP for now
        isNewUser,
      };
    } catch (error) {
      console.error('Google login error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async generateAndSendOtp(email: string): Promise<void> {
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

    // TODO: Send OTP via email service
    // For now, log it (in production, use a proper email service)
    console.log(`OTP for ${email}: ${otp}`);
    console.log(`OTP expires at: ${expiresAt}`);
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

    // Mark user as verified
    await this.userRepository.update(
      { email },
      { emailVerified: true },
    );

    // Delete the OTP after successful verification
    await this.otpRepository.delete({ id: otpEntity.id });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate and send new OTP
    await this.generateAndSendOtp(email);

    return {
      message: 'OTP sent successfully',
    };
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
