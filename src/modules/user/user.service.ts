import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MediaService } from '../media/media.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mediaService: MediaService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(new Types.ObjectId(userId)).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { $set: dto },
      { new: true },
    ).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async uploadProfilePhoto(userId: string, file: Express.Multer.File) {
    const { url } = await this.mediaService.uploadToKey(file, `profiles/${userId}.jpg`);
    const user = await this.userModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { $set: { photo_url: url } },
      { new: true },
    ).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return { photo_url: url };
  }
}
