import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateP2POrders1751246015419 implements MigrationInterface {
  name = 'CreateP2POrders1751246015419';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "arbitrage_opportunities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "asset" character varying NOT NULL, "fiat" character varying NOT NULL, "buyExchange" character varying NOT NULL, "sellExchange" character varying NOT NULL, "buyPrice" numeric(18,8) NOT NULL, "sellPrice" numeric(18,8) NOT NULL, "profitPercentage" numeric(5,4) NOT NULL, "maxTradeAmount" numeric(18,8) NOT NULL, "buyOrderDetails" json NOT NULL, "sellOrderDetails" json NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1309d80ee235654cb084b561252" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a84e4b38158ef89ab0751643d" ON "arbitrage_opportunities" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bc87ebbcbcbf725a4701f97cd1" ON "arbitrage_opportunities" ("profitPercentage") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f4c564b7e4c0370b4a9d33915d" ON "arbitrage_opportunities" ("asset", "fiat") `,
    );
    await queryRunner.query(
      `CREATE TABLE "p2p_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "exchange" character varying NOT NULL, "advertId" character varying NOT NULL, "asset" character varying NOT NULL, "fiat" character varying NOT NULL, "price" numeric(18,8) NOT NULL, "availableAmount" numeric(18,8) NOT NULL, "minLimit" numeric(18,8) NOT NULL, "maxLimit" numeric(18,8) NOT NULL, "tradeType" character varying NOT NULL, "merchantName" character varying NOT NULL, "paymentMethods" json, "metadata" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_07e60e49b374f8ea622e9be7ca6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff9b9ece37c3fdfb2a185e4e2f" ON "p2p_orders" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ddbefa419893bc20d53a56d328" ON "p2p_orders" ("exchange", "asset", "fiat", "tradeType") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ddbefa419893bc20d53a56d328"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff9b9ece37c3fdfb2a185e4e2f"`,
    );
    await queryRunner.query(`DROP TABLE "p2p_orders"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f4c564b7e4c0370b4a9d33915d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bc87ebbcbcbf725a4701f97cd1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9a84e4b38158ef89ab0751643d"`,
    );
    await queryRunner.query(`DROP TABLE "arbitrage_opportunities"`);
  }
}
