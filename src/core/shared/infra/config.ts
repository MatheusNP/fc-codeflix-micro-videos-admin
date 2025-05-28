import { config as readEnv } from 'dotenv';
import path from 'path';

export class Config {
  static env: any = null;

  static db() {
    Config.readEnv();

    return {
      dialect: 'sqlite' as any,
      host: Config.env.DB_HOST,
      logging: Config.env.DB_LOGGING === 'true',
    };
  }

  static bucketName() {
    Config.readEnv();

    return Config.env.GOOGLE_CLOUD_STORAGE_BUCKET_NAME;
  }

  static googleCredentials() {
    Config.readEnv();

    return JSON.parse(Config.env.GOOGLE_CLOUD_CREDENTIALS);
  }

  static readEnv() {
    if (Config.env) {
      return;
    }

    const envPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'envs',
      `.env.${process.env.NODE_ENV}`,
    );
    const { parsed } = readEnv({
      path: envPath,
    });

    Config.env = {
      ...parsed,
      ...process.env,
    };
  }
}
