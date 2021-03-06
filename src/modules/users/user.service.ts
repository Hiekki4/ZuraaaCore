import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DiscordBotService, DiscordUser } from 'src/extension-modules/discord/discord-bot.service'
import { updateDiscordData } from 'src/utils/discord-update-data'
import { AvatarService } from '../avatars/avatar.service'
import UserDto from './dtos/edit-user/user.dto'
import { User, UserDocument } from './schemas/User.schema'

@Injectable()
export class UserService {
  constructor (
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    private readonly discordService: DiscordBotService,
    private readonly avatarService: AvatarService
  ) { }

  async create (user: User): Promise<UserDocument> {
    const userCreated = new this.UserModel(user)
    return await userCreated.save()
  }

  async show (id: string): Promise<User | undefined> {
    const result = await this.UserModel.findById(id).exec()
    if (result === null) {
      return
    }
    return new User(await updateDiscordData(result, this.discordService, this.avatarService))
  }

  async login (user: DiscordUser): Promise<User> {
    const findUser = await this.UserModel.findById(user.id).exec()
    if (findUser !== null) {
      return new User(await updateDiscordData(findUser, user, this.avatarService))
    }

    const userData = new this.UserModel({
      _id: user.id
    })

    return new User(await updateDiscordData(userData, user, this.avatarService))
  }

  async update (user: UserDto, id: string): Promise<User | undefined> {
    const userDb = await this.UserModel.findById(id).exec()
    if (userDb === null) {
      return
    }
    const discordUserDb = await updateDiscordData(userDb, this.discordService, this.avatarService)
    if (discordUserDb === undefined) {
      return
    }
    discordUserDb.details.description = user.bio
    return new User(await discordUserDb.save())
  }

  async findById (id: string): Promise<User> {
    return new User(await this.UserModel.findById(id).exec())
  }
}
