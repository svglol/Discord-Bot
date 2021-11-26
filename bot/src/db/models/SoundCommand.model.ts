import { DataTypes } from "sequelize";
import { Table, Column, Model } from "sequelize-typescript";

@Table({ timestamps: false })
export default class SoundCommand extends Model {
  @Column
  command: string;

  @Column
  file: string;

  @Column({
    type: DataTypes.INTEGER,
    defaultValue: 1,
  })
  volume: number;

  @Column
  date: number;
}
