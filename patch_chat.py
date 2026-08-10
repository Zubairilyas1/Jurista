import re

file_path = r"d:\Projects\Future\Jurista\frontend\src\app\chat\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace useEffect and handleSubmit
new_logic = """
  const triggerApiCall = async (currentMessages: Message[]) => {
    setLoading(true);
    try {
      const history = currentMessages.slice(-6).map(m => ({
        role: m.type,
        content: m.content
      }));

      const res = await fetch('http://127.0.0.1:8000/api/v1/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: currentMessages[currentMessages.length - 1].content, 
          top_k: 5,
          history: history
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer.Full_Answer || data.answer.Applicable_Law || 'No answer found.',
        citations: data.citations,
        status: data.grounding_status
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        type: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ocrContextStr = sessionStorage.getItem('ocrContext');
    if (ocrContextStr) {
      try {
        const ocrData = JSON.parse(ocrContextStr);
        
        const hiddenContextMsg: Message = {
          id: (Date.now() - 1).toString(),
          type: 'user',
          content: `[SYSTEM: USER SCANNED A DOCUMENT. HERE IS THE TRANSCRIBED TEXT TO USE AS CONTEXT FOR THE FOLLOWING QUESTIONS:]\\n\\n${ocrData.text}`,
          isAttachment: true
        };
        
        const autoQueryMsg: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: "Please provide a complete English summary of this document, including the date, parties, and the crime. Then explain the laws involved (e.g. PPC sections)."
        };
        
        const newMessages = [hiddenContextMsg, autoQueryMsg];
        setMessages(newMessages);
        sessionStorage.removeItem('ocrContext');
        
        triggerApiCall(newMessages);
      } catch (e) {
        console.error("Failed to parse ocr context", e);
      }
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), type: 'user', content: query.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setQuery('');
    
    triggerApiCall(newMessages);
  };
"""

# We need to find the block from useEffect(() => { const ocrContextStr... up to the end of handleSubmit
pattern = re.compile(r"useEffect\(\(\) => \{\s+const ocrContextStr[\s\S]+?setLoading\(false\);\s+\}\s+\};", re.MULTILINE)
content = pattern.sub(new_logic.strip(), content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched chat/page.tsx")
