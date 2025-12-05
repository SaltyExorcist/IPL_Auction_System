import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

export class AuthController {
  
  // POST /api/auth/login
  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    
    try {
      const user = await prisma.user.findUnique({ 
        where: { username },
        include: { team: true } 
      });

      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      // Create Session Token
      const token = jwt.sign(
        { userId: user.id, role: user.role, teamId: user.teamId }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          teamId: user.teamId,
          teamName: user.team?.name,
          purseBalance: user.team?.purseBalance
        }
      });
    } catch (e) {
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // POST /api/auth/seed (Run this once to create users)
  async seedUsers(req: Request, res: Response) {
    const password = await bcrypt.hash('password', 10);
    
    // 1. Create Admin
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: { username: 'admin', password, role: 'ADMIN' }
    });

    // 2. Create Users for existing Teams
    const teams = await prisma.team.findMany();
    for (const team of teams) {
      // Create username like "mumbaiindians"
      const username = team.name.replace(/\s/g, '').toLowerCase();
      await prisma.user.upsert({
        where: { username },
        update: {teamId: team.id},
        create: { 
          username, 
          password, 
          role: 'BIDDER', 
          teamId: team.id 
        }
      });
    }
    
    res.json({ message: "Users seeded. Password is 'password'" });
  }
}