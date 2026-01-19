# Deployment Guide for Vercel

## Prerequisites
- A Vercel account (https://vercel.com)
- A PostgreSQL database (Neon, Supabase, or other provider)
- Git repository with your code

## Step 1: Prepare Your Database

1. **Get your DATABASE_URL** from your PostgreSQL provider:
   - Neon: https://console.neon.tech/
   - Supabase: https://supabase.com/dashboard
   - Heroku Postgres: https://dashboard.heroku.com/

2. **Database URL format:**
   ```
   postgresql://username:password@host:5432/database?sslmode=require
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Import Project:**
   - Go to https://vercel.com/new
   - Import your Git repository (GitHub, GitLab, or Bitbucket)
   - Select the repository with your B2B application

2. **Configure Environment Variables:**
   Add these required environment variables in the Vercel dashboard:
   
   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your-secure-random-jwt-secret-key
   CSRF_SECRET=your-secure-random-csrf-secret-key
   NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
   ```

3. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add CSRF_SECRET
   vercel env add NEXT_PUBLIC_APP_URL
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

## Step 3: Run Database Migrations

After your first deployment, you need to run migrations:

1. **Option A: Use Vercel CLI**
   ```bash
   # Set DATABASE_URL in your local .env
   npm run db:push
   ```

2. **Option B: Use Prisma Data Platform**
   - Install Prisma CLI: `npm i -g prisma`
   - Run: `prisma db push`

3. **Option C: Direct SQL Connection**
   - Connect to your database using a SQL client
   - Run the migration files manually from `prisma/migrations/`

## Step 4: Seed the Database (Optional)

If you need to create an initial admin user:

1. **Connect to your production database:**
   ```bash
   # In your local environment with production DATABASE_URL
   npm run db:seed
   ```

2. **Or create an admin user manually via SQL:**
   ```sql
   INSERT INTO users (id, full_name, email, password_hash, role, status)
   VALUES (
     'admin-user-id',
     'Admin User',
     'admin@example.com',
     '$2a$10$hashed_password_here',
     'ADMIN',
     'ACTIVE'
   );
   ```

## Step 5: Verify Deployment

1. **Check Build Status:**
   - Visit your Vercel dashboard
   - Verify the deployment is successful (green checkmark)

2. **Test the Application:**
   - Visit your deployed URL: `https://your-project.vercel.app`
   - Try logging in
   - Check if API endpoints work

3. **Check Logs:**
   - In Vercel dashboard, go to your project
   - Click on "Functions" tab to see API logs
   - Check for any errors

## Troubleshooting

### Build Error: "Failed to collect page data"

**Symptoms:** Build fails with error about collecting page data for API routes.

**Solutions:**
1. Ensure `postinstall` script is in package.json:
   ```json
   "postinstall": "prisma generate"
   ```

2. Ensure `build` script includes Prisma generation:
   ```json
   "build": "prisma generate && next build"
   ```

3. Check that DATABASE_URL is set in Vercel environment variables

### Runtime Error: "PrismaClient is not defined"

**Solutions:**
1. Run `prisma generate` locally
2. Ensure `@prisma/client` is in `dependencies` (not devDependencies)
3. Clear Vercel build cache and redeploy

### Database Connection Errors

**Solutions:**
1. Verify DATABASE_URL is correct and includes `?sslmode=require`
2. Check if your database allows connections from Vercel's IP ranges
3. Ensure database is publicly accessible (or use Vercel's database integration)

### Environment Variable Issues

**Solutions:**
1. Ensure all environment variables are set in Vercel dashboard
2. For public variables, use `NEXT_PUBLIC_` prefix
3. Redeploy after adding/changing environment variables

## Post-Deployment Checklist

- [ ] Database URL is configured
- [ ] JWT_SECRET is set to a secure random value
- [ ] CSRF_SECRET is set to a secure random value
- [ ] Database migrations are applied
- [ ] Initial admin user is created
- [ ] Application loads without errors
- [ ] Login functionality works
- [ ] API endpoints respond correctly
- [ ] File uploads work (if applicable)

## Updating Your Deployment

To deploy updates:

```bash
# Push changes to your Git repository
git add .
git commit -m "Your changes"
git push origin main

# Vercel will automatically rebuild and deploy
```

Or manually trigger deployment:
```bash
vercel --prod
```

## Security Recommendations

1. **Use Strong Secrets:**
   ```bash
   # Generate secure secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Enable Database SSL:**
   - Always use `sslmode=require` in DATABASE_URL

3. **Regular Updates:**
   - Keep dependencies updated
   - Monitor security advisories

4. **Environment Variables:**
   - Never commit `.env` files
   - Use different secrets for development and production

## Support

For issues specific to:
- **Vercel:** https://vercel.com/support
- **Prisma:** https://www.prisma.io/docs
- **Next.js:** https://nextjs.org/docs

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
