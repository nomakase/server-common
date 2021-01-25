import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class Manager extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;
  
  @Column({ nullable: true, default: null })
  accessToken: string;
  
  @Column({ nullable: true, default: null })
  refreshToken: string;
  
  @Column({ default: false })
  isSubmitted: boolean;
  
  @Column({ default: false })
  isApproved: boolean;

  static findOneByEmail(email: string) {
    return this.findOne({ where: { email: email } });
  }
}