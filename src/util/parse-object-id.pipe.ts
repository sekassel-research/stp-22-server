import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'bson';
import { isMongoId } from 'class-validator';

export class ParseObjectIdPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string | ObjectId {
    if (!isMongoId(value)) {
      throw new BadRequestException(`Invalid Object ID '${value}' for parameter '${metadata.data}'`);
    }
    if (metadata.metatype === ObjectId) {
      return new ObjectId(value);
    }
    return value;
  }
}
