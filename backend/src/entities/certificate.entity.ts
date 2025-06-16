import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CertificateDomainMapping } from './certificate-domain-mapping.entity';

@Entity('Certificate')
export class Certificate {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'mediumtext' })
  certificate: string;

  @Column({ type: 'mediumtext' })
  privateKey: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'varchar', length: 255 })
  issuer: string;

  @Column({ type: 'boolean', default: false })
  autoRenew: boolean;

  @OneToMany(
    () => CertificateDomainMapping,
    (certificateDomainMapping) => certificateDomainMapping.certificate,
  )
  domainMappings: CertificateDomainMapping[];
}
