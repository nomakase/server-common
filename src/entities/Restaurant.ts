import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Period } from "./Period";
import { RestaurantPhoto } from "./RestaurantPhoto";

@Entity()
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  address: string;

  @Column((_type) => Period)
  OpenPeriod: Period;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => RestaurantPhoto, (photos) => photos.restaurant)
  photos: RestaurantPhoto[];
}
