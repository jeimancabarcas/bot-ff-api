import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArbitrageOpportunity } from './entities/arbitrage-opportunity.entity';
import { P2POrder } from './entities/p2p-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArbitrageOpportunity, P2POrder])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
