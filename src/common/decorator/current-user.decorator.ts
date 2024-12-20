import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ICurrentUser } from 'src/modules/user/interfaces/user.interface';

export const CurrentUser = createParamDecorator(
  (data: never, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.currentUser;
  },
);
