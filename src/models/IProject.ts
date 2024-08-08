import { IAccount } from "./IAccount";
import { ISkill } from "./ISkill";

export interface IProject {
  _id: string;
  name: string;
  description: string;
  technologies: ISkill[];
  startDate: string;
  endDate: string;
  status: string;
  projectManager: IAccount;
  employees: IEmployeeRole[];
  isDeleted: boolean;
}

export interface IEmployeeRole {
  accountId: IAccount;
  role: string;
}
