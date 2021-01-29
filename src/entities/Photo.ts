import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export abstract class Photo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filePath: string;
}
