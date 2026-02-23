import Groq from 'groq-sdk';

let groqClient = null;

function getGroqClient() {
    if (!groqClient) {
        groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return groqClient;
}

export const aiEmailService = {
    async generateEmail(context) {
        try {
            const groq = getGroqClient();

            const systemPrompt = `You are an email writing assistant. Extract the recipient email address from the context, generate an appropriate subject line, and write a professional email body with proper tone. Respond ONLY in JSON format: {"recipient": "email@example.com", "subject": "Subject line", "body": "Email content"}`;

            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: context
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
            });

            const responseText = completion.choices[0].message.content;
            const emailData = JSON.parse(responseText);

            return {
                recipient: emailData.recipient,
                subject: emailData.subject,
                body: emailData.body
            };
        } catch (error) {
            console.error('Groq API error:', error);
            throw new Error('Failed to generate email with AI');
        }
    }
};
