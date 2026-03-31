import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as managerService from '../services/manager.service';

export async function getPendingClaims(req: AuthRequest, res: Response): Promise<void> {
  try {
    const claims = await managerService.getPendingClaims();
    res.json(claims);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching claims';
    res.status(400).json({ error: message });
  }
}

export async function getClaimForReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const claim = await managerService.getClaimForReview(req.params.claimId);
    res.json(claim);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Claim not found';
    res.status(404).json({ error: message });
  }
}

export async function approveClaim(req: AuthRequest, res: Response): Promise<void> {
  try {
    await managerService.approveClaim(
      req.params.claimId,
      req.user!.employeeId,
      req.body.comment
    );
    res.json({ message: 'Claim approved' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error approving claim';
    res.status(400).json({ error: message });
  }
}

export async function rejectClaim(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.body.comment) {
      res.status(400).json({ error: 'A comment is required when rejecting a claim' });
      return;
    }
    await managerService.rejectClaim(
      req.params.claimId,
      req.user!.employeeId,
      req.body.comment
    );
    res.json({ message: 'Claim rejected' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error rejecting claim';
    res.status(400).json({ error: message });
  }
}

export async function requestChanges(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.body.comment) {
      res.status(400).json({ error: 'A comment is required when requesting changes' });
      return;
    }
    await managerService.requestChanges(
      req.params.claimId,
      req.user!.employeeId,
      req.body.comment
    );
    res.json({ message: 'Changes requested' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error requesting changes';
    res.status(400).json({ error: message });
  }
}
