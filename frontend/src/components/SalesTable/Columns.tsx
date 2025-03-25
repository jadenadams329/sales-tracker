import { ColumnDef } from "@tanstack/react-table"
import { Sale } from "../../interfaces"



export const salesColumns: ColumnDef<Sale>[] = [
    {
        header: "Account Number",
        accessorKey: "accountNumber",
    },
    {
        header: "Agreement Length",
        accessorKey: "agreementLength",
    },
    {
        header: "Plan Type",
        accessorKey: "planType",
    },
    {
        header: "Initial Price",
        accessorKey: "initialPrice",
    },  
    {
        header: "Monthly Price",
        accessorKey: "monthlyPrice",
    },
    {
        header: "Autopay",
        accessorKey: "autopay",
    },
    {
        header: "Service Date",
        accessorKey: "serviceDate",
    },  
    {
        header: "Serviced",
        accessorKey: "serviced",
    },
]
