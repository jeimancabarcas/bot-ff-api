import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('p2p_orders')
@Index(['exchange', 'asset', 'fiat', 'tradeType'])
@Index(['createdAt'])
export class P2POrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  exchange: string;

  @Column()
  advertId: string;

  @Column()
  asset: string;

  @Column()
  fiat: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  price: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  availableAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  minLimit: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  maxLimit: number;

  @Column()
  tradeType: string; // 'BUY' or 'SELL'

  @Column()
  merchantName: string;

  @Column({ type: 'json', nullable: true })
  paymentMethods: string[];

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
