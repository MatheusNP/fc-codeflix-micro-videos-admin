import { Module } from '@nestjs/common';
import { CastMembersModule } from './nest-modules/cast-members-module/cast-members.module';
import { CategoriesModule } from './nest-modules/categories-module/categories.module';
import { ConfigModule } from './nest-modules/config-module/config.module';
import { DatabaseModule } from './nest-modules/database-module/database.module';
import { EventModule } from './nest-modules/event-module/event.module';
import { GenresModule } from './nest-modules/genres-module/genres.module';
import { RabbitmqModule } from './nest-modules/rabbitmq-module/rabbitmq.module';
import { SharedModule } from './nest-modules/shared-module/shared.module';
import { UseCaseModule } from './nest-modules/use-case-module/app.module';
import { VideosModule } from './nest-modules/videos-module/videos.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    SharedModule,
    EventModule,
    UseCaseModule,
    RabbitmqModule.forRoot(),
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    VideosModule,
  ],
})
export class AppModule {}
