/* GAP Roofing & Construction — Job Profitability Engine
 * Shared calculation module for insurance, retail and cash jobs.
 */
(function (global) {
  "use strict";

  function num(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function hasValue(value) {
    return value !== undefined && value !== null && value !== "";
  }

  function money(value) {
    return Math.round((num(value) + Number.EPSILON) * 100) / 100;
  }

  function calculateJobProfitability(job) {
    job = job || {};

    var jobType = String(job.jobType || "Insurance");
    var isInsurance = jobType === "Insurance";
    var contractAmount = num(job.contractAmount);
    var rcv = num(job.rcv);
    var deductible = num(job.deductible);
    var acv = num(job.acv);
    var recoverableDepreciation = num(job.recoverableDepreciation);
    var approvedSupplements = num(job.approvedSupplements);

    var insuranceExpected = isInsurance
      ? (hasValue(job.insuranceExpected)
          ? num(job.insuranceExpected)
          : Math.max(0, rcv + approvedSupplements - deductible))
      : 0;

    var firstInsurancePayment = num(job.firstInsurancePayment);
    var depreciationReceived = num(job.depreciationReceived);
    var supplementPaymentsReceived = num(job.supplementPaymentsReceived);
    var insuranceReceived = isInsurance
      ? (hasValue(job.insuranceReceived)
          ? num(job.insuranceReceived)
          : firstInsurancePayment + depreciationReceived + supplementPaymentsReceived)
      : 0;

    var deductibleCollected = num(job.deductibleCollected);
    var otherCustomerPayments = num(job.otherCustomerPayments);
    var retailCustomerPayments = hasValue(job.customerPaymentsReceived)
      ? num(job.customerPaymentsReceived)
      : num(job.amountPaid);

    var customerReceived = isInsurance
      ? deductibleCollected + otherCustomerPayments
      : retailCustomerPayments + otherCustomerPayments;

    var insuranceJobValue = rcv + approvedSupplements;
    var nonInsuranceJobValue = contractAmount;
    var totalJobValue = isInsurance ? insuranceJobValue : nonInsuranceJobValue;
    var totalCollected = insuranceReceived + customerReceived;

    var materialCost = num(job.materialCost);
    var roofSquares = num(job.roofSquares);
    var roofLaborRate = hasValue(job.roofLaborRate) ? num(job.roofLaborRate) : 75;
    var calculatedRoofLabor = roofSquares * roofLaborRate;
    var roofLabor = hasValue(job.roofLabor) && num(job.roofLabor) !== 0
      ? num(job.roofLabor)
      : calculatedRoofLabor;
    var interiorLabor = num(job.interiorLabor);
    var dumpDisposal = num(job.dumpDisposal);
    var permits = num(job.permits);
    var delivery = num(job.delivery);
    var otherCosts = num(job.otherCosts);

    var commissionRate = hasValue(job.commissionRate) ? num(job.commissionRate) : 0.10;

    // Insurance jobs: GAP policy is commission on insurance money expected,
    // excluding the customer deductible. Retail/cash jobs fall back to contract value
    // unless a manual commission base or sales commission is supplied.
    var defaultCommissionBase = isInsurance ? insuranceExpected : contractAmount;
    var commissionBase = hasValue(job.commissionBase) ? num(job.commissionBase) : defaultCommissionBase;
    var salesCommission = hasValue(job.salesCommission)
      ? num(job.salesCommission)
      : (hasValue(job.commission) && num(job.commission) !== 0
          ? num(job.commission)
          : commissionBase * commissionRate);

    var totalCosts = materialCost + roofLabor + interiorLabor + dumpDisposal + permits + delivery + otherCosts + salesCommission;
    var projectedProfit = totalJobValue - totalCosts;
    var finalProfit = totalCollected - totalCosts;
    var projectedMarginPct = totalJobValue > 0 ? (projectedProfit / totalJobValue) * 100 : 0;
    var finalMarginPct = totalCollected > 0 ? (finalProfit / totalCollected) * 100 : 0;
    var insuranceBalance = isInsurance ? Math.max(0, insuranceExpected - insuranceReceived) : 0;
    var customerExpected = isInsurance ? deductible + num(job.customerContractExtras) : totalJobValue;
    var customerBalance = Math.max(0, customerExpected - customerReceived);

    return {
      jobType: jobType,
      isInsurance: isInsurance,
      contractAmount: money(contractAmount),
      rcv: money(rcv),
      acv: money(acv),
      deductible: money(deductible),
      recoverableDepreciation: money(recoverableDepreciation),
      approvedSupplements: money(approvedSupplements),
      insuranceExpected: money(insuranceExpected),
      insuranceReceived: money(insuranceReceived),
      insuranceBalance: money(insuranceBalance),
      customerReceived: money(customerReceived),
      customerBalance: money(customerBalance),
      totalJobValue: money(totalJobValue),
      totalCollected: money(totalCollected),
      materialCost: money(materialCost),
      roofSquares: roofSquares,
      roofLaborRate: money(roofLaborRate),
      calculatedRoofLabor: money(calculatedRoofLabor),
      roofLabor: money(roofLabor),
      interiorLabor: money(interiorLabor),
      dumpDisposal: money(dumpDisposal),
      permits: money(permits),
      delivery: money(delivery),
      otherCosts: money(otherCosts),
      commissionRate: commissionRate,
      commissionBase: money(commissionBase),
      salesCommission: money(salesCommission),
      totalCosts: money(totalCosts),
      projectedProfit: money(projectedProfit),
      finalProfit: money(finalProfit),
      projectedMarginPct: money(projectedMarginPct),
      finalMarginPct: money(finalMarginPct)
    };
  }

  global.GAPProfitability = {
    calculate: calculateJobProfitability
  };
})(typeof window !== "undefined" ? window : globalThis);
