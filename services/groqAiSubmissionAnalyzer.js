const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

const emptyAnalysis = {
    predicted_type_of_scam: [],
    found_keywords: [],
    ai_explaination: null
};

const scamAnalysisSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
        predicted_type_of_scam: {
            type: "array",
            description: "Possible scam categories that may match the submitted text.",
            items: { type: "string" }
        },
        found_keywords: {
            type: "array",
            description: "Suspicious words or short phrases found in the submitted text.",
            items: { type: "string" }
        },
        ai_explaination: {
            type: ["string", "null"],
            description: "Brief explanation of why these scam categories were suggested."
        }
    },
    required: ["predicted_type_of_scam", "found_keywords", "ai_explaination"]
};

function normalizeStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 10);
}

function normalizeAnalysis(analysis) {
    return {
        predicted_type_of_scam: normalizeStringArray(analysis?.predicted_type_of_scam),
        found_keywords: normalizeStringArray(analysis?.found_keywords),
        ai_explaination: typeof analysis?.ai_explaination === "string"
            ? analysis.ai_explaination.trim()
            : null
    };
}

function extractMessageContent(responseData) {
    return responseData.choices?.[0]?.message?.content || null;
}

export async function analyzeSubmissionTextWithGroq(text) {
    const apiKey = process.env.GROQ_API_KEY;
    const submissionText = typeof text === "string" ? text.trim() : "";

    if (!apiKey || !submissionText) {
        return emptyAnalysis;
    }

    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content: [
                        "You analyze user-submitted text for scam indicators.",
                        "Suggest likely scam categories only when the text supports them.",
                        "Extract exact suspicious keywords or short phrases from the submitted text.",
                        "Keep the explanation brief and avoid claiming certainty."
                    ].join(" ")
                },
                {
                    role: "user",
                    content: `Analyze this submission text:\n\n${submissionText}`
                }
            ],
            temperature: 0,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "submission_scam_analysis",
                    strict: true,
                    schema: scamAnalysisSchema
                }
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq analysis failed: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    const messageContent = extractMessageContent(responseData);

    if (!messageContent) {
        return emptyAnalysis;
    }

    return normalizeAnalysis(JSON.parse(messageContent));
}
