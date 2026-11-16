import { Router } from 'express';
import {
    createPaymentIntent,
    confirmAppointmentPayment,
    getPriorityPrice
} from '../controllers/payments.controller.js';

const router = Router();


router.get('/priority-price', getPriorityPrice);
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-appointment', confirmAppointmentPayment);

export default router;