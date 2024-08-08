import { IPosition } from "./IPosition";
import { IProject } from "./IProject";
import { ISkill } from "./ISkill";
export interface IEmployee {
  _id: string;
  name: string;
  phoneNumber: string;
  dateOfBirth: string;
  avatar: string;
  citizenIdentityCard: string;
  gender: string;
  status: string;
  projects: IProject[];
  position: IPosition;
  description: string;
  skills: Skill[];
  hasAccount: boolean;
  email: string;
}

export interface Skill {
  skillId: ISkill;
  yearsOfExperience: number;
}
