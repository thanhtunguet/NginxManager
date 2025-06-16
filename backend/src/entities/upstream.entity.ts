import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Location } from './location.entity';

export enum UpstreamStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('Upstream')
export class Upstream {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  server: string;

  @Column({ type: 'bigint' })
  keepAlive: number;

  @Column({
    type: 'enum',
    enum: UpstreamStatus,
    default: UpstreamStatus.ACTIVE,
  })
  status: UpstreamStatus;

  @Column({ type: 'varchar', length: 255 })
  healthCheckPath: string;

  @Column({ type: 'bigint', default: 50 })
  healthCheckInterval: number;

  @Column({ type: 'bigint', default: 3 })
  maxFails: number;

  @OneToMany(() => Location, (location) => location.upstream)
  locations: Location[];
}
