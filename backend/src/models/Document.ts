import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  filename: string;

  @Column({ length: 255 })
  encrypted_filename: string;

  @Column({ length: 100 })
  mime_type: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'uuid' })
  sender_id: string;

  @Column({ type: 'uuid' })
  recipient_id: string;

  @Column({ type: 'text' })
  encryption_iv: string;

  @Column({ type: 'text' })
  encryption_auth_tag: string;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'int', nullable: true })
  view_limit: number | null;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  // FEATURE: Sensitive documents
  // Here we need at least these 2 properties to be able to handle sensitive documents
  // @Column({ type: 'boolean', default: false })
  // is_sensitive: boolean;

  // @Column({ type: 'text', nullable: true })
  // access_password_hash: string | null;
  // END FEATURE: Sensitive documents

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;
}
