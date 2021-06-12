import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StateController } from './state.controller';
import { StateHandler } from './state.handler';
import { StateSchema } from './state.schema';
import { StateService } from './state.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'states',
        schema: StateSchema,
      },
    ]),
  ],
  providers: [StateService, StateHandler],
  controllers: [StateController],
})
export class StateModule {
}
