import { Entity, ManyToOne } from "typeorm";
import { ActiveNoShow } from "./ActiveNoShow";
import { Photo } from "./Photo";

@Entity()
export class ActiveNoShowPhoto extends Photo {
  @ManyToOne(() => ActiveNoShow, (noShow) => noShow.photos, { onDelete:'CASCADE' })
  noShow: ActiveNoShow;
}
