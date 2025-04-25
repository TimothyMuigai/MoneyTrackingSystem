import { useState, useEffect, useContext } from "react";
import { Check, ChevronsUpDown, CurrencyIcon } from "lucide-react";
import { Command, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SettingSection from "./SettingSection";
import CurrencyContext from "@/context/CurrencyContext";

export default function Currency() {
  const { toCurrency, setToCurrency, exchangeRates, countries, loaded } = useContext(CurrencyContext);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const storedCurrency = localStorage.getItem("selectedCurrency");
    if (storedCurrency) {
      const foundCountry = countries.find(country => country.currencyCode === storedCurrency);
      if (foundCountry) setSelected(foundCountry);
    }
  }, [countries]);

  return (
    <SettingSection icon={CurrencyIcon} title={"Currency Conversion"}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <p className="text-sm md:text-base">Select currency: (Default Kenyan Currency)</p> 
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[250px] flex items-center justify-between bg-gray-800 text-white">
              {selected ? (
                <div className="flex items-center gap-2">
                  <img src={selected.flag} alt="Flag" className="w-6 h-6 rounded-full" />
                  {selected.currencyCode} - {selected.countryName}
                </div>
              ) : (
                "Select a country"
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0 max-h-[300px] overflow-y-auto">
            <Command>
              <CommandInput placeholder="Search name..." />
              <CommandGroup>
                <CommandItem
                  value="KES"
                  onSelect={() => {
                    setSelected(null);
                    setToCurrency("KES");
                    localStorage.setItem("selectedCurrency", "KES");
                    setOpen(false);
                  }}
                  className="cursor-pointer hover:bg-gray-700 hover:text-white p-2 rounded-md transition flex items-center gap-3"
                >
                  <img src="finish.png" alt="Flag" className="w-6 h-6 rounded-full" />
                  <span>None - (Default)</span>
                  <Check className={cn("ml-auto h-4 w-4", !selected ? "opacity-100" : "opacity-0")} />
                </CommandItem>
                {loaded
                  ? Array(5).fill(0).map((_, index) => (
                      <div key={index} className="flex items-center gap-3 p-2">
                        <div className="w-6 h-6 bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-32 h-4 bg-gray-500 rounded animate-pulse"></div>
                      </div>
                    ))
                  : countries.map((country, index) => (
                      <CommandItem
                        key={index}
                        value={`${country.currencyCode} ${country.countryName}`}
                        onSelect={() => {
                          setSelected(country);
                          setToCurrency(country.currencyCode);
                          localStorage.setItem("selectedCurrency", country.currencyCode);
                          setOpen(false);
                        }}
                        className="cursor-pointer hover:bg-gray-700 hover:text-white p-2 rounded-md transition flex items-center gap-3"
                      >
                        <img src={country.flag} alt="Flag" className="w-6 h-6 rounded-full" />
                        <span>{country.currencyCode} - {country.countryName}</span>
                        <Check className={cn("ml-auto h-4 w-4", selected?.currencyCode === country.currencyCode ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-gray-400 text-sm md:text-base">
        Exchange Rate: 1 KES = {exchangeRates[toCurrency] || 1} {toCurrency}
      </p>
    </SettingSection>
  );
}
