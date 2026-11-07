import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../../common/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  // A valid signature alone is no longer enough. The token used to be trusted
  // for its full 7 days regardless of what happened to the account: a deleted
  // user, a demoted admin, or a stolen session after the owner changed their
  // password all kept working. The user is now looked up on each request (one
  // indexed read) so the role is always current and old sessions can be revoked.
  async validate(payload: any) {
    let user: any;
    try {
      user = await this.userModel
        .findById(payload.sub)
        .select('email role isVerified passwordChangedAt')
        .lean();
    } catch {
      throw new UnauthorizedException();
    }
    if (!user || !user.isVerified) throw new UnauthorizedException();

    if (user.passwordChangedAt) {
      const changedAtSeconds = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
      if (typeof payload.iat !== 'number' || payload.iat < changedAtSeconds) {
        throw new UnauthorizedException('Your session has expired — please log in again.');
      }
    }

    return { userId: String(user._id), email: user.email, role: user.role };
  }
}
