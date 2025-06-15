# Database Seeds

This directory contains seed files for populating the database with initial data.

## Available Seeds

### Listening Ports
- **File**: `listening-port.seed.ts`
- **Description**: Creates common listening port configurations
- **Data**: 
  - HTTP Default (80)
  - HTTPS Default (443)
  - HTTP Development (8080)
  - HTTPS Development (8443)
  - HTTP Alternative (3000)
  - HTTPS Alternative (3443)
  - HTTP Staging (9080)
  - HTTPS Staging (9443)

## Running Seeds

### Run all seeds:
```bash
npm run seed
```

### Run seeds in development:
```bash
npm run seed
```

## Seed Features

- **Idempotent**: Seeds check if data already exists before inserting
- **Safe**: Won't duplicate data if run multiple times
- **Comprehensive**: Covers common use cases for nginx configurations

## Adding New Seeds

1. Create a new seed file: `src/seeds/your-entity.seed.ts`
2. Follow the pattern from `listening-port.seed.ts`
3. Add your seeder to `seeder.service.ts`
4. Import your seeder in `seeder.module.ts`

Example seed structure:
```typescript
@Injectable()
export class YourEntitySeeder {
  constructor(
    @InjectRepository(YourEntity)
    private readonly repository: Repository<YourEntity>,
  ) {}

  async seed(): Promise<void> {
    const existing = await this.repository.count();
    if (existing > 0) {
      console.log('YourEntity already exists, skipping seed...');
      return;
    }

    // Your seed data here
    const seedData = [
      // ... your data
    ];

    for (const data of seedData) {
      const entity = this.repository.create(data);
      await this.repository.save(entity);
    }
  }
}
```