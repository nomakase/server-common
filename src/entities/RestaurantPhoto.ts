import { Entity, ManyToOne } from "typeorm";
import { Photo } from "./Photo";
import { Restaurant } from "./Restaurant";

@Entity()
export class RestaurantPhoto extends Photo {
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.photos, { onDelete:'CASCADE' })
  restaurant: Restaurant;
}
