import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { HttpServer } from './http-server.entity';

@Entity('ConfigVersion')
export class ConfigVersion {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  serverId: number;

  @Column({ type: 'varchar', length: 255, default: 'Untitled Configuration' })
  name: string;

  @Column({ type: 'mediumtext' })
  config: string;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'boolean' })
  isActive: boolean;

  @ManyToOne(() => HttpServer, (httpServer) => httpServer.configVersions, {
    nullable: true,
  })
  @JoinColumn({ name: 'serverId' })
  httpServer: HttpServer;
}
