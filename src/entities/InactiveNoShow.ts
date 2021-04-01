import { Column, Entity, OneToMany } from "typeorm";
import { InactiveNoShowPhoto } from "./InactiveNoShowPhoto";
import { NoShow } from "./NoShow";

@Entity()
export class InactiveNoShow extends NoShow {
  public static readonly REASON_EXPIRED = "EXPIRED";
  public static readonly REASON_MATCHED = "MATCHED";

  @Column()
  reason: "EXPIRED" | "MATCHED";

  @OneToMany(() => InactiveNoShowPhoto, (photos) => photos.noShow)
  photos: InactiveNoShowPhoto[];
}
