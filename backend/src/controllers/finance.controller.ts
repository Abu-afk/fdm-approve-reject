import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as financeService from '../services/finance.service';

export async function getApprovedClaims(req: AuthRequest, res: Response): Promise<void> {
  try {
    const claims = await financeService.getApprovedClaims();
    res.json(claims);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching claims';
    res.status(400).json({ error: message });
  }
}

export async function getClaimForProcessing(req: AuthRequest, res: Response): Promise<void> {
  try {
    const claim = await financeService.getClaimForProcessing(req.params.claimId);
    res.json(claim);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Claim not found';
    res.status(404).json({ error: message });
  }
}

export async function processReimbursement(req: AuthRequest, res: Response): Promise<void> {
  try {
    await financeService.processReimbursement(
      req.params.claimId,
      req.user!.employeeId,
      req.body
    );
    res.json({ message: 'Reimbursement processed successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error processing reimbursement';
    res.status(400).json({ error: message });
  }
}
