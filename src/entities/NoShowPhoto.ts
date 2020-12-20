import { Entity, ManyToOne } from "typeorm";
import { NoShow } from "./NoShow";
import { Photo } from "./Photo";

@Entity()
export class NoShowPhoto extends Photo {
  @ManyToOne(() => NoShow, (noShow) => noShow.photos)
  noShow: NoShow;
}
