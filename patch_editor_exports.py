import re

file_path = r"d:\Projects\Future\Jurista\frontend\src\components\DocumentEditorModal.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add download functions
new_functions = """
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

      await html2pdf().set(opt).from(element).save();
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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Petition_${petitionType}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to export Word Document');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportText = () => {
    if (editorRef.current) {
      const text = editorRef.current.getEditor().getText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Petition_${petitionType}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };
"""

content = re.sub(r"  const handleExportPDF = async \(\) => \{[\s\S]+?setIsExporting\(false\);\s+\}\s+\};", new_functions.strip(), content)

# Replace the single Export button with a dropdown and a button
buttons = """
              <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1 border border-white/10">
                <button 
                  onClick={handleExportWord}
                  disabled={isExporting}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 text-white transition-colors"
                >
                  Word
                </button>
                <div className="w-[1px] h-4 bg-white/10"></div>
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 text-white transition-colors"
                >
                  PDF
                </button>
                <div className="w-[1px] h-4 bg-white/10"></div>
                <button 
                  onClick={handleExportText}
                  disabled={isExporting}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 text-white transition-colors"
                >
                  Text
                </button>
              </div>
"""

content = re.sub(r'<button[\s\S]+?onClick=\{handleExportPDF\}[\s\S]+?</button>', buttons.strip(), content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched DocumentEditorModal.tsx to add Word and Text exports")
