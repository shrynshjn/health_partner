import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MediaModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [MongooseModule, UserService],
})
export class UserModule {}
