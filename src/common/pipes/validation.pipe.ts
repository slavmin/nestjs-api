import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform, Type } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(val: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return val;
    }
    const object = plainToClass(metatype, val);
    const errors = await validate(object);
    const mapErrors = errors.map(error => {
      const { property, value, constraints } = error;
      return {
        property,
        message: Object.values(constraints).toString(),
        // rule: Object.keys(constraints).toString(),
        // constraints,
      };
    });
    if (errors.length > 0) {
      throw new BadRequestException({
        error: 'VALIDATION_FAILED',
        message: 'VALIDATION_FAILED',
        errors: mapErrors,
      });
    }
    return val;
  }

  private toValidate(metatype: Type<any>): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find(type => metatype === type);
  }
}
