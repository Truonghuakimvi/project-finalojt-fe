import { IEmployee } from "./IEmployee";
export interface IAccount {
  _id: string;
  employeeId: IEmployee;
  email: string;
  password: string;
  role: string;
  status: string;
}
