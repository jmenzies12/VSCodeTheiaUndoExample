import {  AllCommunityModule, ModuleRegistry, provideGlobalGridOptions, ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState } from "react";
import { WebviewApi } from 'vscode-webview'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes
provideGlobalGridOptions({ theme: "legacy"});

const vscode: WebviewApi<unknown> = acquireVsCodeApi()

const columns: (ColDef)[] = [
	{
		minWidth: 300,
		flex: 1,
		headerName: 'ID',
		field: 'id',
		editable: true,
        cellDataType: 'number'
	},
	{
		minWidth: 300,
		flex: 1,
		headerName: 'Description',
		field: 'description',
		editable: true,
        cellDataType: 'string'
	},
]

export default function EntryTable() {
    const [rowData, setRowData] = useState<object[]>([])

    useEffect(() => {
		window.addEventListener('message', (event: MessageEvent) => {
        if (event.data.type && event.data.type === 'model') {
				setRowData(event.data.content)
			}
		})
	}, [])

	useEffect(() => {
		vscode.postMessage({
			command: 'modelRequest',
		})
	}, [])

    return (
        <div>
            <AgGridReact
                rowData={rowData}
                columnDefs={columns}
            />
        </div>
    )
}