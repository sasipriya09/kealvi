"use client";

export type UserRole = "student" | "participant";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
};

const STORAGE_KEY = "kealvi_user_session";

export const DEMO_USERS: UserProfile[] = [
  {
    id: "user_student_1",
    name: "Alex Rivera",
    email: "alex.r@student.edu",
    role: "student",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    id: "user_student_2",
    name: "Priya Sharma",
    email: "priya.s@student.edu",
    role: "student",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
  },
  {
    id: "user_student_3",
    name: "Diego Morales",
    email: "diego.m@student.edu",
    role: "student",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego",
  },
];

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (err) {
    console.error("Failed to read user session", err);
    return null;
  }
}

export function setCurrentUser(user: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("kealvi_auth_change"));
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("kealvi_auth_change"));
}
