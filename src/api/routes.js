
/**
 * API Routes configuration
 */
import express from 'express';
import * as fixedDeposits from './fixedDeposits.js';
import * as savingsAccounts from './savingsAccounts.js';
import * as sipInvestments from './sipInvestments.js';
import * as stocks from './stocks.js';
import * as providentFunds from './providentFunds.js';
import * as auditRecords from './auditRecords.js';
import * as users from './users.js';
import * as settings from './settings.js';
import * as auth from './auth.js';

const router = express.Router();

// Health check route
router.get('/health-check', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes
router.post('/auth/login', auth.login);
router.post('/auth/two-factor', auth.verifyTwoFactor);
router.post('/auth/logout', auth.logout);
router.post('/auth/refresh-token', auth.refreshToken);

// Settings routes
router.get('/settings', settings.getSettings);
router.put('/settings', settings.updateSettings);

// Fixed Deposits routes
router.get('/fixed-deposits', fixedDeposits.getAllFixedDeposits);
router.get('/fixed-deposits/:id', fixedDeposits.getFixedDepositById);
router.post('/fixed-deposits', fixedDeposits.createFixedDeposit);
router.put('/fixed-deposits/:id', fixedDeposits.updateFixedDeposit);
router.delete('/fixed-deposits/:id', fixedDeposits.deleteFixedDeposit);

// Savings Accounts routes
router.get('/savings-accounts', savingsAccounts.getAllSavingsAccounts);
router.get('/savings-accounts/:id', savingsAccounts.getSavingsAccountById);
router.post('/savings-accounts', savingsAccounts.createSavingsAccount);
router.put('/savings-accounts/:id', savingsAccounts.updateSavingsAccount);
router.delete('/savings-accounts/:id', savingsAccounts.deleteSavingsAccount);

// SIP Investments routes
router.get('/sip-investments', sipInvestments.getAllSIPInvestments);
router.get('/sip-investments/:id', sipInvestments.getSIPInvestmentById);
router.post('/sip-investments', sipInvestments.createSIPInvestment);
router.put('/sip-investments/:id', sipInvestments.updateSIPInvestment);
router.delete('/sip-investments/:id', sipInvestments.deleteSIPInvestment);

// Stocks routes
router.get('/stocks', stocks.getAllStocks);
router.get('/stocks/:id', stocks.getStockById);
router.post('/stocks', stocks.createStock);
router.put('/stocks/:id', stocks.updateStock);
router.delete('/stocks/:id', stocks.deleteStock);

// Provident Funds routes
router.get('/provident-funds', providentFunds.getAllProvidentFunds);
router.get('/provident-funds/:id', providentFunds.getProvidentFundById);
router.post('/provident-funds', providentFunds.createProvidentFund);
router.put('/provident-funds/:id', providentFunds.updateProvidentFund);
router.delete('/provident-funds/:id', providentFunds.deleteProvidentFund);

// Audit Records routes
router.get('/audit-records', auditRecords.getAllAuditRecords);
router.get('/audit-records/entity/:entityId', auditRecords.getAuditRecordsByEntityId);
router.get('/audit-records/type/:entityType', auditRecords.getAuditRecordsByEntityType);
router.post('/audit-records', auditRecords.createAuditRecord);

// User routes
router.get('/users', users.getAllUsers);
router.get('/users/:id', users.getUserById);
router.post('/users', users.createUser);
router.put('/users/:id', users.updateUser);
router.delete('/users/:id', users.deleteUser);
router.put('/users/:id/password', users.updateUserPassword);
router.post('/users/:id/reset-password', users.resetUserPassword);

export default router;
