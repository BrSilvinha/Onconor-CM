# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Backend (Node.js/Express)
```bash
cd backend
npm run dev          # Development server with nodemon
npm start           # Production server
npm test            # Jest testing
npm run test:watch  # Jest in watch mode
npm run lint        # ESLint checking
npm run lint:fix    # Auto-fix linting issues
```

### Frontend (React + Vite)
```bash
cd frontend
npm run dev         # Development server with HMR
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # ESLint checking
```

### Database Operations
```bash
# Standard Sequelize commands
npm run db:migrate        # Run migrations
npm run db:seed          # Run seeders
npm run db:reset         # Reset and reseed database

# Custom sync utilities (development only)
npm run sync:check       # Check sync configuration
npm run sync:safe        # Safe sync (preserves data)
npm run sync:alter       # Modify table structure
npm run sync:reset       # Reset all tables (destroys data)
```

## Architecture Overview

### Project Structure
- **Full-stack application**: Separate backend and frontend
- **Backend**: Node.js/Express with MySQL/Sequelize
- **Frontend**: React 19 with Vite (currently minimal setup)
- **Database**: MySQL with Sequelize ORM

### Backend Architecture (Dual Structure)
The backend currently has two architectural approaches:

1. **Modern Structure** (`src/` directory):
   - Clean Sequelize models with proper associations
   - Environment-based configuration
   - Advanced sync utilities with safety features
   - Proper database connection pooling

2. **Legacy Structure** (root-level directories):
   - `auth/`, `users/`, `dashboard/` modules
   - Different model definitions
   - Some stored procedure usage

### Team Development Structure
- **Team 1**: Users & Authentication (User, Patient, Doctor, Specialty models)
- **Team 2**: Appointments & Scheduling (Appointment, Schedule, Availability models)
- **Team 3**: Medical Records & Billing (MedicalRecord, Treatment, Prescription, Invoice, Payment, Report models)

## Key Technologies

### Backend Stack
- **Framework**: Express.js with comprehensive middleware
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with refresh tokens
- **Security**: bcrypt, Helmet, CORS, rate limiting
- **Validation**: Joi + express-validator
- **File Upload**: Multer
- **Email**: Nodemailer
- **Testing**: Jest + Supertest

### Frontend Stack
- **Framework**: React 19 with Vite
- **Planned**: Tailwind CSS (not yet implemented)
- **State Management**: Context API (planned)
- **Routing**: React Router (planned)

## Database Configuration

### Environment Setup
- Copy `backend/.env.example` to `backend/.env`
- Supports Railway (cloud) and local MySQL configurations
- Database connection includes pooling and SSL support
- Timezone configured for Peru (UTC-5)

### Sequelize Sync System
**Critical**: The project uses a custom sync system with safety features:

- **SAFE mode** (`SEQUELIZE_FORCE_SYNC=false, SEQUELIZE_ALTER_SYNC=false`): Preserves existing data
- **ALTER mode** (`SEQUELIZE_ALTER_SYNC=true`): Modifies table structure for model changes
- **RESET mode** (`SEQUELIZE_FORCE_SYNC=true`): Destroys all data and recreates tables

**Always use SAFE mode for normal development**. Check `backend/SEQUELIZE_SYNC_GUIDE.md` for detailed instructions.

## Security Considerations

### Authentication System
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (configurable rounds)
- Rate limiting per IP and user
- CORS configuration for frontend communication

### Data Protection
- Input validation on all endpoints
- File upload restrictions (size and type)
- Comprehensive error handling
- Environment-based security configuration

## Development Workflow

### Before Starting Work
1. Always run `npm run sync:check` to verify database configuration
2. Use `npm run sync:safe` for safe database sync
3. Check current git branch and status
4. Verify environment variables are properly set

### When Making Model Changes
1. Modify the model in `backend/src/models/`
2. Use `npm run sync:alter` to update table structure
3. Test changes thoroughly
4. Return to `npm run sync:safe` mode for continued development

### Code Quality
- Run `npm run lint` before committing
- Use `npm run test` to verify functionality
- Follow existing code patterns and naming conventions
- Check both backend and frontend lint rules

## Common Issues and Solutions

### Database Connection Issues
- Verify `.env` file exists and has correct database credentials
- Check if using Railway (cloud) or local MySQL
- Run `npm run sync:check` to diagnose configuration

### Model Synchronization Problems
- Use `npm run sync:reset` for complete reset (destroys data)
- Check `SEQUELIZE_SYNC_GUIDE.md` for detailed troubleshooting
- Verify model associations are properly defined

### Development Server Issues
- Backend runs on port 3001 by default
- Frontend runs on port 3000 by default (not yet configured)
- Check for port conflicts and update CORS configuration

## Important File Locations

### Configuration Files
- `backend/.env.example` - Comprehensive environment template
- `backend/src/config/db.js` - Database configuration
- `backend/src/utils/sequelize-sync.js` - Custom sync utilities

### Models and Database
- `backend/src/models/` - Modern Sequelize models
- `backend/src/utils/` - Database utilities and helpers
- `backend/SEQUELIZE_SYNC_GUIDE.md` - Detailed sync documentation

### Documentation
- `README.md` - Comprehensive project documentation
- `Distribución por Equipos - Modelos y Funcionalidades.md` - Team responsibilities

## Production Considerations

### Database Management
- **Never use auto-sync in production** (`SEQUELIZE_AUTO_SYNC=false`)
- Use proper migrations instead of sync utilities
- Implement proper backup strategies
- Monitor database connections and performance

### Security Hardening
- Ensure JWT secrets are properly randomized
- Configure proper CORS origins
- Implement proper logging and monitoring
- Review and update security headers

### Deployment
- Use environment-specific configuration files
- Implement proper CI/CD pipeline
- Configure proper database connections for production
- Test migration scripts thoroughly before deployment