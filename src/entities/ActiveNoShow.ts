import { Entity, ManyToOne, OneToMany } from "typeorm";
import { ActiveNoShowPhoto } from "./ActiveNoShowPhoto";
import { NoShow } from "./NoShow";
import { Restaurant } from "./Restaurant";

@Entity()
export class ActiveNoShow extends NoShow {
  @OneToMany(() => ActiveNoShowPhoto, (photos) => photos.noShow)
  photos: ActiveNoShowPhoto[];

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.activeNoShows)
  restaurant: Restaurant;
}
