import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "../storage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const jobs = await storage.getPredefinedJobs();
        return res.status(200).json(jobs);

      case 'POST':
        const job = await storage.createPredefinedJob(req.body);
        return res.status(201).json(job);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}