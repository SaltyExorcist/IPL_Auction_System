export interface AuthenticatedUser {
  userId: string;
  username: string;
  role: 'ADMIN' | 'BIDDER';
  teamId?: string;
}