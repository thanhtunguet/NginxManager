import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { HttpServer } from './http-server.entity';
import { Location } from './location.entity';

export enum AccessRuleType {
  ALLOW = 'allow',
  DENY = 'deny',
}

export enum AccessRuleScope {
  SERVER = 'server',
  LOCATION = 'location',
}

@Entity('AccessRule')
export class AccessRule {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({
    type: 'enum',
    enum: AccessRuleType,
    default: AccessRuleType.ALLOW,
  })
  rule: AccessRuleType;

  @Column({
    type: 'enum',
    enum: AccessRuleScope,
    default: AccessRuleScope.SERVER,
  })
  scope: AccessRuleScope;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  serverId?: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  locationId?: number;

  @ManyToOne(() => HttpServer, { nullable: true })
  @JoinColumn({ name: 'serverId' })
  httpServer?: HttpServer;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'locationId' })
  location?: Location;
}