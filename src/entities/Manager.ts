import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import { Restaurant } from "./Restaurant";

@Entity()
export class Manager extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ type: "varchar", nullable: true })
  accessTokenID: string | null;

  @Column({ type: "varchar", nullable: true })
  refreshTokenID: string | null;

  @Column({ default: false })
  isSubmitted: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @OneToMany(() => Restaurant, restaurant => restaurant.manager)
  restaurants: Restaurant[];

  static findOneByEmail(email: string) {
    return this.findOne({ email });
  }
}
