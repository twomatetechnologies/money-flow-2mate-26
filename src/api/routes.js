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
import * as familyMembers from './familyMembers.js';
import * as insurance from './insurance.js';
import * as goldInvestments from './goldInvestments.js';
import * as goals from './goals.js';
import refreshStockPrices from './stocks/refresh-prices.js';

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

// Family Members routes (kebab-case)
router.get('/family-members', familyMembers.getAllFamilyMembers);
router.post('/family-members', familyMembers.createFamilyMember);
router.get('/family-members/:id', familyMembers.getFamilyMemberById);
router.put('/family-members/:id', familyMembers.updateFamilyMember);
router.delete('/family-members/:id', familyMembers.deleteFamilyMember);

// Family Members routes (camelCase - for frontend compatibility)
router.get('/familyMembers', familyMembers.getAllFamilyMembers);
router.post('/familyMembers', familyMembers.createFamilyMember);
router.get('/familyMembers/:id', familyMembers.getFamilyMemberById);
router.put('/familyMembers/:id', familyMembers.updateFamilyMember);
router.delete('/familyMembers/:id', familyMembers.deleteFamilyMember);

// Fixed Deposits routes (kebab-case)
router.get('/fixed-deposits', fixedDeposits.getAllFixedDeposits);
router.get('/fixed-deposits/:id', fixedDeposits.getFixedDepositById);
router.post('/fixed-deposits', fixedDeposits.createFixedDeposit);
router.put('/fixed-deposits/:id', fixedDeposits.updateFixedDeposit);
router.delete('/fixed-deposits/:id', fixedDeposits.deleteFixedDeposit);

// Fixed Deposits routes (camelCase - for frontend compatibility)
router.get('/fixedDeposits', fixedDeposits.getAllFixedDeposits);
router.get('/fixedDeposits/:id', fixedDeposits.getFixedDepositById);
router.post('/fixedDeposits', fixedDeposits.createFixedDeposit);
router.put('/fixedDeposits/:id', fixedDeposits.updateFixedDeposit);
router.delete('/fixedDeposits/:id', fixedDeposits.deleteFixedDeposit);

// Savings Accounts routes (kebab-case)
router.get('/savings-accounts', savingsAccounts.getAllSavingsAccounts);
router.get('/savings-accounts/:id', savingsAccounts.getSavingsAccountById);
router.post('/savings-accounts', savingsAccounts.createSavingsAccount);
router.put('/savings-accounts/:id', savingsAccounts.updateSavingsAccount);
router.delete('/savings-accounts/:id', savingsAccounts.deleteSavingsAccount);

// Savings Accounts routes (camelCase - for frontend compatibility)
router.get('/savingsAccounts', savingsAccounts.getAllSavingsAccounts);
router.get('/savingsAccounts/:id', savingsAccounts.getSavingsAccountById);
router.post('/savingsAccounts', savingsAccounts.createSavingsAccount);
router.put('/savingsAccounts/:id', savingsAccounts.updateSavingsAccount);
router.delete('/savingsAccounts/:id', savingsAccounts.deleteSavingsAccount);

// SIP Investments routes (kebab-case)
router.get('/sip-investments', sipInvestments.getAllSIPInvestments);
router.get('/sip-investments/:id', sipInvestments.getSIPInvestmentById);
router.post('/sip-investments', sipInvestments.createSIPInvestment);
router.put('/sip-investments/:id', sipInvestments.updateSIPInvestment);
router.delete('/sip-investments/:id', sipInvestments.deleteSIPInvestment);

// SIP Investments routes (camelCase - for frontend compatibility)
router.get('/sipInvestments', sipInvestments.getAllSIPInvestments);
router.get('/sipInvestments/:id', sipInvestments.getSIPInvestmentById);
router.post('/sipInvestments', sipInvestments.createSIPInvestment);
router.put('/sipInvestments/:id', sipInvestments.updateSIPInvestment);
router.delete('/sipInvestments/:id', sipInvestments.deleteSIPInvestment);

// Stocks routes
router.get('/stocks', stocks.getAllStocks);
router.get('/stocks/:id', stocks.getStockById);
router.post('/stocks', stocks.createStock);
router.put('/stocks/:id', stocks.updateStock);
router.delete('/stocks/:id', stocks.deleteStock);

// Add route for refreshing stock prices
router.post('/stocks/refresh-prices', refreshStockPrices);

// Stock price scheduler routes 
router.get('/stocks/scheduler/status', (req, res) => {
  // This route is implemented directly in server.js
  // Just forwarding the request
  req.app.get('/api/stocks/scheduler/status')(req, res);
});

router.post('/stocks/scheduler/force-update', (req, res) => {
  // This route is implemented directly in server.js
  // Just forwarding the request
  req.app.post('/api/stocks/scheduler/force-update')(req, res);
});

// Provident Funds routes (kebab-case)
router.get('/provident-funds', providentFunds.getAllProvidentFunds);
router.get('/provident-funds/:id', providentFunds.getProvidentFundById);
router.post('/provident-funds', providentFunds.createProvidentFund);
router.put('/provident-funds/:id', providentFunds.updateProvidentFund);
router.delete('/provident-funds/:id', providentFunds.deleteProvidentFund);

// Provident Funds routes (camelCase - for frontend compatibility)
router.get('/providentFunds', providentFunds.getAllProvidentFunds);
router.get('/providentFunds/:id', providentFunds.getProvidentFundById);
router.post('/providentFunds', providentFunds.createProvidentFund);
router.put('/providentFunds/:id', providentFunds.updateProvidentFund);
router.delete('/providentFunds/:id', providentFunds.deleteProvidentFund);

// Insurance Policies routes (kebab-case)
router.get('/insurance-policies', insurance.getAllInsurancePolicies);
router.get('/insurance-policies/:id', insurance.getInsurancePolicyById);
router.post('/insurance-policies', insurance.createInsurancePolicy);
router.put('/insurance-policies/:id', insurance.updateInsurancePolicy);
router.delete('/insurance-policies/:id', insurance.deleteInsurancePolicy);

// Insurance Policies routes (camelCase - for frontend compatibility)
router.get('/insurancePolicies', insurance.getAllInsurancePolicies);
router.get('/insurancePolicies/:id', insurance.getInsurancePolicyById);
router.post('/insurancePolicies', insurance.createInsurancePolicy);
router.put('/insurancePolicies/:id', insurance.updateInsurancePolicy);
router.delete('/insurancePolicies/:id', insurance.deleteInsurancePolicy);

// Audit Records routes (kebab-case)
router.get('/audit-records', auditRecords.getAllAuditRecords);
router.get('/audit-records/entity/:entityId', auditRecords.getAuditRecordsByEntityId);
router.get('/audit-records/type/:entityType', auditRecords.getAuditRecordsByEntityType);
router.post('/audit-records', auditRecords.createAuditRecord);

// Audit Records routes (camelCase - for frontend compatibility)
router.get('/auditRecords', auditRecords.getAllAuditRecords);
router.get('/auditRecords/entity/:entityId', auditRecords.getAuditRecordsByEntityId);
router.get('/auditRecords/type/:entityType', auditRecords.getAuditRecordsByEntityType);
router.post('/auditRecords', auditRecords.createAuditRecord);

// User routes
router.get('/users', users.getAllUsers);
router.get('/users/:id', users.getUserById);
router.post('/users', users.createUser);
router.put('/users/:id', users.updateUser);
router.delete('/users/:id', users.deleteUser);
router.put('/users/:id/password', users.updateUserPassword);
router.post('/users/:id/reset-password', users.resetUserPassword);

// Gold Investments routes (kebab-case)
router.get('/gold-investments', goldInvestments.getAllGoldInvestments);
router.get('/gold-investments/:id', goldInvestments.getGoldInvestmentById);
router.post('/gold-investments', goldInvestments.createGoldInvestment);
router.put('/gold-investments/:id', goldInvestments.updateGoldInvestment);
router.delete('/gold-investments/:id', goldInvestments.deleteGoldInvestment);

// Gold Investments routes (camelCase - for frontend compatibility)
router.get('/goldInvestments', goldInvestments.getAllGoldInvestments);
router.get('/goldInvestments/:id', goldInvestments.getGoldInvestmentById);
router.post('/goldInvestments', goldInvestments.createGoldInvestment);
router.put('/goldInvestments/:id', goldInvestments.updateGoldInvestment);
router.delete('/goldInvestments/:id', goldInvestments.deleteGoldInvestment);

// Financial Goals routes
router.get('/goals', goals.getAllGoals);
router.get('/goals/:id', goals.getGoalById);
router.post('/goals', goals.createGoal);
router.put('/goals/:id', goals.updateGoal);
router.delete('/goals/:id', goals.deleteGoal);

export default router;
