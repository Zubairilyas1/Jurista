import re

file_path = r"d:\Projects\Future\Jurista\frontend\src\app\ocr\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Import the modal
modal_import = """
import DocumentEditorModal from '@/components/DocumentEditorModal';
"""
content = content.replace("import { useRouter } from 'next/navigation';", "import { useRouter } from 'next/navigation';\n" + modal_import)

# State for modal and html
modal_state = """
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftHtml, setDraftHtml] = useState('');
"""
content = re.sub(r"const \[petitionType, setPetitionType\] = useState\('CRPC_497_BAIL'\);", r"const [petitionType, setPetitionType] = useState('CRPC_497_BAIL');\n" + modal_state, content)

# Change handleDraft to fetch HTML
new_handle_draft = """
  const handleDraft = async () => {
    if (!result) return;
    setIsDrafting(true);
    try {
      const payload = {
        petition_type: petitionType,
        court: "High Court",
        case_number: "______/2026",
        petitioner: result.summary?.parties?.[0] || "Petitioner",
        respondent: result.summary?.parties?.[1] || "The State",
        facts: result.text || "Extracted facts from FIR.",
        prayer: "Grant relief as prayed.",
        party_type: "Petitioner",
        bar_license_no: "1234/HC"
      };

      const res = await fetch('http://127.0.0.1:8000/api/v1/drafter/generate_html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Drafting failed');
      
      const htmlContent = await res.text();
      setDraftHtml(htmlContent);
      setIsEditorOpen(true);
      
    } catch (e) {
      console.error(e);
      alert('Failed to generate draft.');
    } finally {
      setIsDrafting(false);
    }
  };
"""

content = re.sub(r"const handleDraft = async \(\) => \{[\s\S]+?setIsDrafting\(false\);\s+\}\s+\};", new_handle_draft.strip(), content)

# Add Modal component at the end of the return statement
content = content.replace("</div>\n    </div>\n  );\n}", """
      <DocumentEditorModal 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        initialHtml={draftHtml} 
        petitionType={petitionType} 
      />
    </div>
  );
}""")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched ocr/page.tsx with WYSIWYG")
