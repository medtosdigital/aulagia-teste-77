
import { useState, useEffect } from 'react';
import { planPermissionsService, PlanPermissions } from '@/services/planPermissionsService';

export interface UsePlanPermissionsReturn {
  permissions: PlanPermissions;
  canCreateMaterial: (materialType?: string) => { allowed: boolean; reason?: string };
  canDownloadFormat: (format: string) => boolean;
  canEditMaterials: () => boolean;
  incrementUsage: () => void;
  refreshPermissions: () => void;
  remainingMaterials: number;
  usagePercentage: number;
  isAtLimit: boolean;
}

export const usePlanPermissions = (): UsePlanPermissionsReturn => {
  const [permissions, setPermissions] = useState<PlanPermissions>(
    planPermissionsService.getPlanPermissions()
  );

  const refreshPermissions = () => {
    setPermissions(planPermissionsService.getPlanPermissions());
  };

  useEffect(() => {
    refreshPermissions();
  }, []);

  const canCreateMaterial = (materialType?: string) => {
    return planPermissionsService.canCreateMaterial(materialType);
  };

  const canDownloadFormat = (format: string) => {
    return planPermissionsService.canDownloadFormat(format);
  };

  const canEditMaterials = () => {
    return planPermissionsService.canEditMaterials();
  };

  const incrementUsage = () => {
    planPermissionsService.incrementMaterialUsage();
    refreshPermissions();
  };

  const remainingMaterials = planPermissionsService.getRemainingMaterials();
  const usagePercentage = planPermissionsService.getUsagePercentage();
  const isAtLimit = remainingMaterials === 0;

  return {
    permissions,
    canCreateMaterial,
    canDownloadFormat,
    canEditMaterials,
    incrementUsage,
    refreshPermissions,
    remainingMaterials,
    usagePercentage,
    isAtLimit
  };
};
