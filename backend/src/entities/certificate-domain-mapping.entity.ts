import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Certificate } from './certificate.entity';
import { Domain } from './domain.entity';

@Entity('CertificateDomainMapping')
export class CertificateDomainMapping {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  domainId: number;

  @PrimaryColumn({ type: 'bigint', unsigned: true })
  certificateId: number;

  @ManyToOne(() => Certificate, (certificate) => certificate.domainMappings)
  @JoinColumn({ name: 'certificateId' })
  certificate: Certificate;

  @ManyToOne(() => Domain, (domain) => domain.certificateMappings)
  @JoinColumn({ name: 'domainId' })
  domain: Domain;
}
