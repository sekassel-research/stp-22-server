import { WsResponse } from '@nestjs/websockets';
import { User } from '../auth/auth.interface';

export interface UserEvent extends WsResponse<Pick<User, 'id' | 'name'>> {
  event: 'online' | 'offline';
}
