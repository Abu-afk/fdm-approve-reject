import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as managerController from '../controllers/manager.controller';

const router = Router();
router.use(authenticate, requireRole('LINE_MANAGER', 'FINANCE_OFFICER'));

router.get('/claims', managerController.getPendingClaims);
router.get('/claims/:claimId', managerController.getClaimForReview);
router.post('/claims/:claimId/approve', managerController.approveClaim);
router.post('/claims/:claimId/reject', managerController.rejectClaim);
router.post('/claims/:claimId/request-changes', managerController.requestChanges);

export default router;
