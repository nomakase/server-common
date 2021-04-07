import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { InactiveNoShowPhoto } from "./InactiveNoShowPhoto";
import { NoShow } from "./NoShow";
import { Restaurant } from "./Restaurant";

@Entity()
export class InactiveNoShow extends NoShow {
  public static readonly REASON_EXPIRED = "EXPIRED";
  public static readonly REASON_MATCHED = "MATCHED";

  @Column()
  reason: "EXPIRED" | "MATCHED";

  @OneToMany(() => InactiveNoShowPhoto, (photos) => photos.noShow)
  photos: InactiveNoShowPhoto[];

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.inactiveNoShows, { onDelete:'CASCADE' })
  restaurant: Restaurant;
}