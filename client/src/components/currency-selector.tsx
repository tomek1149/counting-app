import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const currencies = {
  PLN: { symbol: "zł", rate: 4.02 },
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.93 },
  GBP: { symbol: "£", rate: 0.79 },
  JPY: { symbol: "¥", rate: 149.35 },
  AUD: { symbol: "A$", rate: 1.53 },
};

export type CurrencyCode = keyof typeof currencies;

interface CurrencySelectorProps {
  value: CurrencyCode;
  onValueChange: (value: CurrencyCode) => void;
}

export default function CurrencySelector({ value, onValueChange }: CurrencySelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[100px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(currencies).map(([code]) => (
          <SelectItem key={code} value={code}>
            {code} ({currencies[code as CurrencyCode].symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}