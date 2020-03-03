import { Injectable, HttpException, HttpStatus, CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '../config/';
import { UsersService } from '../users/users.service';
import { User } from '../users/interfaces/user.interface';
// import { JwtService } from '@nestjs/jwt';
import { JwtAuthService } from './jwt/jwt-auth.service';
import { RegisterDto, LoginDto, EmailDto, ResetPassDto, SendMailDto } from './dto';
// import { Provider } from './strategies/providers';
import { MailerService } from '@nest-modules/mailer';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly mailerService: MailerService,
  ) {}

  private logger: Logger = new Logger('AuthService');

  async validateUser(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    const user: User = await this.usersService.getOne({ email });
    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const isMatch: boolean = await this.usersService.loginAttempt(email, password);
    if (!isMatch) {
      throw new HttpException('INVALID_CREDENTIALS', HttpStatus.NOT_ACCEPTABLE);
    }

    const { accessToken, refreshToken, expiresIn } = await this.jwtAuthService.generateToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      user,
    };
  }

  async registerUser(registerDto: RegisterDto): Promise<any> {
    const { username, email, password, password_confirmation } = registerDto;
    let user: User = null;
    const errors = [];
    let error: object = {};

    if (password.trim() !== password_confirmation.trim()) {
      error = { property: 'password_confirmation', message: 'PASSWORD_CONFIRMATION_FAILED' };
      errors.push(error);
    }

    user = await this.usersService.getOne({ name: username });
    if (user) {
      error = { property: 'username', message: 'NOT_ACCEPTABLE_NAME' };
      errors.push(error);
    }

    user = await this.usersService.getOne({ email });
    if (user) {
      error = { property: 'email', message: 'NOT_ACCEPTABLE_EMAIL' };
      errors.push(error);
    }

    if (errors.length > 0) {
      throw new HttpException(
        {
          error: 'VALIDATION_FAILED',
          message: 'VALIDATION_FAILED',
          errors,
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const verificationToken = await AuthService.makeTokenId();
    const userData = {
      name: username.trim(),
      email: email.trim(),
      password: password.trim(),
      verification_code: verificationToken,
    };
    user = await this.usersService.create(userData);

    const mailData = {
      name: username.trim(),
      email: email.trim(),
      token: verificationToken,
      subject: 'Validate your email',
      template: 'accountVerify',
      link: '/email/verify/',
    };

    this.sendEmail(mailData);

    return {
      statusCode: 201,
      message: 'REGISTRATION_SUCCESS',
    };
  }

  async logoutUser(userId: string): Promise<any> {
    const cacheClient = await this.cacheManager.store.getClient();
    await cacheClient.del(userId, (err: any) => {
      if (err) {
        this.logger.log(err);
        throw new HttpException('KEY_NOT_FOUND', HttpStatus.NOT_ACCEPTABLE);
      }
    });

    return {
      statusCode: 200,
      message: 'LOGOUT_SUCCESS',
    };
  }

  async getVerificationToken(tokenId: string, verificationType: string): Promise<any> {
    const isVerified = await this.usersService.setVerified(tokenId, verificationType);
    if (isVerified) {
      return {
        statusCode: 200,
        message: 'VERIFICATION_SUCCESS',
      };
    } else {
      throw new HttpException('VERIFICATION_FAILED', HttpStatus.BAD_REQUEST);
    }
  }

  async sendVerificationToken(emailDto: EmailDto): Promise<any> {
    const { email } = emailDto;
    const token = await AuthService.makeTokenId();
    const user = await this.usersService.makeServiceToken(email, token, 'verifyEmail');

    const mailData = {
      name: user.name,
      email: user.email,
      token,
      subject: 'Validate your email',
      template: 'accountVerify',
      link: '/email/verify/',
    };

    this.sendEmail(mailData);

    return {
      statusCode: 201,
      message: 'VERIFICATION_SENT',
    };
  }

  async resetPassword(resetPassDto: ResetPassDto): Promise<any> {
    const { password_reset_token, password, password_confirmation } = resetPassDto;
    const errors = [];
    let error: object = {};

    if (password.trim() !== password_confirmation.trim()) {
      error = { property: 'password_confirmation', message: 'PASSWORD_CONFIRMATION_FAILED' };
      errors.push(error);
      throw new HttpException(
        {
          error: 'VALIDATION_FAILED',
          message: 'VALIDATION_FAILED',
          errors,
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    let user = await this.usersService.getOneWithPassReset({
      password_reset_token,
    });

    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const expires = moment(user.password_reset_expires).unix();
    const now = moment().unix();
    if (expires - now > 0) {
      user = await this.usersService.update(user.id, {
        password,
        password_reset_token: null,
      });
      if (!user) {
        throw new HttpException('RESET_PASSWORD_FAILED', HttpStatus.UNPROCESSABLE_ENTITY);
      } else {
        return {
          statusCode: 201,
          message: 'RESET_PASSWORD_SUCCESS',
        };
      }
    } else {
      user = await this.usersService.update(user.id, {
        password_reset_token: null,
      });
      throw new HttpException('RESET_PASSWORD_EXPIRED', HttpStatus.NOT_ACCEPTABLE);
    }
  }

  async sendResetPassToken(emailDto: EmailDto): Promise<any> {
    const { email } = emailDto;
    const token = await AuthService.makeTokenId();
    const user = await this.usersService.makeServiceToken(email, token, 'resetPassword');

    const mailData = {
      name: user.name,
      email: user.email,
      token,
      subject: 'Reset your password',
      template: 'passwordReset',
      link: '/password/reset/',
    };

    this.sendEmail(mailData);

    return {
      statusCode: 201,
      message: 'RESET_TOKEN_SENT',
    };
  }

  private async sendEmail(payload: Partial<SendMailDto>): Promise<any> {
    const { subject, template, link, email, username, token } = payload;
    const serviceLink = this.configService.get('CLIENT_APP_URL') + link + token;
    await this.mailerService
      .sendMail({
        to: email,
        subject: subject + ' ✔',
        template,
        context: {
          title: this.configService.get('APP_NAME'),
          name: username,
          serviceLink,
          contactEmail: this.configService.get('APP_MAIL'),
        },
      })
      .catch(err => {
        throw new HttpException('MAIL_SENDER_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  static async makeTokenId(): Promise<string> {
    return crypto
      .createHash('sha256')
      .update(uuidv4())
      .digest('hex');
  }

  // async validateOAuthLogin(thirdPartyId: string, provider: Provider): Promise<any> {
  //   try {
  //     // You can add some registration logic here,
  //     // to register the user using their thirdPartyId (in this case their googleId)
  //     // let user: IUser = await this.usersService.findOneByThirdPartyId(thirdPartyId, provider);

  //     // if (!user)
  //     // user = await this.usersService.registerOAuthUser(thirdPartyId, provider);

  //     const tokenId = await AuthService.makeTokenId();
  //     const payload = { sub: thirdPartyId, provider, jti: tokenId, scope: 'profile' };

  //     return {
  //       access_token: this.jwtService.sign(payload, {
  //         header: { jti: tokenId },
  //       }),
  //     };
  //   } catch (err) {
  //     throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
  //   }
  // }
}
