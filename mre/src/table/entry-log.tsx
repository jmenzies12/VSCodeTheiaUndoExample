import { ColDef, CellEditRequestEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState } from "react";
import { WebviewApi } from 'vscode-webview'
import { Model } from "../language/generated/ast";
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

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
        cellDataType: 'text'
	},
]

export type CommonEditAction = {
	actionIdentifier: string
	objectIdentifier: number
	newValue: string | number
	oldValue: string
	rowObjectIdentifier?: string
}


function processCellEdit(event: CellEditRequestEvent, vscode: WebviewApi<unknown>) {
	const editAction: CommonEditAction = {
		actionIdentifier: '',
		newValue: '',
		oldValue: event.oldValue,
		objectIdentifier: -1,
	}
	switch (event.colDef.field) {
		case 'id':
			editAction.objectIdentifier = event.node.data.id
			editAction.actionIdentifier = 'editId'
			editAction.newValue = event.newValue
			break
		case 'description':
			editAction.objectIdentifier = event.node.data.id
			editAction.actionIdentifier = 'editDescription'
			editAction.newValue = `'${event.newValue}'`
			break
		default:
			return
	}
	vscode.postMessage({
		command: editAction.actionIdentifier,
		editData: editAction,
	})
}

export default function EntryTable() {
    const [rowData, setRowData] = useState<object[]>([])

    useEffect(() => {
		window.addEventListener('message', (event: MessageEvent) => {
        if (event.data.type && event.data.type === 'model') {
			const model = JSON.parse(event.data.content) as Model
			const entries = model.entries
			setRowData(entries)
		}})
	}, [])

	useEffect(() => {
		vscode.postMessage({
			command: 'modelRequest',
		})
	}, [])

	const onCellEditRequest = (event: CellEditRequestEvent) => {
		processCellEdit(event, vscode)
	}

    return (
		<>
			<div className={'ag-theme-quartz-dark'} style={{ height: '100%', width: '95%', position: 'absolute' }}>
				<AgGridReact
					rowData={rowData}
					columnDefs={columns}
					onCellEditRequest={onCellEditRequest}
					readOnlyEdit={true}
				/>
			</div>
		</>
    )
}