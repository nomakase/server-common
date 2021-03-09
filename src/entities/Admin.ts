import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export class Admin extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  pw: string;
}
