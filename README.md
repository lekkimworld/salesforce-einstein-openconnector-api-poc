# Salesforce Einstein LLM Open Connector API PoC

This repo holds a very simple proof-of-concept as to how you can implement the Salesforce Einstein LLM Open Conector API that allows you to bring any LLM into Salesforce Einstein Studio. Once the model has been configured you can use it from anywhere LLM's can be used in Salesforce including Prompt Builder.

## Environment variables
Below are the supported environment variables:
* `BEARER_TOKEN` (required) Bearer token value to use either as part of an `Authorization` header following `Bearer ` or using as-is in a `api-key` header
* `PORT` (optional) The port to run the Express app at. Defaults to 3000.

## Installing locally
```bash
npm install
```

Create a `.env` file to house environment variables.

```bash 
npm run start
```

## Installing on Heroku
Simply deploy to Heroku, enable TLS and set the `BEARER_TOKEN` environment variable.

```bash
heroku apps:create
heroku certs:auto:enable
heroku config:set BEARER_TOKEN=<your bearer token>
```

## Configuring in Salesforce
1. Open Einstein Studio
2. In "Models" click "New Foundation Model"
3. Choose "Connect to your LLM" and click Next
4. Configure the model
    1. Give the model a name of your choosing
    2. Specify the URL to the app (i.e. from Heroku,  `heroku apps:info --json | jq -r ".app.web_url"`)
    3. The "Authentication"-field should be `Key Based`
    4. eave the "Auth Header"-field at `api-key`
    5. Specify the bearer token you configured when deploying the app
5. Click Connect
6. Bob's you uncle...

## The API call
The API call made to the model is very simple and is a POST message to `/chat/completions`. The body holds the prompt and configuration being sent to the model. A sample `curl` request is like below (`abc123` being the configured bearer token).

```
curl http://localhost:3000/chat/completions -X POST -H "Content-Type: application/json" -H "api-key: abc12" -d '{"messages": [{"content": "Hello World", "role": "user"}],"model": "my-model-v1", "max_tokens": 4096, "n": 1, "temperature": 1}'
```