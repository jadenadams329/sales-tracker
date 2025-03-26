import { useEffect, useMemo } from "react";
import { useSaleStore } from "../../store/SaleStore";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { Sale } from "src/interfaces";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import "./SalesTrackerTable.css";

function SalesTrackerTable() {
	const columnHelper = createColumnHelper<Sale>();

	const columns = useMemo(
		() => [
			columnHelper.accessor("accountNumber", {
				header: "Account",
				cell: (info) => info.getValue(),
				size: 125,
			}),
			columnHelper.accessor("agreementLength", {
				header: "Agreement",
				cell: (info) => info.getValue(),
				size: 125,
			}),
			columnHelper.accessor("planType", {
				header: "Plan",
				cell: (info) => info.getValue(),
				size: 100,
			}),
			columnHelper.accessor("initialPrice", {
				header: "Initial",
				cell: (info) => `$${info.getValue().toFixed(0)}`,
				size: 100,
			}),
			columnHelper.accessor("monthlyPrice", {
				header: "Monthly",
				cell: (info) => `$${info.getValue().toFixed(0)}`,
				size: 100,
			}),
			columnHelper.accessor("autopay", {
				header: "Autopay",
				cell: (info) => info.getValue(),
				size: 100,
			}),
			columnHelper.accessor("serviceDate", {
				header: "Service Date",
				cell: (info) => info.getValue(),
				size: 120,
			}),
			columnHelper.accessor("serviced", {
				header: "Serviced",
				cell: (info) => info.getValue(),
				size: 100,
			}),
			{
				id: "actions",
				header: "Action",
				cell: () => (

					<div className="action-column">
						<OpenModalButton
							modalComponent={<div>Edit Sale Modal Coming Soon</div>}
							buttonText="Edit"
							onButtonClick={() => {}}
						/>
					</div>
				),
				size: 100,
			},
		],
		[]
	);

	const setSales = useSaleStore((state) => state.setSales);
	const sales = useSaleStore((state) => state.sales);

	const table = useReactTable({
		data: sales,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageSize: 20,
			},
		},
	});

	useEffect(() => {
		setSales();
	}, [setSales]);

	return (
		<div className='sales-table-container'>
			<table className='sales-table'>
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header, index) => (
								<th
									key={header.id}
									style={{ width: `${header.getSize()}px` }}
									className={index === headerGroup.headers.length - 1 ? "action-column" : ""}
								>
									{flexRender(header.column.columnDef.header, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className={cell.column.id === 'actions' ? 'action-column' : ''}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div className="pagination-controls">
				<button
					onClick={() => table.setPageIndex(0)}
					disabled={!table.getCanPreviousPage()}
				>
					{'<<'}
				</button>
				<button
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					{'<'}
				</button>
				<button
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					{'>'}
				</button>
				<button
					onClick={() => table.setPageIndex(table.getPageCount() - 1)}
					disabled={!table.getCanNextPage()}
				>
					{'>>'}
				</button>
				<span className="page-info">
					Page {table.getState().pagination.pageIndex + 1} of{' '}
					{table.getPageCount()}
				</span>
			</div>
		</div>
	);
}

export default SalesTrackerTable;
