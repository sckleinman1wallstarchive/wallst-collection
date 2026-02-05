 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 interface ParsedTask {
   title: string;
   description: string | null;
   owner: 'spencer' | 'parker' | 'both';
   dueDate: string;
   priority: 'low' | 'medium' | 'high';
 }
 
 Deno.serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { notes } = await req.json();
 
     if (!notes || typeof notes !== 'string') {
       return new Response(
         JSON.stringify({ error: 'Notes text is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const today = new Date();
     const todayStr = today.toISOString().split('T')[0];
     
     // Calculate reference dates for the AI
     const nextFriday = new Date(today);
     nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
     const nextWeek = new Date(today);
     nextWeek.setDate(today.getDate() + 7);
 
     const systemPrompt = `You are a task extraction assistant. Extract actionable tasks from the given notes.
 
 Today's date: ${todayStr}
 Next Friday: ${nextFriday.toISOString().split('T')[0]}
 Next Week: ${nextWeek.toISOString().split('T')[0]}
 
 For each task, determine:
 - title: A concise, actionable task title (max 50 chars)
 - description: Optional additional context (null if none)
 - owner: "spencer", "parker", or "both" - infer from names mentioned, default to "both"
 - dueDate: YYYY-MM-DD format - infer from phrases like "by Friday", "next week", "tomorrow", default to one week from today
 - priority: "low", "medium", or "high" - infer from words like "urgent", "ASAP", "important" = high, "when you can" = low, default = medium
 
 Return ONLY a valid JSON object with this structure:
 {"tasks": [{"title": "...", "description": null, "owner": "both", "dueDate": "YYYY-MM-DD", "priority": "medium"}]}
 
 If no actionable tasks found, return {"tasks": []}`;
 
     const response = await fetch('https://api.lovable.dev/api/ai/v1/chat/completions', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
       },
       body: JSON.stringify({
         model: 'google/gemini-2.5-flash',
         messages: [
           { role: 'system', content: systemPrompt },
           { role: 'user', content: notes }
         ],
         temperature: 0.3,
       }),
     });
 
     if (!response.ok) {
       throw new Error(`AI API error: ${response.status}`);
     }
 
     const aiResponse = await response.json();
     const content = aiResponse.choices?.[0]?.message?.content || '{"tasks": []}';
     
     // Parse the JSON response
     let parsed: { tasks: ParsedTask[] };
     try {
       // Try to extract JSON from the response
       const jsonMatch = content.match(/\{[\s\S]*\}/);
       parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
     } catch {
       parsed = { tasks: [] };
     }
 
     // Validate and sanitize tasks
     const validTasks = (parsed.tasks || []).filter((task: any) => 
       task.title && typeof task.title === 'string'
     ).map((task: any) => ({
       title: task.title.substring(0, 100),
       description: task.description || null,
       owner: ['spencer', 'parker', 'both'].includes(task.owner) ? task.owner : 'both',
       dueDate: /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) ? task.dueDate : nextWeek.toISOString().split('T')[0],
       priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium',
     }));
 
     return new Response(
       JSON.stringify({ tasks: validTasks }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   } catch (error) {
     console.error('Parse tasks error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
     return new Response(
      JSON.stringify({ error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });