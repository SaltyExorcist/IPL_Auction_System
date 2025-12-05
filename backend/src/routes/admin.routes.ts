import { Router } from 'express';
import { prisma } from '../config/prisma';
import type { Request, Response } from 'express';
const router = Router();

// Helper to reset DB and add mock data
router.post('/seed', async (req, res) => {
  try {
    // Clear existing data (optional)
    await prisma.bid.deleteMany({});
    await prisma.player.updateMany({ data: { teamId: null, soldFor: null, status: 'PENDING' }});
    await prisma.team.deleteMany({});
    await prisma.player.deleteMany({});

    // Create Teams
    await prisma.team.createMany({
      data: [
        { name: 'Mumbai Indians', purseBalance: 5000 },
        { name: 'Chennai Super Kings', purseBalance: 5000 },
        { name: 'Royal Challengers', purseBalance: 5000 },
        { name: 'Kolkata Knight Riders', purseBalance: 5000 }
      ]
    });

    // Create Players
    await prisma.player.createMany({
      data: [
        { name: 'Virat Kohli', role: 'Batsman', basePrice: 200 },
        { name: 'Jasprit Bumrah', role: 'Bowler', basePrice: 200 },
        { name: 'Ben Stokes', role: 'All-Rounder', basePrice: 150 }
      ]
    });

    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

router.post('/players', async (req:Request, res:Response) => {
  try {
    const {name,role,basePrice}=req.body;

    // Create Players
    await prisma.player.create({
      data: {
         name: name, role: role, basePrice: basePrice
      }
    });

    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});



export const adminRoutes = router;