import React from 'react';

export const ReportHeader = () => (
  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
    <div>
      <h1 className="brand-heading text-3xl text-symbol-black mb-2">
        Relatórios Mensais
      </h1>
      <div className="w-12 h-px bg-symbol-gold mb-4"></div>
      <p className="brand-body text-symbol-gray-600">
        Análise completa do desempenho financeiro
      </p>
    </div>
  </div>
);
