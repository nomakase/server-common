import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { RestaurantPhoto } from "./RestaurantPhoto";

@Entity()
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  address: string;

  @Column()
  open: string;

  @Column()
  close: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => RestaurantPhoto, (photos) => photos.restaurant)
  photos: RestaurantPhoto[];
}
