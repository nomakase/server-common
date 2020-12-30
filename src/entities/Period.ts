import { Column } from "typeorm";

export class Period {
  @Column()
  startTime: Date;

  @Column()
  EndTime: Date;
}
