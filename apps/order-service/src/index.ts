import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IdParams {
  id: string;
}

const orders: Map<string, Order> = new Map();

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy", service: "order-service", version: process.env.npm_package_version || "1.2.0" });
});

app.get("/orders", (req: Request, res: Response) => {
  const { userId } = req.query as { userId?: string };
  let result = Array.from(orders.values());

  if (userId) {
    result = result.filter(order => order.userId === userId);
  }

  res.json(result);
});

app.get("/orders/:id", (req: Request<IdParams>, res: Response) => {
  const order = orders.get(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(order);
});

app.post("/orders", (req: Request, res: Response) => {
  const { userId, items } = req.body as { userId?: string; items?: OrderItem[] };

  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "userId and items array are required" });
    return;
  }

  const total = items.reduce((sum: number, item: OrderItem) => sum + item.price * item.quantity, 0);

  const order: Order = {
    id: uuidv4(),
    userId,
    items,
    status: "pending",
    total,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  orders.set(order.id, order);
  res.status(201).json(order);
});

app.patch("/orders/:id/status", (req: Request<IdParams>, res: Response) => {
  const order = orders.get(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const { status } = req.body as { status?: string };
  const validStatuses: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

  if (!status || !validStatuses.includes(status as OrderStatus)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    return;
  }

  order.status = status as OrderStatus;
  order.updatedAt = new Date();
  res.json(order);
});

app.delete("/orders/:id", (req: Request<IdParams>, res: Response) => {
  const deleted = orders.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});

export { app };
