# Goals & Media Modules – Integration Guide

## 1) Install dependencies
- If you plan to use S3 uploads:
```
yarn add @aws-sdk/client-s3
```
(Multer comes with `@nestjs/platform-express`.)

## 2) Import modules in `app.module.ts`
```ts
import { GoalsModule } from './modules/goals/goals.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    // ...
    GoalsModule,
    MediaModule,
  ],
})
export class AppModule {}
```

## 3) Environment variables for S3
```
S3_ENABLED=true
AWS_REGION=ap-south-1
S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
# Optional CDN base (otherwise default S3 URL is used)
S3_PUBLIC_URL_BASE=https://cdn.yourdomain.com
```

If `S3_ENABLED` is not `true` or credentials are missing, files are saved locally to `./uploads/<flattened-key>` and the API returns `/uploads/<file>` path. You may want to serve static /uploads yourself via Nest or a reverse proxy.

## 4) Swagger
- Media endpoint is documented as multipart upload.
- Goals GET/PUT endpoints documented with DTOs.

## 5) Endpoints
- `GET /api/goals` — fetch goals for current user
- `PUT /api/goals` — replace/update goals array
- `POST /api/media/upload` — upload file (multipart), returns `{ url, mimeType, size, key }`

## 6) Auth
These controllers expect a `JwtAuthGuard` and a `@CurrentUser()` decorator yielding `user.userId`.
Adjust import paths if your project structure differs.
