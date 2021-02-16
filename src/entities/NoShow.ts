import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { NoShowPhoto } from "./NoShowPhoto";

@Entity()
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
  skeleton: number;

  @Column()
  maxPeople: number;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => NoShowPhoto, (photos) => photos.noShow)
  photos: NoShowPhoto[];
}
