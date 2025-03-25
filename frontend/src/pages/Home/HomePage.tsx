import { useSaleStore } from "../../store/SaleStore";
import { useEffect } from "react";

function HomePage() {
  const sales = useSaleStore((state) => state.sales);
  useEffect(() => {
    useSaleStore.getState().getSales();
  }, []);
  return (
    <div>
      <h1>Home</h1>
    </div>
  )
}

export default HomePage
