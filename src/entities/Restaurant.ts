import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ActiveNoShow } from "./ActiveNoShow";
import { Manager } from "./Manager";
import { RestaurantPhoto } from "./RestaurantPhoto";
import { Time } from "./Time";

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

  @Column(() => Time)
  openningHour: Time;

  @Column(() => Time)
  breakTime: Time;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => RestaurantPhoto, (photos) => photos.restaurant)
  photos: RestaurantPhoto[];

  @Column({ type: "int", default: 0 })
  verfication: number;

  @ManyToOne(() => Manager, (manager) => manager.restaurants)
  manager: Manager;

  @OneToMany(() => ActiveNoShow, (active) => active.restaurant)
  activeNoShows: ActiveNoShow[];
}
