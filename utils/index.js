export const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "decimal",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const parseNumber = (value) => parseInt(value.replace(/\./g, "")) || 0;
