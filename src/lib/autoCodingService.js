// AI coding service utilities
export class AutoCodingService {
  static async assignCodes(segments, codes, apiKey = null) {
    // First try OpenAI API if key is provided
    if (apiKey && apiKey.trim().length > 0) {
      return await this.useOpenAI(segments, codes, apiKey);
    }
    
    // Fallback to rule-based approach
    return await this.useRuleBasedApproach(segments, codes);
  }

  static async useOpenAI(segments, codes, apiKey) {
    const codesInfo = codes.map(code => 
      `- ${code.name}: ${code.description || 'No description'}`
    ).join('\n');

    const segmentsInfo = segments.map(segment => 
      `Segment ${segment.id}: "${segment.text}"`
    ).join('\n\n');

    const prompt = `You are a qualitative research assistant. Please analyze the following text segments and assign the most relevant codes from the available code list. Return your response as a JSON object where each key is a segment ID and the value is an array of code names that should be assigned to that segment.

Available Codes:
${codesInfo}

Text Segments to Code:
${segmentsInfo}

Instructions:
- Only assign codes that are truly relevant to the content
- A segment can have multiple codes if appropriate
- A segment can have no codes if none are relevant
- Use exact code names from the list above

Return format:
{
  "segmentId1": ["Code Name 1", "Code Name 2"],
  "segmentId2": ["Code Name 3"],
  "segmentId3": []
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    try {
      return JSON.parse(aiResponse);
    } catch (parseError) {
      throw new Error('Invalid response format from OpenAI');
    }
  }

  static async useRuleBasedApproach(segments, codes) {
    // Simple keyword-based matching as fallback
    const assignments = {};
    
    segments.forEach(segment => {
      const segmentText = segment.text.toLowerCase();
      const matchingCodes = [];
      
      codes.forEach(code => {
        // Only use code name for matching, and require exact word matches
        const codeName = code.name.toLowerCase();
        
        // Create word boundaries to avoid partial matches
        const wordPattern = new RegExp(`\\b${codeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        
        // Check if code name appears as a complete word in the segment text
        if (wordPattern.test(segmentText)) {
          matchingCodes.push(code.name);
        }
      });
      
      assignments[segment.id] = matchingCodes;
    });
    
    return assignments;
  }
}
