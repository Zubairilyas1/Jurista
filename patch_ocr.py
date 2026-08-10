import re

file_path = r"d:\Projects\Future\Jurista\frontend\src\app\ocr\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add states
state_logic = """
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [petitionType, setPetitionType] = useState('CRPC_497_BAIL');
"""
content = re.sub(r"const \[dragActive, setDragActive\] = useState\(false\);\s+const \[isProcessing, setIsProcessing\] = useState\(false\);", state_logic.strip(), content)

# Add Download icon import
content = content.replace("from 'lucide-react';", ", Download } from 'lucide-react';")

# Add handleDraft function before handleCopy
draft_func = """
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

      const res = await fetch('http://127.0.0.1:8000/api/v1/drafter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Drafting failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Petition_${petitionType}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to generate draft.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopy = () => {
"""
content = content.replace("const handleCopy = () => {", draft_func.strip())

# Add UI Buttons
ui_buttons = """
              <button 
                onClick={() => {
                  sessionStorage.setItem('ocrContext', JSON.stringify(result));
                  window.location.href = '/chat';
                }} 
                className="pill-dark mt-4 py-4 w-full justify-center text-sm font-bold tracking-widest uppercase bg-lime text-black hover:bg-lime/80 shadow-[0_0_20px_rgba(163,230,53,0.3)] flex items-center gap-2"
              >
                <MessageSquare size={18} /> Analyze in Chat
              </button>

              <div className="card-dark p-4 mt-2 border border-white/10 flex flex-col gap-3">
                <label className="text-xs font-bold uppercase text-white/50 tracking-wider">Select Petition Type</label>
                <select 
                  value={petitionType}
                  onChange={(e) => setPetitionType(e.target.value)}
                  className="bg-[#0D0D0E] border border-white/10 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-lime/50"
                >
                  <option value="CRPC_497_BAIL">Bail Petition (CrPC 497)</option>
                  <option value="CPC_ORDER39_STAY">Stay Petition (CPC Order 39)</option>
                  <option value="ART199_WRIT">Writ Petition (Article 199)</option>
                </select>
                <button 
                  onClick={handleDraft}
                  disabled={isDrafting}
                  className="pill-dark py-3 w-full justify-center text-xs font-bold tracking-widest uppercase bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {isDrafting ? <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" /> : <Download size={16} />}
                  {isDrafting ? 'Drafting...' : 'One-Click Draft'}
                </button>
              </div>
"""

pattern = re.compile(r"<button\s+onClick=\{\(\) => \{\s+sessionStorage\.setItem\('ocrContext', JSON\.stringify\(result\)\);\s+window\.location\.href = '/chat';\s+\}\}\s+className=\"pill-dark mt-4 py-4 w-full justify-center text-sm font-bold tracking-widest uppercase bg-lime text-black hover:bg-lime/80 shadow-\[0_0_20px_rgba\(163,230,53,0\.3\)\] flex items-center gap-2\"\s+>\s+<MessageSquare size=\{18\} /> Analyze in Chat\s+</button>", re.MULTILINE)

content = pattern.sub(ui_buttons.strip(), content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched ocr/page.tsx")
