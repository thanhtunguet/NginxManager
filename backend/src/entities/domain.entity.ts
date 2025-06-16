import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { CertificateDomainMapping } from './certificate-domain-mapping.entity';
import { ServerDomainMapping } from './server-domain-mapping.entity';

@Entity('Domain')
export class Domain {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  domain: string;

  @OneToMany(
    () => CertificateDomainMapping,
    (certificateDomainMapping) => certificateDomainMapping.domain,
  )
  certificateMappings: CertificateDomainMapping[];

  @OneToMany(
    () => ServerDomainMapping,
    (serverDomainMapping) => serverDomainMapping.domain,
  )
  serverMappings: ServerDomainMapping[];
}
