import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { JwtPayload, RequestUserPayload } from './jwt.payload'
import { jwt } from '../../../config.json'
import { UserService } from '../users/user.service'
import _ from 'lodash'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor (private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.secret
    })
  }

  async validate (payload: JwtPayload): Promise<RequestUserPayload> {
    const user = await this.userService.findById(payload.sub)

    if (user === undefined || _.isEmpty(user)) {
      throw new HttpException('Token data is invalid.', HttpStatus.BAD_REQUEST)
    }
    const validated: RequestUserPayload = {
      userId: payload.sub,
      role: payload.role
    }
    return validated
  }
}
