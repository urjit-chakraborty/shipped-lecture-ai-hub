
export async function callOpenAI(message: string, eventContext: string, apiKey: string) {
  const systemMessage = eventContext
    ? `You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development and the video content they've selected. 

IMPORTANT: You have been provided with specific video content below. Use this content to answer questions when relevant. Reference specific details from the transcripts when possible.

VIDEO CONTENT:
${eventContext}

Answer questions based on this video content when relevant, and provide general web development guidance when needed. When referencing the videos, mention specific details from the transcripts to show you're using the actual content.`
    : 'You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development, Lovable platform, and general programming topics.';

  console.log('Calling OpenAI with system message length:', systemMessage.length);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function callAnthropic(message: string, eventContext: string, apiKey: string) {
  const systemMessage = eventContext
    ? `You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development and the video content they've selected.

IMPORTANT: You have been provided with specific video content below. Use this content to answer questions when relevant. Reference specific details from the transcripts when possible.

VIDEO CONTENT:
${eventContext}

Answer questions based on this video content when relevant, and provide general web development guidance when needed. When referencing the videos, mention specific details from the transcripts to show you're using the actual content.`
    : 'You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development, Lovable platform, and general programming topics.';

  console.log('Calling Anthropic with system message length:', systemMessage.length);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      system: systemMessage,
      messages: [
        { role: 'user', content: message }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Anthropic API error:', error);
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function callGemini(message: string, eventContext: string, apiKey: string) {
  const systemMessage = eventContext
    ? `You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development and the video content they've selected.

IMPORTANT: You have been provided with specific video content below. Use this content to answer questions when relevant. Reference specific details from the transcripts when possible.

VIDEO CONTENT:
${eventContext}

Answer questions based on this video content when relevant, and provide general web development guidance when needed. When referencing the videos, mention specific details from the transcripts to show you're using the actual content.`
    : 'You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development, Lovable platform, and general programming topics.';

  console.log('Calling Gemini with system message length:', systemMessage.length);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: systemMessage + '\n\nUser: ' + message }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
