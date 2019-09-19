import { Controller, Request, Post, Body, Get, UseGuards, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './../auth/auth.service';
import { RegisterDto, LoginDto, EmailDto, ResetPassDto } from './../auth/dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './../../common/guards/roles.guard';
import { Roles } from './../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async login(@CurrentUser('id') userId: string, @Body() loginDto: LoginDto) {
    if (userId) {
      throw new HttpException('ALLREADY_LOGINED', HttpStatus.BAD_REQUEST);
    }
    return await this.authService.validateUser(loginDto);
  }

  @Post('signup')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.registerUser(registerDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'member')
  @Get('profile')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('verify/resend')
  async getVerifyToken(@Body() emailDto: EmailDto) {
    return await this.authService.sendVerificationToken(emailDto);
  }

  @Post('verify/:token')
  async setVerify(@Param('token') tokenId: string) {
    return await this.authService.getVerificationToken(tokenId);
  }

  @Post('password/mail')
  async getResetPassToken(@Body() emailDto: EmailDto) {
    return await this.authService.sendResetPassToken(emailDto);
  }

  @Post('password/reset')
  async resetPassword(@Body() resetPassDto: ResetPassDto) {
    return await this.authService.resetPassword(resetPassDto);
  }
}
