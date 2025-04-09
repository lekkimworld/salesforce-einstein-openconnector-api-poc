// llm-open-connector-app.ts
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import {config as dotenv_config} from "dotenv";
dotenv_config();

// Types and Interfaces based on the OpenAPI spec
type LLMRequestMessage = {
    content: string;
    role: "system" | "user" | "assistant";
    name?: string;
}
type LLMRequest = {
    messages: LLMRequestMessage[];
    model: string;
    max_tokens?: number;
    n?: number;
    temperature?: number;
    parameters?: any;
}

type LLMResponse = {
    id: string;
    choices: LLMResponseChoice[];
    created: number;
    model: string;
    object: "chat.completion";
    usage?: LLMResponseUsage;
}

type LLMResponseChoice = {
    finish_reason: "stop" | "length" | "tool_calls" | "content_filter" | "function_call";
    index: number;
    message: LLMResponseChoiceMessage;
};

type LLMResponseChoiceMessage = {
    content?: string;
    role: "assistant"
}

interface Logprobs {
    tokens: string[];
    token_logprobs: number[];
    top_logprobs: Record<string, number>[];
    text_offset: number[];
}

type LLMResponseUsage = {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
};

type LLMError = {
    code?: number;
    message: string;
    param?: string;
    type: string;
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
    console.log(`Received request for <${req.path}>`);
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
    console.log("Received request", JSON.stringify(llmRequest));

    const response = "This is my response...";

    const completion_tokens = Math.ceil(response.length / 4);
    const prompt_tokens = Math.ceil(llmRequest.messages.reduce((total, msg) => {
        return total + msg.content.length;
    }, 0) / 4);
    const total_tokens = completion_tokens + prompt_tokens;

    // Simulate LLM response (replace with actual LLM logic)
    const llmResponse: LLMResponse = {
        id: "cmpl-123",
        choices: [
            {
                message: {
                    role: "assistant",
                    content: response
                },
                index: 0,
                finish_reason: "stop",
            },
        ],
        created: Date.now() / 1000,
        model: llmRequest.model,
        object: "chat.completion",
        usage: {
            completion_tokens,
            prompt_tokens,
            total_tokens,
        }
    };
    console.log("Generated response", JSON.stringify(llmResponse));

    res.json(llmResponse);
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message,
    code: statusCode,
    type: "error",
    param: undefined
  } as LLMError);
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
