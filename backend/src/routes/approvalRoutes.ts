import { Router } from 'express';
import * as ApprovalController from '../controllers/approvalController';

const router = Router();

// GET all pending claims
router.get('/claims', ApprovalController.getPendingClaims);

// GET a single claim by ID
router.get('/claims/:id', ApprovalController.getClaimById);

// POST approve a claim
router.post('/claims/:id/approve', ApprovalController.approveClaim);

// POST reject a claim (comment required)
router.post('/claims/:id/reject', ApprovalController.rejectClaim);

// POST request changes (comment required)
router.post('/claims/:id/request-changes', ApprovalController.requestChanges);

export default router;