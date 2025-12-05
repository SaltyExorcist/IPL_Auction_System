//import { Request, Response } from 'express';
import { TeamService } from '../services/TeamService.js';

const teamService = new TeamService();

export class TeamController {
  
  // GET /api/teams
  async getTeams(req:any, res:any) {
    try {
      const teams = await teamService.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  }

  // GET /api/players
  async getPlayers(req: any, res: any) {
    try {
      const players = await teamService.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch players' });
    }
  }
}