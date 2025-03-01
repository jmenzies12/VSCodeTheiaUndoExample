# VSCodeTheiaUndoExample

This repository serves as a minimal reproducible example to highlight the difference in 'undo' functionality between Theia vs VSCode when building a vscode extension


The workspace folder contains a simple example file 'example.mre'

This contains one entry:
```
entry 1: 'edit this description'
```

To build the example:
```
npm install
```
```
npm run build
```

To package the vscode extension:
```
npm run vscode:package
```

To reproduce the issue:

Open the example.mre in the 'Text Editor' (Langium Editor)

![alt text](./images/langium-editor.png)

Open the example.mre in the 'MRE Diagram Editor', keep the 'Text Editor' open so you can go observe the differences.

![alt text](./images/diagram-editor.png)

Now double click on the description text in the center of the node 'edit this description'. This will open an in line text editor, change the description to something else and then hit enter.

![alt text](./images/edit-description.png)

This will update the diagram node to show the changed description:

![alt text](./images/edited-description-diagram.png)

And in the 'Text Editor' it will also show the change:

![alt text](./images/description-edited-text.png)

Now go back to the 'MRE Diagram Editor' and use the keyboard shorcut for undo ctrl + z

In VSCode this will undo the change in both the 'Text Editor' and the 'MRE Diagram Editor'

In Theia this will undo nothing.

*Note to explain the undo a little further here. When you undo in VSCode, it triggers the undo in both editors, in this case that means that it undoes the effect of the code action in the 'Text Editor' i.e. changing the description, and then this sends an update to the diagram editor. In Theia, the 'Text Editor' change is not undone, this results in nothing being undone because there was no diagram specific changes to undo.
