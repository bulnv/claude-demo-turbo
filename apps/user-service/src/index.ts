import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface IdParams {
  id: string;
}

const users: Map<string, User> = new Map();

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy", service: "user-service", version: process.env.npm_package_version || "1.0.0" });
});

app.get("/users", (_req: Request, res: Response) => {
  res.json(Array.from(users.values()));
});

app.get("/users/:id", (req: Request<IdParams>, res: Response) => {
  const user = users.get(req.params.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

app.post("/users", (req: Request, res: Response) => {
  const { email, name } = req.body as { email?: string; name?: string };
  if (!email || !name) {
    res.status(400).json({ error: "Email and name are required" });
    return;
  }

  const user: User = {
    id: uuidv4(),
    email,
    name,
    createdAt: new Date(),
  };

  users.set(user.id, user);
  res.status(201).json(user);
});

app.delete("/users/:id", (req: Request<IdParams>, res: Response) => {
  const deleted = users.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});

export { app };
