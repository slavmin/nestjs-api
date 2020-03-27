import { Model, PaginateModel, Types } from 'mongoose';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterDto, ServiceDto } from './dto/user.dto';
import { UpdateDto } from './dto/update.dto';
import { User } from './interfaces/user.interface';
import * as _ from 'lodash';
import bcrypt from 'bcrypt';
import moment from 'moment';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: PaginateModel<User>) {}

  private logger: Logger = new Logger('AuthService');

  private static sanitizeOutput(user: User) {
    return _.pick(user, [
      'id',
      'uuid',
      'name',
      'email',
      'role',
      'status',
      'email_verified',
      'blocked',
      'banned',
      'country',
      'language',
    ]);
  }

  async getAll(page: any): Promise<any> {
    page = parseInt(page, 10);
    page = page > 0 ? page : 1;
    const limit = 30;
    const res = await this.userModel.paginate({}, { page, limit });
    if (_.isEmpty(res.docs)) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return res;
  }

  async getOne(args: object): Promise<any | null> {
    const user = await this.userModel.findOne(args).exec();
    return user ? UsersService.sanitizeOutput(user) : null;
  }

  async getById(id: string): Promise<any | null> {
    // UsersService.isIdValid(id);
    const user = await this.userModel.findById(id).exec();
    return user ? UsersService.sanitizeOutput(user) : null;
  }

  async create(registerDto: RegisterDto) {
    const createdUser = new this.userModel(registerDto);
    try {
      await createdUser.save();
    } catch (error) {
      this.logger.log(error);
      throw new HttpException(error, HttpStatus.NOT_ACCEPTABLE);
    }
    return this.getById(createdUser._id);
  }

  async update(id: string, data: Partial<UpdateDto>) {
    // UsersService.isIdValid(id);
    try {
      const outData = _.pickBy(_.pick(data, ['country', 'language', 'password', 'password_reset_token']));
      if (!_.isEmpty(data.password)) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        outData.password = hashedPassword;
        outData.password_reset_token = null;
      } else {
        delete outData.password;
        outData.password_reset_token = null;
      }
      await this.userModel.updateOne({ _id: id }, outData);
      return await this.getById(id);
    } catch (error) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
  }

  async delete(id: string) {
    // UsersService.isIdValid(id);
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.n === 0) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
  }

  async getOneWithPassReset(args: object): Promise<any> {
    const user = await this.userModel.findOne(args).select(['password_reset_token', 'password_reset_expires']).exec();
    return user;
  }

  private static isIdValid(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return;
  }

  // AUTH SPECIFIC FUNCTIONS
  async loginAttempt(email: string, password: string): Promise<boolean> {
    const user = await this.userModel
      .findOne({ email })
      .select([
        'email',
        'verification_code',
        'email_verified',
        'login_attempts',
        'blocked',
        'block_expires',
        'banned',
        'ban_expires',
      ])
      .exec();

    if (!user) {
      return false;
    }

    const serviceData = {
      blocked: user.blocked,
      login_attempts: user.login_attempts,
      block_expires: user.block_expires,
      verification_code: user.verification_code,
      email_verified: user.email_verified,
      banned: user.banned,
      ban_expires: user.ban_expires,
    };

    const isMatch = await this.checkPassword(user.email, password, serviceData);

    if (!isMatch) {
      return false;
    }

    return true;
  }

  private async checkPassword(email: string, password: string, data: Partial<ServiceDto>): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).select(['password']).exec();

    const block = moment(data.block_expires).unix();
    const now = moment().unix();
    const blocktime = (block - now) * 1000;
    if (block - now > 0) {
      throw new HttpException(
        {
          error: 'BLOCKED_TEMPORARILY',
          message: 'TOO_MANY_LOGIN_ATTEMPTS',
          time: moment.utc(blocktime).format('HH:mm:ss'),
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (block - now <= 0 && data.blocked === true) {
      data.login_attempts = 0;
      data.blocked = false;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      data.login_attempts++;
      if (data.login_attempts >= 5) {
        data.block_expires = moment().add(30, 'm');
        data.blocked = true;
      }
      await this.userModel.updateOne({ _id: user._id }, data);
      return false;
    }

    data.login_attempts = 0;
    data.block_expires = moment().toISOString();
    data.blocked = false;
    await this.userModel.updateOne({ _id: user._id }, data);

    return true;
  }

  async setVerified(tokenId: string, verificationType: string): Promise<boolean> {
    const user = await this.userModel.findOne({ verification_code: tokenId }).exec();
    let data = {};

    if (verificationType === 'phone') {
      data = { verification_code: null, phone_verified: true };
    }

    if (verificationType === 'email') {
      data = { verification_code: null, email_verified: true };
    }

    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    await this.userModel.updateOne({ _id: user._id }, data);
    return true;
  }

  async makeServiceToken(email: string, token: string, tokenType: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    switch (tokenType) {
      case 'resetPassword':
        const data = {
          password_reset_token: token,
          password_reset_expires: moment().add(3, 'h'),
        };
        await this.userModel.updateOne({ _id: user._id }, data);
        break;
      case 'verifyEmail':
        const isVerified = user.email_verified;
        if (isVerified) {
          throw new HttpException('ALLREADY_VERIFIED', HttpStatus.NOT_ACCEPTABLE);
        }
        await this.userModel.updateOne({ _id: user._id }, { verification_code: token });
        break;
      default:
        break;
    }
    return user;
  }
}
