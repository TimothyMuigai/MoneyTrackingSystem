import { createContext, useState, useEffect } from "react";
import CurrencyAPI from "@everapi/currencyapi-js";
import useCurrency from "@/Utils/useCurrency";

const CurrencyContext = createContext();

export default CurrencyContext;

export const CurrencyProvider = ({ children }) => {
  const storedData = JSON.parse(localStorage.getItem("currenciesData")) || {};

  const savedCurrency = localStorage.getItem("selectedCurrency") || "KES";
  const [toCurrency, setToCurrency] = useState(savedCurrency);
  const [exchangeRates, setExchangeRates] = useState(storedData.rates || {});

  const { data, loaded } = useCurrency("https://restcountries.com/v3.1/all?fields=name,currencies,flags");
  const filteredData = data.filter(item => "currencies" in item);

  const countries = filteredData.map((item) => ({
    flag: item.flags.png,
    currencyCode: Object.keys(item.currencies)[0],
    countryName: item.name.common,
  }));

  const isDataExpired = (timestamp) => {
    if (!timestamp) return true;
    return new Date().getTime() - timestamp > 24 * 60 * 60 * 1000;
  };

  useEffect(() => {
    const cleanedData = { rates: {}, timestamps: {} };

    Object.keys(storedData.rates || {}).forEach((currency) => {
      if (!isDataExpired(storedData.timestamps[currency])) {
        cleanedData.rates[currency] = storedData.rates[currency];
        cleanedData.timestamps[currency] = storedData.timestamps[currency];
      }
    });

    localStorage.setItem("currenciesData", JSON.stringify(cleanedData));
    setExchangeRates(cleanedData.rates);
  }, []);


  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (exchangeRates[toCurrency] && !isDataExpired(storedData.timestamps?.[toCurrency])) {
        return;
      }

      try {
        const currencyApi = new CurrencyAPI(import.meta.env.VITE_APP_API_KEY);
        const response = await currencyApi.latest({ base_currency: "KES" });
        const rate = response.data[toCurrency]?.value || 1;

        const updatedData = {
          rates: { ...exchangeRates, [toCurrency]: rate },
          timestamps: { ...(storedData.timestamps || {}), [toCurrency]: new Date().getTime() }
        };

        localStorage.setItem("currenciesData", JSON.stringify(updatedData));
        localStorage.setItem("selectedCurrency", toCurrency);
        setExchangeRates(updatedData.rates);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    };

    fetchExchangeRate();
  }, [toCurrency]);

  const contextData = {
    toCurrency,
    setToCurrency,
    exchangeRates,
    countries,
    loaded,
  };

  return (
    <CurrencyContext.Provider value={contextData}>
      {children}
    </CurrencyContext.Provider>
  );
};
