import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('NginxSettings')
export class NginxSettings {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 500 })
  configPath: string;

  @Column({ type: 'text' })
  testCommand: string;

  @Column({ type: 'text' })
  reloadCommand: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
