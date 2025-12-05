import { prisma } from '../config/prisma';

export class TeamService {
  
  async getAllTeams() {
    return await prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { players: true } } // Count players owned
      }
    });
  }

  async getTeamById(id: string) {
    return await prisma.team.findUnique({
      where: { id },
      include: { players: true }
    });
  }

  async getAllPlayers() {
    return await prisma.player.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async getPlayerById(id: string) {
    return await prisma.player.findUnique({ where: { id } });
  }
}