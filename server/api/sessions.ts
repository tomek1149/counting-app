import { NextApiRequest, NextApiResponse } from 'next';
import { type Session, type InsertSession } from "@shared/schema";
import { storage } from "../storage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const sessions = await storage.getSessions();
        return res.status(200).json(sessions);

      case 'POST':
        const insertSession: InsertSession = req.body;
        const session = await storage.createSession(insertSession);
        return res.status(201).json(session);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}