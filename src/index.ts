// llm-open-connector-app.ts
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import {config as dotenv_config} from "dotenv";
dotenv_config();

// Types and Interfaces based on the OpenAPI spec
interface LLMRequest {
    model: string;
    prompt: string;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    n?: number;
    stream?: boolean;
    logprobs?: number;
    echo?: boolean;
    stop?: string | string[];
    presence_penalty?: number;
    frequency_penalty?: number;
    best_of?: number;
    logit_bias?: Record<string, number>;
    user?: string;
}

interface LLMResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Choice[];
    usage?: Usage;
}

interface Choice {
    text: string;
    index: number;
    logprobs?: Logprobs;
    finish_reason: string;
}

interface Logprobs {
    tokens: string[];
    token_logprobs: number[];
    top_logprobs: Record<string, number>[];
    text_offset: number[];
}

interface Usage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

class HttpError extends Error {
  status: number;

  constructor(status: number, msg: string) {
    super(msg);
    this.status = status;
  }
}

const app = express();
app.use(bodyParser.json());

// Middleware for request validation
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    let authHeader = req.headers.authorization;
    if (!authHeader) {
        authHeader = req.headers["api-key"] as string;
        if (!authHeader) return next(new HttpError(401, "No Authorization or api-key header found"));
        if (authHeader !== process.env.BEARER_TOKEN) return next(new HttpError(401, "Invalid api-key supplied"));
    } else {
        if (authHeader.indexOf("Bearer ") !== 0) return next(new HttpError(401, "Bearer prefix not found in Authorization header"));
        const bearerToken = authHeader.substring(7);
        if (bearerToken !== process.env.BEARER_TOKEN) return next(new HttpError(401, "Invalid bearer token"));
    }
    next();
};

// Endpoint for LLM requests
app.post("/chat/completions", validateRequest, (req: Request, res: Response) => {
    const llmRequest: LLMRequest = req.body;
    console.log("Received request", llmRequest);

    // Simulate LLM response (replace with actual LLM logic)
    const llmResponse: LLMResponse = {
        id: "cmpl-123",
        object: "text_completion",
        created: Date.now(),
        model: llmRequest.model,
        choices: [
            {
                text: `Simulated response to: ${llmRequest.prompt}`,
                index: 0,
                finish_reason: "stop",
            },
        ],
        usage: {
            prompt_tokens: (llmRequest.prompt || "").split(" ").length,
            completion_tokens: 10,
            total_tokens: (llmRequest.prompt || "").split(" ").length + 10,
        },
    };

    res.json(llmResponse);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
