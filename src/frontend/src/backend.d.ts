import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface FoodLogEntry {
    date: string;
    calories: number;
    meal_type: string;
    protein_g: number;
    carbs_g: number;
    food_name: string;
    fat_g: number;
}
export interface WorkoutLog {
    duration_minutes: bigint;
    date: string;
    workout_plan_id: bigint;
    completed: boolean;
    calories_burned: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Timestamp = bigint;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface WorkoutPlan {
    duration_minutes: bigint;
    goal: string;
    difficulty: string;
    name: string;
    exercises: Array<WorkoutExercise>;
    description: string;
}
export interface MacroTargets {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface MealTemplate {
    allergy_tags: Array<string>;
    calories: number;
    name: string;
    description: string;
    protein_g: number;
    category: string;
    image: ExternalBlob;
    carbs_g: number;
    fat_g: number;
}
export interface DailyTotals {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
}
export interface DailyFoodSummary {
    entries: Array<FoodLogEntry>;
    totals: DailyTotals;
}
export interface WeightEntry {
    weight_kg: number;
    date: string;
}
export interface UserProfile {
    age: bigint;
    weight_kg: number;
    daily_calories: bigint;
    goal: string;
    name: string;
    macro_targets: MacroTargets;
    last_active: Timestamp;
    dietary_restrictions: Array<string>;
    height_cm: number;
}
export interface WorkoutExercise {
    duration_seconds: bigint;
    name: string;
    reps: bigint;
    sets: bigint;
    animation_type: string;
    muscle_group: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMealTemplate(meal: MealTemplate): Promise<bigint>;
    addWorkoutPlan(plan: WorkoutPlan): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateBMI(): Promise<number>;
    chatWithNutritionAI(message: string, conversationContext: string): Promise<string>;
    deleteMealTemplate(id: bigint): Promise<void>;
    filterMealsByDietaryRestrictions(restrictions: Array<string>): Promise<Array<MealTemplate>>;
    getAIMealSuggestions(todayCalories: number, todayProtein: number, todayCarbs: number, todayFat: number): Promise<string>;
    getAIWorkoutRecommendation(recentWorkoutSummary: string): Promise<string>;
    getAllMealTemplates(): Promise<Array<MealTemplate>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getAllWorkoutPlans(): Promise<Array<WorkoutPlan>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMealLogsByDate(date: string): Promise<DailyFoodSummary>;
    getMealTemplate(id: bigint): Promise<MealTemplate>;
    getProfile(user: Principal): Promise<UserProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeightHistory(): Promise<Array<WeightEntry>>;
    getWorkoutPlan(id: bigint): Promise<WorkoutPlan>;
    getWorkoutsByDate(date: string): Promise<Array<WorkoutLog>>;
    isCallerAdmin(): Promise<boolean>;
    logMeal(meal: FoodLogEntry): Promise<void>;
    logWeight(entry: WeightEntry): Promise<void>;
    logWorkout(log: WorkoutLog): Promise<void>;
    registerUser(profile: UserProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateMealTemplate(id: bigint, meal: MealTemplate): Promise<void>;
    updateUser(profile: UserProfile): Promise<void>;
    updateWorkoutPlan(id: bigint, plan: WorkoutPlan): Promise<void>;
}
