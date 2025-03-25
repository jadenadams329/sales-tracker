
import { useSaleStore } from "../../store/SaleStore";
import { useEffect } from "react";
import SalesTrackerTable from "../../components/SalesTrackerTable/SalesTrackerTable";

function HomePage() {
  // const sales = useSaleStore((state) => state.sales);
  // useEffect(() => {
  //   useSaleStore.getState().setSales();
  // }, []);

  return (
    <div>
      <h1>Home</h1>
      <SalesTrackerTable />
    </div>
  )
}

export default HomePage
