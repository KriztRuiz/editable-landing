// src/models/User.ts
import mongoose, { Schema } from "mongoose";

export type UserRole = "admin";
export interface UserDoc { email: string; passwordHash: string; role: UserRole; }

const UserSchema = new Schema<UserDoc>({
  email: { type: String, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "admin" }
});

export const UserModel = mongoose.model<UserDoc>("User", UserSchema);
