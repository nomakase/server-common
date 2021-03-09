import { Column } from "typeorm";

export class Time {
  @Column({ nullable: true })
  start: string;

  @Column({ nullable: true })
  end: string;
}
