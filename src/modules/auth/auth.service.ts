import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '../config/';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nest-modules/mailer';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, EmailDto, ResetPassDto, SendMailDto } from './dto';
import { Provider } from './strategies/providers';
import crypto from 'crypto';
import uuid from 'uuid';
import moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    const user = await this.usersService.getOne({ email });
    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const isMatch = await this.usersService.loginAttempt(email, password);
    if (!isMatch) {
      throw new HttpException('INVALID_CREDENTIALS', HttpStatus.BAD_REQUEST);
    }

    const tokenId = await AuthService.makeTokenId();
    const payload = { sub: user.id, name: user.name, jti: tokenId, scope: 'profile' };

    return {
      access_token: this.jwtService.sign(payload, { header: { jti: tokenId } }),
      user,
    };
  }

  async registerUser(registerDto: RegisterDto): Promise<any> {
    const { username, email, password, password_confirmation } = registerDto;
    let user = null;

    if (password.trim() !== password_confirmation.trim()) {
      throw new HttpException('PASSWORD_CONFIRMATION_FAILED', HttpStatus.NOT_ACCEPTABLE);
    }

    user = await this.usersService.getOne({ name: username });
    if (user) {
      throw new HttpException('NOT_ACCEPTABLE_NAME', HttpStatus.NOT_ACCEPTABLE);
    }

    user = await this.usersService.getOne({ email });
    if (user !== null) {
      throw new HttpException('NOT_ACCEPTABLE_EMAIL', HttpStatus.NOT_ACCEPTABLE);
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
      message: 'REGISTRATION_SUCCESS',
    };
  }

  async getVerificationToken(tokenId: string): Promise<any> {
    const isVerified = await this.usersService.setVerified(tokenId);
    if (isVerified) {
      throw new HttpException('VERIFICATION_SUCCESS', HttpStatus.OK);
    } else {
      throw new HttpException('VERIFICATION_FAILED', HttpStatus.OK);
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
      message: 'VERIFICATION_SENT',
    };
  }

  async resetPassword(resetPassDto: ResetPassDto): Promise<any> {
    const { password_reset_token, password, password_confirmation } = resetPassDto;
    if (password.trim() !== password_confirmation.trim()) {
      throw new HttpException('PASSWORD_CONFIRMATION_FAILED', HttpStatus.NOT_ACCEPTABLE);
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
        throw new HttpException('RESET_PASSWORD_FAILED', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException('RESET_PASSWORD_SUCCESS', HttpStatus.OK);
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
      .update(uuid.v4())
      .digest('hex');
  }

  async validateOAuthLogin(thirdPartyId: string, provider: Provider): Promise<any> {
    try {
      // You can add some registration logic here,
      // to register the user using their thirdPartyId (in this case their googleId)
      // let user: IUser = await this.usersService.findOneByThirdPartyId(thirdPartyId, provider);

      // if (!user)
      // user = await this.usersService.registerOAuthUser(thirdPartyId, provider);

      const tokenId = await AuthService.makeTokenId();
      const payload = { sub: thirdPartyId, provider, jti: tokenId, scope: 'profile' };

      return {
        access_token: this.jwtService.sign(payload, {
          header: { jti: tokenId },
        }),
      };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
