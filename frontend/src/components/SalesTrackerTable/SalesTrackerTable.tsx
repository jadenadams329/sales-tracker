import { useEffect, useMemo } from "react"
import { useSaleStore } from "../../store/SaleStore"
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
} from "@tanstack/react-table"
import { Sale } from "src/interfaces"
import { FaEdit } from "react-icons/fa"
import "./SalesTrackerTable.css"

function SalesTrackerTable() {
    const columnHelper = createColumnHelper<Sale>()

    const columns = useMemo(() => [
        columnHelper.accessor('accountNumber', {
            header: 'Account #',
            cell: info => info.getValue(),
            size: 125
        }),
        columnHelper.accessor('agreementLength', {
            header: 'Agreement',
            cell: info => info.getValue(),
            size: 125
        }),
        columnHelper.accessor('planType', {
            header: 'Plan',
            cell: info => info.getValue(),
            size: 100
        }),
        columnHelper.accessor('initialPrice', {
            header: 'Initial',
            cell: info => `$${info.getValue().toFixed(0)}`,
            size: 100
        }),
        columnHelper.accessor('monthlyPrice', {
            header: 'Monthly',
            cell: info => `$${info.getValue().toFixed(0)}`,
            size: 100
        }),
        columnHelper.accessor('autopay', {
            header: 'Autopay',
            cell: info => info.getValue(),
            size: 100
        }),
        columnHelper.accessor('serviceDate', {
            header: 'Service Date',
            cell: info => info.getValue(),
            size: 120
        }),
        columnHelper.accessor('serviced', {
            header: 'Serviced',
            cell: info => info.getValue(),
            size: 100
        }),
        columnHelper.accessor('id', {
            header: 'Action',
            cell: () => (
                <button className="edit-button" title="Edit">
                    <FaEdit />
                </button>
            ),
            size: 100
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
                                <th key={header.id} style={{ width: `${header.getSize()}px` }}>
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
