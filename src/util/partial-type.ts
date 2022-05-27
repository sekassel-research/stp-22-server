import { Type } from '@nestjs/common';
import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { METADATA_FACTORY_NAME } from '@nestjs/swagger/dist/plugin/plugin-constants';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';
import { clonePluginMetadataFactory } from '@nestjs/swagger/dist/type-helpers/mapped-types.utils';
import { ValidateIf } from 'class-validator';

const modelPropertiesAccessor = new ModelPropertiesAccessor();

function applyPartialDecorator(prototype: any, key: string): void {
  ValidateIf((obj, value) => value !== undefined)(prototype, key);
}

// Copied from:
// https://github.com/nestjs/swagger/blob/548e1bf1d1804241ef1a89fca09b75543a52af04/lib/type-helpers/partial-type.helper.ts
export function PartialType<T>(classRef: Type<T>): Type<Partial<T>> {
  const fields = modelPropertiesAccessor.getModelProperties(classRef.prototype);

  abstract class PartialTypeClass {
    constructor() {
      inheritPropertyInitializers(this, classRef);
    }
  }

  inheritValidationMetadata(classRef, PartialTypeClass);
  inheritTransformationMetadata(classRef, PartialTypeClass);

  clonePluginMetadataFactory(
    PartialTypeClass as Type<unknown>,
    classRef.prototype,
    (metadata: Record<string, any>) => Object.fromEntries(Object.entries(metadata).map(([key, item]) => [key, {
      ...item,
      required: false,
    }])),
  );

  for (const key of fields) {
    const metadata = Reflect.getMetadata(
      DECORATORS.API_MODEL_PROPERTIES,
      classRef.prototype,
      key,
    ) || {};

    ApiProperty({
      ...metadata,
      required: false,
    })(PartialTypeClass.prototype, key);
    // changed from applyIsOptionalDecorator(PartialTypeClass, key)
    applyPartialDecorator(PartialTypeClass.prototype, key);
  }

  const metadataFactory = (PartialTypeClass as any)[METADATA_FACTORY_NAME];
  if (metadataFactory) {
    const pluginFields = Object.keys(metadataFactory());
    // changed from applyIsOptionalDecorator(PartialTypeClass, key)
    for (const key of pluginFields) {
      applyPartialDecorator(PartialTypeClass.prototype, key);
    }
  }

  return PartialTypeClass as Type<Partial<T>>;
}
