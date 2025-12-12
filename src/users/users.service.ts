import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from '../schemas/user.schema';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
  ) {}

  async create(registerDto: { email: string; password: string; fullName: string; phone?: string }): Promise<BaseResponseTypeDTO> {
    const existingUser = await this.userModel.findOne({ email: registerDto.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = new this.userModel({
      ...registerDto,
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    const token = this.generateToken(user._id.toString(), user.email, user.role);

    // Send welcome email asynchronously (non-blocking)
    this.emailService.sendWelcomeEmail({
      userName: user.fullName || 'Valued Customer',
      userEmail: user.email,
    }).catch((error) => {
      // Log error but don't fail registration
      console.error('Failed to send welcome email:', error);
    });

    return {
      success: true,
      code: HttpStatus.CREATED,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
        },
        token,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<BaseResponseTypeDTO> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          profilePicture: user.profilePicture,
        },
        token,
      },
    };
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, updateData: Partial<User>): Promise<BaseResponseTypeDTO> {
    if (updateData.email) {
      const existing = await this.userModel.findOne({ email: updateData.email.toLowerCase().trim() });
      if (existing && existing._id.toString() !== id.toString()) {
        throw new ConflictException('Email already exists');
      }
      updateData.email = updateData.email.toLowerCase().trim();
    }

    const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Profile updated successfully',
      data: user,
    };
  }

  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<BaseResponseTypeDTO> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Password changed successfully',
    };
  }

  private generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  }
}

