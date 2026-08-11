/* GAP Roofing & Construction — Job Profitability Engine
 * Isolated calculation module so insurance financial logic can be tested
 * before wiring it into the production CRM UI.
 */
(function (global) {
  "use strict";

  function num(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function money(value) {
    return Math.round((num(value) + Number.EPSILON) * 100) / 100;
  }

  function calculateJobProfitability(job) {
    job = job || {};

    var rcv = num(job.rcv);
    var deductible = num(job.deductible);
    var acv = num(job.acv);
    var recoverableDepreciation = num(job.recoverableDepreciation);
    var approvedSupplements = num(job.approvedSupplements);

    // Insurance expected excludes the customer's deductible.
    // If supplied explicitly, use it. Otherwise derive from RCV + supplements - deductible.
    var insuranceExpected = job.insuranceExpected !== undefined && job.insuranceExpected !== ""
      ? num(job.insuranceExpected)
      : Math.max(0, rcv + approvedSupplements - deductible);

    var firstInsurancePayment = num(job.firstInsurancePayment);
    var depreciationReceived = num(job.depreciationReceived);
    var supplementPaymentsReceived = num(job.supplementPaymentsReceived);
    var insuranceReceived = job.insuranceReceived !== undefined && job.insuranceReceived !== ""
      ? num(job.insuranceReceived)
      : firstInsurancePayment + depreciationReceived + supplementPaymentsReceived;

    var deductibleCollected = num(job.deductibleCollected);
    var otherCustomerPayments = num(job.otherCustomerPayments);
    var customerReceived = deductibleCollected + otherCustomerPayments;

    var totalJobValue = rcv + approvedSupplements;
    var totalCollected = insuranceReceived + customerReceived;

    var materialCost = num(job.materialCost);
    var roofLabor = num(job.roofLabor);
    var interiorLabor = num(job.interiorLabor);
    var dumpDisposal = num(job.dumpDisposal);
    var permits = num(job.permits);
    var delivery = num(job.delivery);
    var otherCosts = num(job.otherCosts);

    var commissionRate = job.commissionRate !== undefined && job.commissionRate !== ""
      ? num(job.commissionRate)
      : 0.10;

    // GAP policy: sales commission is based on what insurance pays,
    // not on the customer's deductible.
    var commissionBase = job.commissionBase !== undefined && job.commissionBase !== ""
      ? num(job.commissionBase)
      : insuranceExpected;

    var salesCommission = job.salesCommission !== undefined && job.salesCommission !== ""
      ? num(job.salesCommission)
      : commissionBase * commissionRate;

    var totalCosts = materialCost + roofLabor + interiorLabor + dumpDisposal + permits + delivery + otherCosts + salesCommission;
    var projectedProfit = totalJobValue - totalCosts;
    var finalProfit = totalCollected - totalCosts;
    var projectedMarginPct = totalJobValue > 0 ? (projectedProfit / totalJobValue) * 100 : 0;
    var finalMarginPct = totalCollected > 0 ? (finalProfit / totalCollected) * 100 : 0;
    var insuranceBalance = Math.max(0, insuranceExpected - insuranceReceived);
    var customerBalance = Math.max(0, deductible + num(job.customerContractExtras) - customerReceived);

    return {
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
