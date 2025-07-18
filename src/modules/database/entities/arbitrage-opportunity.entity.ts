import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('arbitrage_opportunities')
@Index(['asset', 'fiat'])
@Index(['profitPercentage'])
@Index(['createdAt'])
export class ArbitrageOpportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  asset: string;

  @Column()
  fiat: string;

  @Column()
  buyExchange: string;

  @Column()
  sellExchange: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  buyPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  sellPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  profitPercentage: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  maxTradeAmount: number;

  @Column({ type: 'json' })
  buyOrderDetails: Record<string, any>;

  @Column({ type: 'json' })
  sellOrderDetails: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
