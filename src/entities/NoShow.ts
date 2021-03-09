import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export class NoShow extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  writer: string;

  @Column()
  costPrice: number;

  @Column({ nullable: true })
  salePrice: number;

  @Column()
  from: Date;

  @Column()
  to: Date;

  @Column({ default: 1 })
  minPeople: number;

  @Column()
  maxPeople: number;

  @Column({ nullable: true })
  description: string;
}
