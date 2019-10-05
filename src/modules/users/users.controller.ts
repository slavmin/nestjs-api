import {
  Controller,
  Request,
  Response,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  UseFilters,
  UsePipes,
} from '@nestjs/common';
import { UpdateDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './../../common/decorators/roles.decorator';
import { ValidateObjectId } from './../../common/pipes/validate-object-id.pipe';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Get()
  async findAll(@Query('page') page?: number): Promise<User[]> {
    return this.usersService.getAll(page);
  }

  @Get(':id')
  async findOne(@Param('id', ValidateObjectId) userId: string) {
    const user = await this.usersService.getById(userId);
    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  // @Roles('admin')
  // @Post()
  // async create(@Body() registerDto: RegisterDto) {
  //   const res = await this.usersService.create(registerDto);
  //   return res;
  // }

  @Patch(':id')
  async update(@Param('id', ValidateObjectId) userId: string, @Body() data: UpdateDto, @Request() req: any) {
    if (userId !== req.user.id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const res = await this.usersService.update(req.user.id, data);
    return res;
  }

  // @Roles('admin')
  // @Delete(':id')
  // async destroy(@Param('id') userId: string) {
  //   await this.usersService.delete(userId);
  //   return null;
  // }
}
