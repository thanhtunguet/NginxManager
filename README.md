# NGINX Configuration Manager

A full-stack web application for managing NGINX configurations through a modern web interface. Built with Rust (Axum) backend and React (TypeScript) frontend.

## Features

- **Upstream Management**: Create and manage upstream servers for load balancing
- **Server Block Configuration**: Configure NGINX server blocks with domains and SSL
- **Certificate Management**: Upload and manage SSL/TLS certificates with expiration monitoring
- **Domain Management**: Manage domain names and their mappings to servers
- **Configuration Generation**: Automatically generate valid NGINX configuration files
- **Health Monitoring**: Monitor upstream server health and NGINX status
- **Version Control**: Track configuration changes with rollback capabilities
- **Access Control**: IP-based access control rules for servers and locations

## Technology Stack

### Backend
- **Rust** with **Axum** web framework
- **SQLx** for database operations
- **MySQL** database
- **Tera** template engine for NGINX configuration generation
- **JWT** for authentication

### Frontend
- **React** with **TypeScript**
- **Ant Design** for UI components
- **React Query** for state management
- **React Router** for navigation
- **Vite** for build tooling

### Infrastructure
- **Docker** for containerization
- **Docker Compose** for orchestration
- **NGINX** for reverse proxy and serving

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Rust 1.70+ (for local development)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd nginx-manager
```

2. Start all services:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database: localhost:3306

### Local Development

1. **Backend Setup**:
```bash
cd backend
cargo install sqlx-cli
cargo build
```

2. **Database Setup**:
```bash
# Start MySQL (using Docker)
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=nginx_manager \
  -e MYSQL_USER=nginx_user \
  -e MYSQL_PASSWORD=nginx_password \
  -p 3306:3306 \
  mysql:8.0

# Run migrations
sqlx migrate run
```

3. **Frontend Setup**:
```bash
cd frontend
npm install
npm run dev
```

4. **Environment Variables**:
Create `.env` files in both `backend/` and `frontend/` directories:

Backend `.env`:
```env
DATABASE_URL=mysql://nginx_user:nginx_password@localhost:3306/nginx_manager
JWT_SECRET=your-super-secret-jwt-key-change-in-production
RUST_LOG=info
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Project Structure

```
nginx-manager/
├── backend/                 # Rust backend
│   ├── src/
│   │   ├── handlers/        # HTTP request handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   ├── config/          # Configuration management
│   │   └── main.rs
│   ├── migrations/          # Database migrations
│   ├── templates/           # NGINX configuration templates
│   ├── Cargo.toml
│   └── Dockerfile
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── configs/                 # Generated NGINX configurations
├── certificates/            # SSL certificates
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Upstreams
- `GET /api/v1/upstreams` - List all upstreams
- `POST /api/v1/upstreams` - Create new upstream
- `GET /api/v1/upstreams/{id}` - Get upstream by ID
- `PUT /api/v1/upstreams/{id}` - Update upstream
- `DELETE /api/v1/upstreams/{id}` - Delete upstream

### Servers
- `GET /api/v1/servers` - List all servers
- `POST /api/v1/servers` - Create new server
- `GET /api/v1/servers/{id}` - Get server by ID
- `PUT /api/v1/servers/{id}` - Update server
- `DELETE /api/v1/servers/{id}` - Delete server

### Domains
- `GET /api/v1/domains` - List all domains
- `POST /api/v1/domains` - Create new domain
- `GET /api/v1/domains/{id}` - Get domain by ID
- `PUT /api/v1/domains/{id}` - Update domain
- `DELETE /api/v1/domains/{id}` - Delete domain

### Certificates
- `GET /api/v1/certificates` - List all certificates
- `POST /api/v1/certificates` - Create new certificate
- `GET /api/v1/certificates/{id}` - Get certificate by ID
- `PUT /api/v1/certificates/{id}` - Update certificate
- `DELETE /api/v1/certificates/{id}` - Delete certificate

## Configuration Generation

The application generates NGINX configuration files based on the database entities:

1. **Upstream Blocks**: Generated from `Upstream` entities
2. **Server Blocks**: Generated from `HttpServer` entities with associated domains
3. **Location Blocks**: Generated from `Location` entities
4. **SSL Configuration**: Generated from `Certificate` entities

Generated configurations are stored in the `configs/` directory and can be included in the main NGINX configuration.

## Development

### Running Tests
```bash
# Backend tests
cd backend
cargo test

# Frontend tests
cd frontend
npm test
```

### Code Formatting
```bash
# Backend
cd backend
cargo fmt

# Frontend
cd frontend
npm run lint
```

### Database Migrations
```bash
cd backend
sqlx migrate add <migration_name>
sqlx migrate run
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team. 