import { v4 as uuidv4 } from 'uuid';
import { FixedDeposit } from '@/types';
import { createAuditRecord } from './auditService';
import * as fixedDepositDbService from './db/fixedDepositDbService';

// CRUD operations for Fixed Deposits always using database
export const createFixedDeposit = async (fd: Partial<FixedDeposit>): Promise<FixedDeposit> => {
  return await fixedDepositDbService.addFixedDeposit(fd);
};

export const updateFixedDeposit = async (id: string, updates: Partial<FixedDeposit>): Promise<FixedDeposit | null> => {
  return await fixedDepositDbService.updateFixedDeposit(id, updates);
};

export const deleteFixedDeposit = async (id: string): Promise<boolean> => {
  return await fixedDepositDbService.deleteFixedDeposit(id);
};

export const getFixedDepositById = async (id: string): Promise<FixedDeposit | null> => {
  return await fixedDepositDbService.getFixedDepositById(id);
};

export const getFixedDeposits = async (): Promise<FixedDeposit[]> => {
  return await fixedDepositDbService.getFixedDeposits();
};
