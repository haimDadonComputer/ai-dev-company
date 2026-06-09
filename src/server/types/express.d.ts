declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        role: "student" | "instructor" | "admin";
        mustChangePassword: boolean;
      };
    }
  }
}

export {};
