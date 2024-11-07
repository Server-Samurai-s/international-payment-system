export enum EmployeeRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    MANAGER = 'MANAGER',
    AGENT = 'AGENT'
}

export interface Employee {
    employeeId: string;
    firstName: string;
    lastName: string;
    username: string;
    role: EmployeeRole;
} 