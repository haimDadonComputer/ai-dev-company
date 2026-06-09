declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        role: "admin";
        mustChangePassword: boolean;
      };
    }
  }
}

export {};
