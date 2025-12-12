import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BaseResponseTypeDTO } from '../utils';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(registerDto: RegisterDto): Promise<BaseResponseTypeDTO> {
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto): Promise<BaseResponseTypeDTO> {
    return this.usersService.validateUser(loginDto.email, loginDto.password);
  }
}

