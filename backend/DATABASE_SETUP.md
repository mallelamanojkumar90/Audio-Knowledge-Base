# Database Setup Instructions

## Prerequisites

You need PostgreSQL installed on your system. If you don't have it installed:

### Windows Installation Options:

1. **Download PostgreSQL Installer** (Recommended)
   - Visit: https://www.postgresql.org/download/windows/
   - Download and run the installer
   - During installation, remember the password you set for the `postgres` user
   - Default port is 5432

2. **Using Chocolatey** (if you have it)
   ```powershell
   choco install postgresql
   ```

3. **Using Docker** (Alternative)
   ```powershell
   docker run --name postgres-audio-kb -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=audio_kb -p 5432:5432 -d postgres
   ```

## Setup Steps

### 1. Create the Database

After PostgreSQL is installed, open a terminal and run:

**Option A: Using psql command line** (if PostgreSQL is in your PATH):
```bash
psql -U postgres
```

Then in the psql prompt:
```sql
CREATE DATABASE audio_kb;
\q
```

**Option B: Using pgAdmin** (GUI tool that comes with PostgreSQL):
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name it `audio_kb`
5. Click "Save"

**Option C: Using SQL command directly** (if psql is in PATH):
```bash
psql -U postgres -c "CREATE DATABASE audio_kb;"
```

### 2. Configure .env File

Edit `backend/.env` and update the `DATABASE_URL`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/audio_kb
```

Replace:
- `username` with your PostgreSQL username (default: `postgres`)
- `password` with your PostgreSQL password
- `localhost:5432` if your PostgreSQL is on a different host/port
- `audio_kb` if you used a different database name

**Example:**
```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/audio_kb
```

### 3. Test Database Connection

Run the test script:
```bash
cd backend
npm run test-db
```

You should see:
```
✅ Database connection successful!
Current time: ...
PostgreSQL version: ...
```

### 4. Run Migrations

Once the connection test passes, run migrations to create the tables:
```bash
npm run migrate
```

You should see:
```
Running database migrations...
Running migration: 001_initial_schema.sql
Migration 001_initial_schema.sql completed
All migrations completed successfully
```

### 5. Verify Tables Created

Run the test script again to see the created tables:
```bash
npm run test-db
```

You should now see a list of tables:
```
📊 Existing tables:
  - audio_files
  - conversations
  - messages
  - migrations
  - transcripts
```

## Troubleshooting

### "psql: command not found"
- PostgreSQL is not in your PATH
- Add PostgreSQL bin directory to your PATH, or use pgAdmin instead

### "password authentication failed"
- Check your username and password in DATABASE_URL
- Try resetting the postgres user password

### "database does not exist"
- Make sure you created the database first (step 1)
- Check the database name in DATABASE_URL matches

### "connection refused" or "could not connect"
- Make sure PostgreSQL service is running
- On Windows: Check Services → PostgreSQL service is running
- Verify the port (default 5432) is correct

### Connection String Format
The DATABASE_URL format is:
```
postgresql://[user[:password]@][host][:port][/database]
```

Examples:
- Local with default port: `postgresql://postgres:mypass@localhost:5432/audio_kb`
- Different port: `postgresql://postgres:mypass@localhost:5433/audio_kb`
- Remote server: `postgresql://user:pass@example.com:5432/audio_kb`

## Next Steps

Once the database is set up and migrations are run, you can proceed with:
- Task 1.3: Basic Backend API Structure
- Testing the API endpoints
- Starting development

