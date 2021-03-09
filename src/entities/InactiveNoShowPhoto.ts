import { Entity, ManyToOne } from "typeorm";
import { InactiveNoShow } from "./InactiveNoShow";
import { Photo } from "./Photo";

@Entity()
export class InactiveNoShowPhoto extends Photo {
  @ManyToOne(() => InactiveNoShow, (noShow) => noShow.photos)
  noShow: InactiveNoShow;
}
