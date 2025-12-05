import { Router } from 'express';
import { TeamController } from '../controllers/team.controller.js';

const router = Router();
const teamController = new TeamController();

router.get('/teams', teamController.getTeams);
router.get('/players', teamController.getPlayers);

export const teamRoutes = router;