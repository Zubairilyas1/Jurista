import re

file_path = r"d:\Projects\Future\Jurista\frontend\src\app\chat\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

patch_code = """
      let openDrafter = false;
      if (content.includes('[OPEN_PETITION_DRAFTER]')) {
        openDrafter = true;
        content = content.replace('[OPEN_PETITION_DRAFTER]', '').trim();
      }

      const renderTextWithCitations = (text: string) => {
        if (!msg.citations) return text;
        const parts = text.split(/(\[\d+\])/g);
        return parts.map((part, index) => {
          if (part.match(/^\[\d+\]$/)) {
            const num = part.replace(/[\[\]]/g, '');
            return (
              <sup key={index} className="px-1 font-bold text-lime cursor-pointer hover:underline text-[10px] bg-lime/10 rounded-full ml-0.5">
                {num}
              </sup>
            );
          }
          return <span key={index}>{part}</span>;
        });
      };

      return (
        <div className="flex flex-col gap-4 w-full">
          <ThinkingBlock thinking={thinking} verification={msg.status === 'GROUNDED' ? 'Citations successfully cross-referenced with Jurista Legal Graph.' : undefined} />
          
          <div className="text-white/90 leading-relaxed font-medium">
            {renderTextWithCitations(content)}
          </div>
          
          {openDrafter && (
            <div className="mt-4 flex">
              <button 
                onClick={() => window.location.href = '/petition'}
                className="pill-dark py-4 px-6 text-sm font-bold tracking-widest uppercase bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
              >
                <FileText size={18} />
                Open Petition Drafting Suite
              </button>
            </div>
          )}

          {suggestedQuestions.length > 0 && (
            <div className="mt-6 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Suggested Follow-ups</span>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((sq, i) => (
                  <button 
                    key={i} 
                    onClick={() => setQuery(sq)}
                    className="text-left text-sm text-lime bg-lime/5 border border-lime/20 px-4 py-2 rounded-xl hover:bg-lime/10 transition-colors"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
"""

# Find the end of renderMessageContent function logic
target_start = """      const renderTextWithCitations = (text: string) => {"""
target_end = """        </div>
      );"""

# Let's just do a regex replace from target_start to target_end
# Actually, the easiest way is to match from `const renderTextWithCitations` up to the return statement.
pattern = r"\s*const renderTextWithCitations = \(text: string\) => \{[\s\S]+?return \([\s\S]+?</div>\n\s*\);\n"

if re.search(pattern, content):
    content = re.sub(pattern, "\n" + patch_code + "\n", content)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched chat/page.tsx to support OPEN_PETITION_DRAFTER")
else:
    print("Could not find pattern in chat/page.tsx")
