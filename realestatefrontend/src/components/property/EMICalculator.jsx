// src/components/property/EMICalculator.jsx
import { useState } from 'react';
import { Calculator, IndianRupee, Percent, Calendar, TrendingUp, Lock, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const EMICalculator = ({ price, className = '' }) => {
  const [loanAmount, setLoanAmount] = useState(price || 5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [showDetails, setShowDetails] = useState(false);

  const calculateEMI = () => {
    const principal = loanAmount;
    const ratePerMonth = interestRate / 12 / 100;
    const months = loanTenure * 12;
    
    if (ratePerMonth === 0) return { emi: principal / months, totalPayment: principal, totalInterest: 0 };
    
    const emi = principal * ratePerMonth * Math.pow(1 + ratePerMonth, months) / (Math.pow(1 + ratePerMonth, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;
    
    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest)
    };
  };

  const { emi, totalPayment, totalInterest } = calculateEMI();

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const formatCurrencyFull = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">EMI Calculator</h3>
          <p className="text-sm text-gray-500">Calculate your monthly payments</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <label className="text-gray-700 font-medium">Loan Amount</label>
            <span className="text-primary-600 font-semibold">{formatCurrency(loanAmount)}</span>
          </div>
          <input
            type="range"
            min={price * 0.1 || 100000}
            max={price || 10000000}
            step={100000}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatCurrency(price * 0.1 || 100000)}</span>
            <span>{formatCurrency(price || 10000000)}</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <label className="text-gray-700 font-medium">Interest Rate</label>
            <span className="text-primary-600 font-semibold">{interestRate}%</span>
          </div>
          <input
            type="range"
            min="2"
            max="15"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2%</span>
            <span>15%</span>
          </div>
        </div>

        {/* Loan Tenure */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <label className="text-gray-700 font-medium">Loan Tenure</label>
            <span className="text-primary-600 font-semibold">{loanTenure} Years</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={loanTenure}
            onChange={(e) => setLoanTenure(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5 Years</span>
            <span>30 Years</span>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl border border-primary-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">Monthly EMI</p>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(emi)}</p>
          </div>
          <div className="text-center border-l border-r border-primary-200/50 px-2">
            <p className="text-xs text-gray-500">Total Interest</p>
            <p className="text-lg font-bold text-orange-600">{formatCurrency(totalInterest)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Payment</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalPayment)}</p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <Info className="w-4 h-4" />
          {showDetails ? 'Hide Details' : 'View Detailed Breakdown'}
        </button>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Principal Amount</span>
                <span className="font-medium text-gray-900">{formatCurrencyFull(loanAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Interest</span>
                <span className="font-medium text-orange-600">{formatCurrencyFull(totalInterest)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Total Payment</span>
                <span className="font-bold text-gray-900">{formatCurrencyFull(totalPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Payment</span>
                <span className="font-semibold text-primary-600">{formatCurrencyFull(emi)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            This is an estimated EMI calculation. Actual rates may vary based on bank policies, 
            credit score, and other factors. Please consult your bank for accurate calculations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;