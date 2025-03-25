import SalesTable from "../../components/SalesTable/SalesTable";
import { useSaleStore } from "../../store/SaleStore";
import { salesColumns } from "../../components/SalesTable/Columns";
import { useEffect } from "react";

function HomePage() {
  const sales = useSaleStore((state) => state.sales);
  useEffect(() => {
    useSaleStore.getState().getSales();
  }, []);
  return (
    <div>
      <h1>Home</h1>
      <SalesTable columns={salesColumns} data={sales} />
    </div>
  )
}

export default HomePage
