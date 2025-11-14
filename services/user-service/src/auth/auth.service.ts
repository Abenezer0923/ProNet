import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

      // Check if user exists
      let user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        // Create new user from Google profile
        user = this.userRepository.create({
          email,
          firstName,
          lastName,
          profilePicture: picture,
          password: '', // No password for OAuth users
        });
        await this.userRepository.save(user);
      }

      // Generate token
      const token = this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token,
      };
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
