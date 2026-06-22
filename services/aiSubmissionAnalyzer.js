const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

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

function extractResponseText(responseData) {
    if (typeof responseData.output_text === "string") {
        return responseData.output_text;
    }

    const message = responseData.output?.find((item) => item.type === "message");
    const outputText = message?.content?.find((item) => item.type === "output_text");

    return outputText?.text || null;
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

export async function analyzeSubmissionText(text) {
    const apiKey = process.env.OPENAI_API_KEY;
    const submissionText = typeof text === "string" ? text.trim() : "";

    if (!apiKey || !submissionText) {
        return emptyAnalysis;
    }

    const response = await fetch(OPENAI_RESPONSES_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
            instructions: [
                "You analyze user-submitted text for scam indicators.",
                "Suggest likely scam categories only when the text supports them.",
                "Extract exact suspicious keywords or short phrases from the submitted text.",
                "Keep the explanation brief and avoid claiming certainty."
            ].join(" "),
            input: `Analyze this submission text:\n\n${submissionText}`,
            text: {
                format: {
                    type: "json_schema",
                    name: "submission_scam_analysis",
                    strict: true,
                    schema: scamAnalysisSchema
                }
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI analysis failed: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    const outputText = extractResponseText(responseData);

    if (!outputText) {
        return emptyAnalysis;
    }

    return normalizeAnalysis(JSON.parse(outputText));
}
