import { Module } from '@nestjs/common';
import { GroupModule } from '../group/group.module';
import { MemberModule } from '../member/member.module';
import { MemberResolverService } from './member-resolver.service';

@Module({
  imports: [
    GroupModule,
    MemberModule,
  ],
  providers: [MemberResolverService],
  exports: [MemberResolverService],
})
export class MemberResolverModule {
}
