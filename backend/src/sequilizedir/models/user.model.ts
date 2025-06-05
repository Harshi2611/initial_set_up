import { Optional } from "sequelize";
import {
  Model,
  Table,
  UpdatedAt,
  DeletedAt,
  CreatedAt,
  PrimaryKey,
  AutoIncrement,
  Column,
  DataType,
  Unique,
  AllowNull,
} from "sequelize-typescript";

export interface IUser {
  id?: string;
  name: string;
  email: string;
}

interface ICreateAttributeUser extends Optional<IUser, "id"> {}

@Table({ tableName: "user", timestamps: true, paranoid: true })
class User extends Model<IUser, ICreateAttributeUser> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Unique(true)
  @Column(DataType.STRING)
  email: string;

  @Column(DataType.DATE)
  check_in: Date;

  @Column(DataType.DATE)
  check_out: Date;

  @Column(DataType.INTEGER)
  booked_rooms: number;

  @Column(DataType.INTEGER)
  guest_per_room: number;

  @Column(DataType.INTEGER)
  available_room: number;

  @Column(DataType.BIGINT)
  contact_number: number;

  @CreatedAt
  created_at?: Date;

  @UpdatedAt
  updated_at?: Date;

  @DeletedAt
  deleted_at?: Date;
}
export default User;
