import { PipeTransform, Injectable, ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ValidateObjectId implements PipeTransform<string> {
  async transform(value: string, metadata: ArgumentMetadata) {
    const isValid = await Types.ObjectId.isValid(value);
    if (!isValid) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return value;
  }
}
