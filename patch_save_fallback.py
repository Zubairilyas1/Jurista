import re

file_path = r"d:\Projects\Future\Jurista\frontend\src\components\DocumentEditorModal.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_functions = """
  const getSaveFilename = (defaultName) => {
    const filename = window.prompt("Enter filename to save as:", defaultName);
    return filename || defaultName;
  };

  const handleExportPDF = async () => {
    try {
      let handle = null;
      let finalFilename = `Petition_${petitionType}.pdf`;
      
      if (window.showSaveFilePicker) {
        handle = await window.showSaveFilePicker({
          suggestedName: finalFilename,
          types: [{
            description: 'PDF Document',
            accept: { 'application/pdf': ['.pdf'] },
          }],
        });
      } else {
        // Fallback for browsers that don't support File System Access API
        finalFilename = getSaveFilename(finalFilename);
      }
      
      setIsExporting(true);
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.createElement('div');
      element.innerHTML = content;
      element.style.padding = '20px';
      
      const opt = {
        margin:       1,
        filename:     finalFilename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      const pdfWorker = html2pdf().set(opt).from(element);
      const pdfBlob = await pdfWorker.output('blob');
      
      if (handle) {
        const writable = await handle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
      } else {
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalFilename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error(e);
        alert('Failed to export PDF');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    try {
      let handle = null;
      let finalFilename = `Petition_${petitionType}.docx`;
      
      if (window.showSaveFilePicker) {
        handle = await window.showSaveFilePicker({
          suggestedName: finalFilename,
          types: [{
            description: 'Word Document',
            accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
          }],
        });
      } else {
        finalFilename = getSaveFilename(finalFilename);
      }
      
      setIsExporting(true);
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: content }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      
      if (handle) {
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalFilename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error(e);
        alert('Failed to export Word Document');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportText = async () => {
    if (editorRef.current) {
      try {
        let handle = null;
        let finalFilename = `Petition_${petitionType}.txt`;
        
        if (window.showSaveFilePicker) {
          handle = await window.showSaveFilePicker({
            suggestedName: finalFilename,
            types: [{
              description: 'Text Document',
              accept: { 'text/plain': ['.txt'] },
            }],
          });
        } else {
          finalFilename = getSaveFilename(finalFilename);
        }
        
        setIsExporting(true);
        const text = editorRef.current.getEditor().getText();
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        
        if (handle) {
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } else {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = finalFilename;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e);
          alert('Failed to export Text Document');
        }
      } finally {
        setIsExporting(false);
      }
    }
  };
"""

content = re.sub(r"  const handleExportPDF = async \(\) => \{[\s\S]+?window\.URL\.revokeObjectURL\(url\);\s+\}\s+\}\s+catch[\s\S]+?setIsExporting\(false\);\s+\}\s+\};", new_functions.strip(), content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched DocumentEditorModal.tsx for fallback save prompt")
