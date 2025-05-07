
/**
 * API Routes configuration
 */
const express = require('express');
const fixedDeposits = require('./fixedDeposits');

const router = express.Router();

// Fixed Deposits routes
router.get('/fixed-deposits', fixedDeposits.getAllFixedDeposits);
router.get('/fixed-deposits/:id', fixedDeposits.getFixedDepositById);
router.post('/fixed-deposits', fixedDeposits.createFixedDeposit);
router.put('/fixed-deposits/:id', fixedDeposits.updateFixedDeposit);
router.delete('/fixed-deposits/:id', fixedDeposits.deleteFixedDeposit);

module.exports = router;
