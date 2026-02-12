import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: TaskId;
    title: string;
    procrastinated: boolean;
    createdAt: Time;
    completed: boolean;
    description: string;
    updatedAt: Time;
    reminderTime?: bigint;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export type TaskId = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeTask(taskId: TaskId): Promise<void>;
    createTask(title: string, description: string, reminderTime: bigint | null): Promise<Task>;
    deleteTask(taskId: TaskId): Promise<void>;
    getAllTasks(): Promise<Array<Task>>;
    getAutoReset(): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getNotificationsEnabled(): Promise<boolean>;
    getTasksForDay(_day: bigint): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAutoReset(enabled: boolean): Promise<void>;
    setNotificationsEnabled(enabled: boolean): Promise<void>;
    toggleProcrastination(taskId: TaskId): Promise<void>;
    updateTask(taskId: TaskId, title: string, description: string, reminderTime: bigint | null): Promise<Task>;
}
