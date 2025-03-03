Search the advanced conversational search engine at Perplexity AI using their API from within your Roam Research graph.

You will need an API key from https://www.perplexity.ai/settings/api and you can enter this in the Roam Depot settings for this extension. 

You will also need to choose the AI model to use for your search. The currently available options are available from https://docs.perplexity.ai/guides/model-cards.

Pricing for the Perplexity AI service can be found at https://docs.perplexity.ai/guides/pricing, and rate limits and usage tiers are at https://docs.perplexity.ai/guides/usage-tiers.

You can trigger this extension using the Command palette and the 'Ask Perplexity' command. You can choose to output the Sources on which Perplexity has relied to create its response. You can also turn on the option to show a Follow Up section. With both turned on the output to your first question will be something like this:

<img width="1177" alt="image" src="https://github.com/user-attachments/assets/494ed76a-2861-431b-9f44-595040cc4369" />

When this extension is installed, it creates a page in your graph with a SmartBlock. If you are using the SmartBlocks extension, which you absolutely should be, you can turn on the option to ask Follow-Up Questions in your Roam Depot Settings for this extension. Then, click the 'Ask Follow-Up Question' button as shown in the image above. This will create a pop-up in which you can enter a follow-up query.

The result of the call will be displayed nested below the original query.

<img width="1094" alt="image" src="https://github.com/user-attachments/assets/12c35358-0ca0-449d-aadb-31b31d02a339" />

You can keep asking follow-up questions for as long as you wish, and the extension will keep track of the discussions.

The settings pane in Roam Depot looks something like this:

<img width="1004" alt="image" src="https://github.com/user-attachments/assets/f210a0b4-6c82-4f9c-8b39-312531210f6c" />

The 'Include Sources in Follow-Up' setting allows you to turn on or off the sources display for any follow-up questions. Some users might prefer to have Sources for their first query but not their follow-up queries. It's up to you.

Finally, the 'Default instructions' field allows you to specify some general instructions you wish to apply to all queries. Examples of these can be found on the Perplexity website, but one is copied below for convenience.

`Consider all context from our conversation thread and use that context along with any results your search may produce to inform your response.`

Perplexity also has an array of settings you could use to fine-tune your queries if you wish. You can access these by turning the 'Advanced Perplexity Settings' switch to ON.

Each of these settings is described in the documents at https://docs.perplexity.ai/api-reference/chat-completions. This extension will check to make sure that any changes you specify are within the parameters described in the Perplexity docs. Note that a toast will appear if something you enter is outside the allowed range.

For the 'Search domain filter' you can enter domains that you wish to search from or exclude. This feature is only available for some Perplexity account tiers. If you wish to use this, you need to enter an array as shown below. "space.com" will allow searching this domain. "-wikipedia.org" will exclude data from Wikipedia due to the preceding - sign. There is a limit of three domain filters you can list.

`["space.com", "nasa.gov", "-wikipedia.org"]`

If you have any issues, you can check the API documents at Perplexity or ask questions on Slack.
