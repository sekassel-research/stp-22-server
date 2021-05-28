import { WsResponse } from '@nestjs/websockets';
import { User } from './user.dto';

export interface UserEvent extends WsResponse<User> {
  event: 'online' | 'offline';
}
