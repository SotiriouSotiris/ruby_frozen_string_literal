import * as vscode from 'vscode';

const FROZEN_COMMENT = '# frozen_string_literal: true';

function isEligiblePath(document: vscode.TextDocument): boolean {
  const filePath = document.uri.fsPath;
  const config = vscode.workspace.getConfiguration('frozenStringLiteralRuby');
  const excludePaths = config.get<string[]>('excludePaths', []);
  const excludeFiles = config.get<string[]>('excludeFiles', []);
 
  const included = (
    filePath.includes('/app/') ||
    filePath.includes('/lib/') ||
    filePath.includes('/test/')
  );

  const excluded = excludePaths.some(excludePath => filePath.includes(excludePath)) ||
  				   excludeFiles.some(excludeFile => filePath.endsWith(excludeFile));
  return included && !excluded;
}

function isRubyFile(document: vscode.TextDocument): boolean {
	return document.languageId === 'ruby';
}

function getEdits(document: vscode.TextDocument, checkPath: boolean = true): vscode.TextEdit[] | undefined {
  if (!isRubyFile(document) || (checkPath && !isEligiblePath(document))){
	return;
  }

  const fullText = document.getText();
  if (fullText.includes(FROZEN_COMMENT)) {
    return;
  }
	

  let insertionPos = new vscode.Position(0, 0);
  for (let line = 0; line < document.lineCount; line++) {
    const text = document.lineAt(line).text;
    if (/^#!/.test(text) || /^#\s*(coding|encoding)/i.test(text)) {
      insertionPos = new vscode.Position(line + 1, 0);
      continue;
    }
    break;
  }

  return [vscode.TextEdit.insert(insertionPos, `${FROZEN_COMMENT}\n\n`)];
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('frozenStringLiteralRuby');
  const autoInsertEnabled = config.get<boolean>('enableAutoInsert', true);
 
  if(autoInsertEnabled){
	const willSave = vscode.workspace.onWillSaveTextDocument(e => {
		const edits = getEdits(e.document);
		if (edits){
			e.waitUntil(Promise.resolve(edits));
		}
	});

	const didOpen = vscode.window.onDidChangeActiveTextEditor(editor => {
		if (!editor){
			return;
		}

		const doc = editor.document;
		const edits = getEdits(doc);

		if (!edits){
			return;
		}

		const wsEdit = new vscode.WorkspaceEdit();
		edits.forEach(edit => wsEdit.insert(doc.uri, edit.range.start, edit.newText));
		vscode.workspace.applyEdit(wsEdit);
	});

	context.subscriptions.push(willSave, didOpen);
  }

  const manualCmd = vscode.commands.registerTextEditorCommand(
	'frozen-string-literal-ruby.addFrozenLiteral',
	async editor => {
		const { document } = editor;
		let edits = getEdits(document, false);

		if (!isRubyFile(document)) {
			const choice = await vscode.window.showInformationMessage(
				'This is not a Ruby file.',
				'Add Anyway'
			);
			if (choice !== 'Add Anyway'){
				return;
			}

			const fullText = document.getText();
			edits = [vscode.TextEdit.insert(new vscode.Position(0, 0), `${FROZEN_COMMENT}\n\n`)];
		}

		if (!edits) {
			vscode.window.showInformationMessage(
				'File already contains `# frozen_string_literal: true`.'
			);
			return;
		}

		await editor.edit(builder => {
			edits!.forEach(edit => builder.insert(edit.range.start, edit.newText));
		});
	}
  );

  context.subscriptions.push(manualCmd);
}

export function deactivate() {}
