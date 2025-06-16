import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HttpServer } from './http-server.entity';
import { Domain } from './domain.entity';

@Entity('ServerDomainMapping')
export class ServerDomainMapping {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  serverId: number;

  @PrimaryColumn({ type: 'bigint', unsigned: true })
  domainId: number;

  @ManyToOne(() => HttpServer, (httpServer) => httpServer.domainMappings)
  @JoinColumn({ name: 'serverId' })
  httpServer: HttpServer;

  @ManyToOne(() => Domain, (domain) => domain.serverMappings)
  @JoinColumn({ name: 'domainId' })
  domain: Domain;
}
