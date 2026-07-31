import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { SubjectModule } from './subject/subject.module';
import { ChapterModule } from './chapter/chapter.module';
import { TopicModule } from './topic/topic.module';
import { QuestionModule } from './question/question.module';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    SubjectModule,
    ChapterModule,
    TopicModule,
    QuestionModule,
  ],
})
export class AppModule {}