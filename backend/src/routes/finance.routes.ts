import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as financeController from '../controllers/finance.controller';

const router = Router();
router.use(authenticate, requireRole('FINANCE_OFFICER'));

router.get('/claims', financeController.getApprovedClaims);
router.get('/claims/:claimId', financeController.getClaimForProcessing);
router.post('/claims/:claimId/reimburse', financeController.processReimbursement);

export default router;
