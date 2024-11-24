import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './common/config/db/typeORM.config';
import { join } from 'path';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlayersModule } from './modules/players/players.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    PlayersModule,
    UserModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'), // Serve the public folder
      serveRoot: '/api/v1/public',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
