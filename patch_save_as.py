import re

file_path = r"d:\Projects\Future\Jurista\frontend\src\components\DocumentEditorModal.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace export functions to use File System Access API where possible
new_functions = """
  const saveWithDialog = async (blob, defaultFilename) => {
    try {
      if (window.showSaveFilePicker) {
        // Use native Save As dialog if supported
        const handle = await window.showSaveFilePicker({
          suggestedName: defaultFilename,
          types: [{
            description: 'Document',
            accept: { [blob.type || 'application/octet-stream']: ['.' + defaultFilename.split('.').pop()] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        // Fallback for older browsers
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultFilename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        alert('Failed to save file.');
      }
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.createElement('div');
      element.innerHTML = content;
      element.style.padding = '20px';
      
      const opt = {
        margin:       1,
        filename:     `Petition_${petitionType}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // We can intercept html2pdf output to prompt Save As
      const pdfWorker = html2pdf().set(opt).from(element);
      const pdfBlob = await pdfWorker.output('blob');
      
      await saveWithDialog(pdfBlob, `Petition_${petitionType}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      const htmlToDocx = (await import('html-to-docx')).default;
      const fileBuffer = await htmlToDocx(content, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
      });
      
      const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      await saveWithDialog(blob, `Petition_${petitionType}.docx`);
    } catch (e) {
      console.error(e);
      alert('Failed to export Word Document');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportText = async () => {
    if (editorRef.current) {
      const text = editorRef.current.getEditor().getText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      await saveWithDialog(blob, `Petition_${petitionType}.txt`);
    }
  };
"""

content = re.sub(r"  const handleExportPDF = async \(\) => \{[\s\S]+?window\.URL\.revokeObjectURL\(url\);\s+\}\s+\};", new_functions.strip(), content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched DocumentEditorModal.tsx for Save As dialog")
