# Physical & Health Modules Integration

1. Copy `src/modules/physical` and `src/modules/health` into your NestJS project.
2. Register in `app.module.ts`:
```ts
import { PhysicalModule } from './modules/physical/physical.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // ...
    PhysicalModule,
    HealthModule,
  ],
})
export class AppModule {}
```
3. Ensure your common auth utilities exist at:
   - `src/common/guards/jwt-auth.guard.ts`
   - `src/common/decorators/user.decorator.ts`
   If your paths differ, adjust the imports in the controllers.

4. Start dev server: `yarn start:dev`
5. Swagger: check `/api-docs` for new endpoints under **physical** and **health**.
