import config from "./src/config";
import {
  Activity,
  Admin,
  Attendance,
  Class,
  Club,
  PriorAbsence,
  Student,
  Teacher,
  ClubLocation,
} from "./src/models";

export = {
  type: "mysql",
  host: config.mysql.dbHost,
  port: Number(config.mysql.dbPort),
  username: config.mysql.dbUser,
  password: config.mysql.dbPass,
  database: config.mysql.dbName,
  synchronize: false,
  logging: false,
  entities: [
    Admin,
    Activity,
    Attendance,
    Class,
    Club,
    PriorAbsence,
    Student,
    Teacher,
    ClubLocation,
  ],
};
