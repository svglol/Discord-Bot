import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import User from "./User.model";

@Table({ timestamps: false })
export default class Soundboard extends Model {
  @Column
  date: number;

  @Column
  command: string;

  @ForeignKey(() => User)
  @Column
  userId: string;

  @BelongsTo(() => User)
  user: User;
}
