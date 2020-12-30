import { Column, PrimaryGeneratedColumn } from "typeorm";

export abstract class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filePath: string;
}
