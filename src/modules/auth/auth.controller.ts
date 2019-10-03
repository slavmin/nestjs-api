import {
  Controller,
  Request,
  Post,
  Body,
  Get,
  UseGuards,
  Param,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './../auth/auth.service';
import { UsersService } from './../users/users.service';
import { RegisterDto, LoginDto, EmailDto, ResetPassDto } from './../auth/dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './../../common/guards/roles.guard';
import { Roles } from './../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RefreshToken } from '../../common/decorators/refresh-token.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {}

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

  @UseGuards(AuthGuard('jwt'))
  @Post('signout')
  @HttpCode(204)
  async logout(@Request() req: any): Promise<any> {
    return await this.authService.logoutUser(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'member')
  @Get('profile')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Get('token/refresh')
  async refreshToken(@RefreshToken() data: any): Promise<any> {
    const user = await this.usersService.getById(data.user.id);
    if (user && !user.blocked) {
      const { accessToken, refreshToken, expiresIn } = await this.authService.generateToken(user);
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
        user,
      };
    }

    throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  @Post('verify/resend')
  async getVerifyToken(@Body() emailDto: EmailDto) {
    return await this.authService.sendVerificationToken(emailDto);
  }

  @Post('verify/:token')
  async setVerify(@Param('token') tokenId: string, @Body() body: any) {
    const verificationType = body.type ? body.type : 'email';
    return await this.authService.getVerificationToken(tokenId, verificationType);
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
