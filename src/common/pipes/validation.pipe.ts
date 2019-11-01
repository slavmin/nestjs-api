import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform, Type } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
// import { map } from 'rxjs/operators';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    const mapErrors = errors.map(error => {
      const { property, value, constraints } = error;
      return { property, value, rule: Object.keys(constraints).toString() };
    });
    if (errors.length > 0) {
      throw new BadRequestException({
        error: 'VALIDATION_FAILED',
        message: 'VALIDATION_FAILED',
        errors: mapErrors,
      });
    }
    return value;
  }

  private toValidate(metatype: Type<any>): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find(type => metatype === type);
  }
}
