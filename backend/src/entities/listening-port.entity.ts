import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { HttpServer } from './http-server.entity';

@Entity('ListeningPort')
export class ListeningPort {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'bigint' })
  port: number;

  @Column({ type: 'varchar', length: 10, default: 'http' })
  protocol: string;

  @Column({ type: 'boolean', default: false })
  ssl: boolean;

  @Column({ type: 'boolean', default: false })
  http2: boolean;

  @OneToMany(() => HttpServer, (httpServer) => httpServer.listeningPort)
  httpServers: HttpServer[];
}