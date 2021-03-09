import { Entity, OneToMany } from "typeorm";
import { ActiveNoShowPhoto } from "./ActiveNoShowPhoto";
import { NoShow } from "./NoShow";

@Entity()
export class ActiveNoShow extends NoShow {
  @OneToMany(() => ActiveNoShowPhoto, (photos) => photos.noShow)
  photos: ActiveNoShowPhoto[];
}
