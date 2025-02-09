import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "../../storage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const sessionId = parseInt(id as string);

    if (isNaN(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    switch (req.method) {
      case 'GET':
        const session = await storage.getSession(sessionId);
        if (!session) {
          return res.status(404).json({ error: "Session not found" });
        }
        return res.status(200).json(session);

      case 'PATCH':
        const updatedSession = await storage.updateSession(sessionId, req.body);
        return res.status(200).json(updatedSession);

      case 'DELETE':
        await storage.deleteSession(sessionId);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}