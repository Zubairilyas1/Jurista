import re

file_path = r"d:\Projects\Future\Jurista\frontend\src\app\ocr\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add language state
content = content.replace("const [petitionType, setPetitionType] = useState('CRPC_497_BAIL');", 
                          "const [petitionType, setPetitionType] = useState('CRPC_497_BAIL');\n  const [language, setLanguage] = useState('english');")

# 2. Add language to payload
content = content.replace("petition_type: petitionType,", "petition_type: petitionType,\n        language: language,")

# 3. Remove the drafting section from the right sidebar
# We'll use regex to remove the drafting block.
sidebar_drafting_pattern = r'<div className="card-dark p-4 mt-2 border border-white/10 flex flex-col gap-3">[\s\S]*?</div>'
content = re.sub(sidebar_drafting_pattern, "", content)

# 4. Inject the Drafting Suite below the raw text in the left panel
left_panel_drafting_suite = """
              {/* Drafting Suite */}
              <div className="card-dark p-6 border-t border-white/10 bg-black/40 flex flex-col gap-4">
                <h3 className="font-sans-hero font-bold tracking-widest text-sm uppercase text-white flex items-center gap-2">
                  <Download size={16} /> Automated Drafting Suite
                </h3>
                
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Petition Type</label>
                    <select 
                      value={petitionType}
                      onChange={(e) => setPetitionType(e.target.value)}
                      className="bg-[#121215] border border-white/10 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-lime/50"
                    >
                      <option value="CRPC_497_BAIL">Bail Petition (CrPC 497)</option>
                      <option value="CPC_ORDER39_STAY">Stay Petition (CPC Order 39)</option>
                      <option value="ART199_WRIT">Writ Petition (Article 199)</option>
                    </select>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Language Format</label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-[#121215] border border-white/10 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-lime/50"
                    >
                      <option value="english">English (Standard)</option>
                      <option value="bilingual">Bilingual (English / Urdu)</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleDraft}
                  disabled={isDrafting}
                  className="pill-dark py-4 mt-2 w-full justify-center text-sm font-bold tracking-widest uppercase bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                >
                  {isDrafting ? <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" /> : <Download size={18} />}
                  {isDrafting ? 'Generating Draft...' : 'Generate Editable Draft'}
                </button>
              </div>
"""

# Insert at the end of the left panel (before closing div of left panel)
content = content.replace("</pre>\n              </div>\n            </div>", 
                          "</pre>\n              </div>\n" + left_panel_drafting_suite + "\n            </div>")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched ocr/page.tsx with redesigned layout and bilingual UI")
