export interface EmployeeAuthResponse {
    token: string;
    employee: {
        employeeId: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}

export interface CustomerAuthResponse {
    token: string;
    firstName: string;
    userId: string;
}
