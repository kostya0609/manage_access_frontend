import {UserRepository} from "./UserRepository";
import {DepartmentRepository}  from "./DepartmentRepository";
import {ModuleRepository} from "./ModuleRepository";
import {RightRepository}  from "./RightRepository";
import {GroupRepository}  from "./GroupRepository";
import {AdditionalRightRepository} from "./AdditionalRightRepository"

export const DepartmentRepo      = new DepartmentRepository();
export const UserRepo            = new UserRepository();
export const ModuleRepo          = new ModuleRepository();
export const RightRepo           = new RightRepository();
export const GroupRepo           = new GroupRepository();
export const AdditionalRightRepo = new AdditionalRightRepository();

