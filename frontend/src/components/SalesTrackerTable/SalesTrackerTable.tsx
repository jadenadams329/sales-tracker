import { useEffect, useMemo } from "react"
import { useSaleStore } from "../../store/SaleStore"
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
} from "@tanstack/react-table"
import { Sale } from "src/interfaces"
function SalesTrackerTable() {


    const columnHelper = createColumnHelper<Sale>()

    const columns = useMemo(() => [
        columnHelper.accessor('accountNumber', {
            header: 'Account #',
            cell: info => info.getValue()
        }),
        columnHelper.accessor('agreementLength', {
            header: 'Agreement Length',
            cell: info => info.getValue()
        }),
        columnHelper.accessor('planType', {
            header: 'Plan Type',
            cell: info => info.getValue()
        }),
        columnHelper.accessor('initialPrice', {
            header: 'Initial Price',
            cell: info => `$${info.getValue().toFixed(2)}`
        }),
        columnHelper.accessor('monthlyPrice', {
            header: 'Monthly Price',
            cell: info => `$${info.getValue().toFixed(2)}`
        }),
        columnHelper.accessor('autopay', {
            header: 'Autopay',
            cell: info => info.getValue()
        }),
        columnHelper.accessor('serviceDate', {
            header: 'Service Date',
            cell: info => info.getValue()
        }),
        columnHelper.accessor('serviced', {
            header: 'Serviced',
            cell: info => info.getValue()
        })
    ], [])

    const setSales = useSaleStore((state) => state.setSales)
    const sales = useSaleStore((state) => state.sales)

    const table = useReactTable({
        data: sales,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    useEffect(() => {
        setSales()
    },[setSales])

    return (
        <div className="sales-table-container">
            <table className="sales-table">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default SalesTrackerTable
