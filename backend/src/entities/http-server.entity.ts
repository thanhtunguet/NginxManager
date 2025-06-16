import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ListeningPort } from './listening-port.entity';
import { Location } from './location.entity';
import { ConfigVersion } from './config-version.entity';
import { ServerDomainMapping } from './server-domain-mapping.entity';
import { Certificate } from './certificate.entity';

export enum HttpServerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('HttpServer')
export class HttpServer {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  listeningPortId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'mediumtext' })
  additionalConfig: string;

  @Column({
    type: 'enum',
    enum: HttpServerStatus,
    default: HttpServerStatus.ACTIVE,
  })
  status: HttpServerStatus;

  @Column({ type: 'varchar', length: 255, default: '/dev/null' })
  accessLogPath: string;

  @Column({ type: 'varchar', length: 255, default: '/dev/null' })
  errorLogPath: string;

  @Column({ type: 'varchar', length: 255, default: 'warn' })
  logLevel: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  certificateId: number;

  @ManyToOne(() => ListeningPort, (listeningPort) => listeningPort.httpServers)
  @JoinColumn({ name: 'listeningPortId' })
  listeningPort: ListeningPort;

  @ManyToOne(() => Certificate, { nullable: true })
  @JoinColumn({ name: 'certificateId' })
  certificate: Certificate;

  @OneToMany(() => Location, (location) => location.httpServer)
  locations: Location[];

  @OneToMany(() => ConfigVersion, (configVersion) => configVersion.httpServer)
  configVersions: ConfigVersion[];

  @OneToMany(
    () => ServerDomainMapping,
    (serverDomainMapping) => serverDomainMapping.httpServer,
  )
  domainMappings: ServerDomainMapping[];
}