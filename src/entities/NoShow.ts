import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { NoShowPhoto } from "./NoShowPhoto";
import { Period } from "./Period";

@Entity()
export class NoShow extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mealTime: Date;

  @Column()
  costPrice: number;

  @Column()
  salePrice: number;

  @Column((_type) => Period)
  salePeriod: Period;

  @Column({ default: 1 })
  skeleton: number;

  @Column()
  maxPeople: number;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => NoShowPhoto, (photos) => photos.noShow)
  photos: NoShowPhoto[];
}
