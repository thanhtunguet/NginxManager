export interface Upstream {
  id: number;
  name: string;
  server: string;
  keepAlive: number;
  status: "active" | "inactive";
  healthCheckPath: string;
  healthCheckInterval: number;
  maxFails: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Domain {
  id: number;
  domain: string;
  createdAt?: string;
}

export interface Certificate {
  id: number;
  name: string;
  certificate: string;
  privateKey: string;
  expiredAt: string;
  issuer: string;
  autoRenew: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HttpServer {
  id: number;
  listeningPortId: number;
  name: string;
  additionalConfig: string;
  status: "active" | "inactive";
  accessLogPath: string;
  errorLogPath: string;
  logLevel: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  id: number;
  serverId: number;
  upstreamId: number;
  path: string;
  additionalConfig: string;
  clientMaxBodySize: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListeningPort {
  id: number;
  name: string;
  port: number;
  protocol: string;
  ssl: boolean;
  http2: boolean;
  createdAt?: string;
}

export interface ConfigVersion {
  id: number;
  serverId: number;
  config: string;
  createdAt: string;
  isActive: boolean;
}

export interface AccessRule {
  id: number;
  serverId?: number;
  locationId?: number;
  ipAddress: string;
  action: "allow" | "deny";
  description?: string;
  createdAt?: string;
}

// Request/Response types
export interface CreateUpstreamRequest {
  name: string;
  server: string;
  keepAlive: number;
  healthCheckPath: string;
  healthCheckInterval?: number;
  maxFails?: number;
}

export interface UpdateUpstreamRequest {
  name?: string;
  server?: string;
  keepAlive?: number;
  status?: "active" | "inactive";
  healthCheckPath?: string;
  healthCheckInterval?: number;
  maxFails?: number;
}

export interface CreateDomainRequest {
  domain: string;
}

export interface UpdateDomainRequest {
  domain?: string;
}

export interface CreateCertificateRequest {
  name: string;
  certificate: string;
  privateKey: string;
  expiresAt: string;
  issuer: string;
  autoRenew?: boolean;
}

export interface UpdateCertificateRequest {
  name?: string;
  certificate?: string;
  privateKey?: string;
  expiresAt?: string;
  issuer?: string;
  autoRenew?: boolean;
}

export interface CreateHttpServerRequest {
  listeningPortId: number;
  name: string;
  additionalConfig?: string;
  accessLogPath?: string;
  errorLogPath?: string;
  logLevel?: string;
}

export interface UpdateHttpServerRequest {
  listeningPortId?: number;
  name?: string;
  additionalConfig?: string;
  status?: "active" | "inactive";
  accessLogPath?: string;
  errorLogPath?: string;
  logLevel?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
