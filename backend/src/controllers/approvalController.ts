import { Request, Response } from 'express';
import * as ApprovalService from '../services/approvalService';

// GET /api/manager/claims - View all pending claims
export const getPendingClaims = (req: Request, res: Response) => {
  try {
    const claims = ApprovalService.getPendingClaims();
    res.json({ success: true, data: claims });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/manager/claims/:id - View a single claim
export const getClaimById = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const claim = ApprovalService.getClaimById(id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    res.json({ success: true, data: claim });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/manager/claims/:id/approve
export const approveClaim = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { managerId, comment } = req.body;
    const decision = ApprovalService.approveClaim(id, managerId, comment || '');
    res.json({ success: true, message: 'Claim approved', data: decision });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST /api/manager/claims/:id/reject
export const rejectClaim = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { managerId, comment } = req.body;
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Comment is required when rejecting' });
    }
    const decision = ApprovalService.rejectClaim(id, managerId, comment);
    res.json({ success: true, message: 'Claim rejected', data: decision });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST /api/manager/claims/:id/request-changes
export const requestChanges = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { managerId, comment } = req.body;
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Comment is required when requesting changes' });
    }
    const decision = ApprovalService.requestChanges(id, managerId, comment);
    res.json({ success: true, message: 'Changes requested', data: decision });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};