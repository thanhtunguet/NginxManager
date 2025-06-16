export interface Upstream {
  id: string;
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
  id: string;
  domain: string;
  createdAt?: string;
}

export interface Certificate {
  id: string;
  name: string;
  certificate: string;
  privateKey: string;
  expiresAt: string;
  issuer: string;
  autoRenew: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HttpServer {
  id: string;
  listeningPortId: string;
  name: string;
  additionalConfig: string;
  status: "active" | "inactive";
  accessLogPath: string;
  errorLogPath: string;
  logLevel: string;
  certificateId?: string;
  locations?: Location[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  id: string;
  serverId: string;
  upstreamId: string;
  path: string;
  additionalConfig: string;
  clientMaxBodySize: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListeningPort {
  id: string;
  name: string;
  port: number;
  protocol: string;
  ssl: boolean;
  http2: boolean;
  createdAt?: string;
}

export interface ConfigVersion {
  id: string;
  serverId: string;
  config: string;
  createdAt: string;
  isActive: boolean;
}

export interface AccessRule {
  id: string;
  serverId?: string;
  locationId?: string;
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

export interface CreateLocationForServerRequest {
  upstreamId: string;
  path: string;
  additionalConfig?: string;
  clientMaxBodySize?: string;
}

export interface CreateHttpServerRequest {
  listeningPortId: string;
  name: string;
  additionalConfig?: string;
  accessLogPath?: string;
  errorLogPath?: string;
  logLevel?: string;
  certificateId?: string;
  locations?: CreateLocationForServerRequest[];
}

export interface UpdateHttpServerRequest {
  listeningPortId?: string;
  name?: string;
  additionalConfig?: string;
  status?: "active" | "inactive";
  accessLogPath?: string;
  errorLogPath?: string;
  logLevel?: string;
  certificateId?: string;
  locations?: CreateLocationForServerRequest[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
