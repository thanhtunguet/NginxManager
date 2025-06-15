FROM rust:1.70 as builder

WORKDIR /app

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies
RUN cargo build --release

# Remove dummy main.rs and copy actual source code
RUN rm src/main.rs
COPY src ./src

# Build the application
RUN cargo build --release

# Runtime stage
FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    nginx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/target/release/nginx-manager-backend /app/nginx-manager-backend

# Create directories for configs and certificates
RUN mkdir -p /app/configs /app/certificates /app/templates

# Copy templates
COPY templates ./templates

# Copy migrations
COPY migrations ./migrations

EXPOSE 3000

CMD ["./nginx-manager-backend"] 