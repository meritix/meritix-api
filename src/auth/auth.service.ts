import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  register(registerDto: RegisterDto) {
    return {
      message: 'Registration request received successfully.',
      data: registerDto,
    };
  }
}