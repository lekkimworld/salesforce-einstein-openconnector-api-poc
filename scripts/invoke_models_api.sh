#!/bin/sh
source .env

# use client_credentials flow to get access token
JSON_RESPONSE=$( curl --silent -X POST https://storm-3d3bd333192d80.my.salesforce.com/services/oauth2/token -d "grant_type=client_credentials&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET" )
ACCESS_TOKEN=$( echo $JSON_RESPONSE | jq -r ".access_token" )

# define models
MODEL_SF="sfdc_ai__DefaultOpenAIGPT4OmniMini"
MODEL_CUSTOM="Heroku_Poc_Basic_CM_12l_0Ay5a418d3e"

# use curl to invoke the Models API
curl --location "https://api.salesforce.com/einstein/platform/v1/models/$MODEL_SF/generations" \
--silent \
--header "Authorization: Bearer $ACCESS_TOKEN" \
--header 'Content-Type: application/json' \
--header 'x-sfdc-app-context: EinsteinGPT' \
--header 'x-client-feature-id: ai-platform-models-connected-app' \
--data '{
    "prompt": "James Lee is a financial advisor, living in San Diego. His phone number is 867-5309. Generate a story about his work and life."
}'
