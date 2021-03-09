import { Column, Entity, OneToMany } from "typeorm";
import { InactiveNoShowPhoto } from "./InactiveNoShowPhoto";
import { NoShow } from "./NoShow";

@Entity()
export class InactiveNoShow extends NoShow {
  public static readonly REASON_EXPIRED = 0;
  public static readonly REASON_MATCHED = 1;

  @Column()
  reason: 0 | 1;

  @OneToMany(() => InactiveNoShowPhoto, (photos) => photos.noShow)
  photos: InactiveNoShowPhoto[];
}
