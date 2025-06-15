import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { HttpServer } from './http-server.entity';
import { Upstream } from './upstream.entity';

@Entity('Location')
export class Location {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  serverId: number;

  @Column({ type: 'bigint', unsigned: true })
  upstreamId: number;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'mediumtext' })
  additionalConfig: string;

  @Column({ type: 'varchar', length: 10 })
  clientMaxBodySize: string;

  @ManyToOne(() => HttpServer, (httpServer) => httpServer.locations)
  @JoinColumn({ name: 'serverId' })
  httpServer: HttpServer;

  @ManyToOne(() => Upstream, (upstream) => upstream.locations)
  @JoinColumn({ name: 'upstreamId' })
  upstream: Upstream;
}