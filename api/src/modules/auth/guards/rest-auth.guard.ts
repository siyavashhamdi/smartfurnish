import { AuthGuard } from "@nestjs/passport";
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { EXCEPTION_CONSTANT } from "../../../constants/exception.constant";

/**
 * JWT Authentication Guard for REST APIs
 * Extracts token from Authorization header and validates it
 */
@Injectable()
export class RestAuthGuard extends AuthGuard("jwt") {
  getRequest(context: ExecutionContext) {
    // For REST APIs, the request is directly in the context
    return context.switchToHttp().getRequest();
  }

  handleRequest<TUser>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      throw new UnauthorizedException(EXCEPTION_CONSTANT.UNAUTHENTICATED);
    }

    return user;
  }
}
