// AI coding service utilities
export class AutoCodingService {
  // OpenAI GPT-3.5-turbo pricing (as of 2024)
  static PRICING = {
    INPUT_TOKENS_PER_1K: 0.0015,    // $0.0015 per 1K input tokens
    OUTPUT_TOKENS_PER_1K: 0.002     // $0.002 per 1K output tokens
  };

  // Rough token estimation (approximately 4 characters per token)
  static estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  static estimateCost(segments, codes) {
    // Build the prompt that would be sent to OpenAI
    const codesInfo = codes.map(code => {
      let codeDesc = `- ${code.name}`;
      if (code.description) {
        codeDesc += `: ${code.description}`;
      }
      if (code.inclusion) {
        codeDesc += `\n  Inclusion criteria: ${code.inclusion}`;
      }
      if (code.exclusion) {
        codeDesc += `\n  Exclusion criteria: ${code.exclusion}`;
      }
      if (!code.description && !code.inclusion && !code.exclusion) {
        codeDesc += ': No description provided';
      }
      return codeDesc;
    }).join('\n');

    const segmentsInfo = segments.map(segment => 
      `Segment ${segment.id}: "${segment.text}"`
    ).join('\n\n');

    const prompt = `You are a qualitative research assistant. Please analyze the following text segments and assign the most relevant codes from the available code list. Pay special attention to the inclusion and exclusion criteria for each code. Return your response as a JSON object where each key is a segment ID and the value is an array of code names that should be assigned to that segment.

Available Codes:
${codesInfo}

Text Segments to Code:
${segmentsInfo}

Instructions:
- Only assign codes that are truly relevant to the content
- Carefully consider inclusion criteria (when to apply the code)
- Carefully consider exclusion criteria (when NOT to apply the code)
- A segment can have multiple codes if appropriate
- A segment can have no codes if none are relevant
- Use exact code names from the list above

Return format:
{
  "segmentId1": ["Code Name 1", "Code Name 2"],
  "segmentId2": ["Code Name 3"],
  "segmentId3": []
}`;

    // Estimate input tokens
    const inputTokens = this.estimateTokens(prompt);
    
    // Estimate output tokens (roughly based on number of segments and codes)
    // Assume each segment might get 0-3 codes assigned, with JSON formatting
    const estimatedOutputTokens = Math.min(2000, segments.length * 15 + codes.length * 5);
    
    // Calculate costs
    const inputCost = (inputTokens / 1000) * this.PRICING.INPUT_TOKENS_PER_1K;
    const outputCost = (estimatedOutputTokens / 1000) * this.PRICING.OUTPUT_TOKENS_PER_1K;
    const totalCost = inputCost + outputCost;

    return {
      inputTokens,
      estimatedOutputTokens,
      inputCost,
      outputCost,
      totalCost,
      segments: segments.length,
      codes: codes.length
    };
  }

  static async assignCodes(segments, codes, apiKey = null) {
    // Require OpenAI API key
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('OpenAI API key is required for auto-coding');
    }
    
    const result = await this.useOpenAI(segments, codes, apiKey);
    
    // Return assignments and usage info separately for backwards compatibility
    return {
      assignments: result.assignments,
      usage: result.usage
    };
  }

  static async useOpenAI(segments, codes, apiKey) {
    const codesInfo = codes.map(code => {
      let codeDesc = `- ${code.name}`;
      if (code.description) {
        codeDesc += `: ${code.description}`;
      }
      if (code.inclusion) {
        codeDesc += `\n  Inclusion criteria: ${code.inclusion}`;
      }
      if (code.exclusion) {
        codeDesc += `\n  Exclusion criteria: ${code.exclusion}`;
      }
      if (!code.description && !code.inclusion && !code.exclusion) {
        codeDesc += ': No description provided';
      }
      return codeDesc;
    }).join('\n');

    const segmentsInfo = segments.map(segment => 
      `Segment ${segment.id}: "${segment.text}"`
    ).join('\n\n');

    const prompt = `You are a qualitative research assistant. Please analyze the following text segments and assign the most relevant codes from the available code list. Pay special attention to the inclusion and exclusion criteria for each code. Return your response as a JSON object where each key is a segment ID and the value is an array of code names that should be assigned to that segment.

Available Codes:
${codesInfo}

Text Segments to Code:
${segmentsInfo}

Instructions:
- Only assign codes that are truly relevant to the content
- Carefully consider inclusion criteria (when to apply the code)
- Carefully consider exclusion criteria (when NOT to apply the code)
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
    
    // Extract usage information from the response
    const usage = data.usage || {};
    const actualCost = usage.prompt_tokens && usage.completion_tokens
      ? (usage.prompt_tokens / 1000) * this.PRICING.INPUT_TOKENS_PER_1K + 
        (usage.completion_tokens / 1000) * this.PRICING.OUTPUT_TOKENS_PER_1K
      : null;
    
    try {
      const assignments = JSON.parse(aiResponse);
      return {
        assignments,
        usage: usage.prompt_tokens ? {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          actualCost
        } : null
      };
    } catch (parseError) {
      throw new Error('Invalid response format from OpenAI');
    }
  }
}
