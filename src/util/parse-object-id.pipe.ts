import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { isMongoId } from 'class-validator';

export class ParseObjectIdPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isMongoId(value)) {
      throw new BadRequestException(`Invalid Object ID '${value}' for parameter '${metadata.data}'`);
    }
    return value;
  }
}
