import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { isMongoId } from 'class-validator';

export class ParseObjectIdPipe implements PipeTransform<string | undefined> {
  transform(value: string | undefined, metadata: ArgumentMetadata): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (!isMongoId(value)) {
      throw new BadRequestException(`Invalid Object ID '${value}' for parameter '${metadata.data}'`);
    }
    return value;
  }
}
