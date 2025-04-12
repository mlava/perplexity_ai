import iziToast from "izitoast";

export default {
    onload: ({ extensionAPI }) => {
        const config = {
            tabTitle: "Perplexity AI",
            settings: [
                {
                    id: "pplx-apiKey",
                    name: "API Key",
                    description: "API Key from https://www.perplexity.ai/settings/api",
                    action: { type: "input", placeholder: "Perplexity AI API Key" },
                },
                {
                    id: "pplx-model",
                    name: "Prefered Model",
                    description: "Preferred language model",
                    action: { type: "select", items: ["Preferred Model", "sonar-deep-research", "sonar-reasoning-pro", "sonar-reasoning", "sonar-pro", "sonar", "r1-1776"] },
                },
                {
                    id: "pplx-sources",
                    name: "Include Sources",
                    description: "Import sources for each answer",
                    action: { type: "switch" },
                },
                {
                    id: "pplx-followUp",
                    name: "Allow Follow-Up Questions",
                    description: "Allow asking follow-up questions (requires SmartBlocks)",
                    action: { type: "switch" },
                },
                {
                    id: "pplx-sourcesFU",
                    name: "Include Sources in Follow-Up",
                    description: "Import sources for each follow-up answer",
                    action: { type: "switch" },
                },
                {
                    id: "pplx-instructions",
                    name: "Default instructions",
                    description: "Default system prompt / instructions",
                    action: { type: "input", placeholder: "" },
                },
                {
                    id: "pplx-advanced",
                    name: "Advanced Perplexity Settings",
                    description: "Show Perplexity fine-tuning settings",
                    action: { type: "switch", onChange: (evt) => { setConfig(evt); } },
                },
            ]
        };
        const config1 = {
            tabTitle: "Perplexity AI",
            settings: [
                {
                    id: "pplx-apiKey",
                    name: "API Key",
                    description: "API Key from https://www.perplexity.ai/settings/api",
                    action: { type: "input", placeholder: "Perplexity AI API Key" },
                },
                {
                    id: "pplx-model",
                    name: "Preferred Model",
                    description: "Preferred language model",
                    action: { type: "select", items: ["Preferred Model", "sonar-deep-research", "sonar-reasoning-pro", "sonar-reasoning", "sonar-pro", "sonar", "r1-1776"] },
                },
                {
                    id: "pplx-sources",
                    name: "Include Sources",
                    description: "Import sources for each answer",
                    action: { type: "switch" },
                },
                {
                    id: "pplx-followUp",
                    name: "Allow Follow-Up Questions",
                    description: "Allow asking follow-up questions (requires SmartBlocks)",
                    action: { type: "switch" },
                },
                {
                    id: "pplx-sourcesFU",
                    name: "Include Sources in Follow-Up",
                    description: "Import sources for each follow-up answer",
                    action: { type: "switch" },
                },
                {
                    id: "pplx-instructions",
                    name: "Default instructions",
                    description: "Default system prompt / instructions",
                    action: { type: "input", placeholder: "" },
                },
                {
                    id: "pplx-advanced",
                    name: "Advanced Perplexity Settings",
                    description: "Show Perplexity fine-tuning settings",
                    action: { type: "switch", onChange: (evt) => { setConfig(evt); } },
                },
                {
                    id: "pplx-maxTokens",
                    name: "Max tokens",
                    description: "The maximum number of completion tokens returned by the API",
                    action: { type: "input", placeholder: "" },
                },
                {
                    id: "pplx-temp",
                    name: "Temperature",
                    description: "The amount of randomness in the response (0 < x < 2)",
                    action: { type: "input", placeholder: "0.2" },
                },
                {
                    id: "pplx-topP",
                    name: "top_p filtering",
                    description: "Nucelus Sampling Threshold (0 < x < 1)",
                    action: { type: "input", placeholder: "0.9" },
                },
                {
                    id: "pplx-searchFilter",
                    name: "Search domain filter",
                    description: "Limit the citations used by the online model to URLs from the specified domains. Prepend with - to exclude a domain (as shown in default). Max 3 domains.",
                    action: { type: "input", placeholder: '["includedDomain.com", "-excludedDomain.com"]' },
                },
                {
                    id: "pplx-images",
                    name: "Return images",
                    description: "Whether the model should return images (if available)",
                    action: { type: "switch" },
                },
                {
                    id: "pplx-relatedQuestions",
                    name: "Related questions",
                    description: "Whether the model should return related questions (if available)",
                    action: { type: "switch" },
                },
                {
                    id: "pplx-recency",
                    name: "Search Recency",
                    description: "Returns search results within the specified time interval",
                    action: {
                        type: "select",
                        items: ["Timeframe", "Last Month", "Last Week", "This Day", "This Hour"]
                    }
                },
                {
                    id: "pplx-topK",
                    name: "top-k filtering",
                    description: "The number of tokens to keep for highest top-k filtering (0 < x < 2048)",
                    action: { type: "input", placeholder: "0" },
                },
                {
                    id: "pplx-presencePenalty",
                    name: "Presence Penalty",
                    description: "Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics (-2 < x < 2). Incompatible with Frequency Penalty.",
                    action: { type: "input", placeholder: "0" },
                },
                {
                    id: "pplx-frequencyPenalty",
                    name: "Frequency Penalty",
                    description: "Values greater than 1.0 penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. A value of 1.0 means no penalty (x > 0). Incompatible with Presence Penalty.",
                    action: { type: "input", placeholder: "1.0" },
                },
            ]
        };

        if (extensionAPI.settings.get("pplx-advanced") == true) {
            extensionAPI.settings.panel.create(config1);
        } else {
            extensionAPI.settings.panel.create(config);
        }

        // onChange - advanced settings panel
        async function setConfig(evt) {
            if (evt.target.checked == true) {
                extensionAPI.settings.panel.create(config1);
            } else {
                extensionAPI.settings.panel.create(config);
            }
        };

        // check and create configuration page, with instructions and SmartBlocks
        checkFirstRun();
        async function checkFirstRun() {
            var page = await window.roamAlphaAPI.q(`[:find (pull ?page [:block/string :block/uid {:block/children ...}]) :where [?page :node/title "Perplexity AI configuration"] ]`);
            if (page.length < 1) { // no config page created, so create one
                let newUid = roamAlphaAPI.util.generateUID();
                await window.roamAlphaAPI.createPage({ page: { title: "Perplexity AI configuration", uid: newUid } });
                let string1 = "Thank you for installing the Perplexity AI extension for Roam Research. This page has been automatically generated to allow for configuration.";
                let newUid1 = roamAlphaAPI.util.generateUID();
                await window.roamAlphaAPI.createBlock({ location: { "parent-uid": newUid, order: 0 }, block: { string: string1, uid: newUid1 } });
                let string2 = "This extension allows you to query the Perplexity AI API.";
                newUid1 = roamAlphaAPI.util.generateUID();
                await window.roamAlphaAPI.createBlock({ location: { "parent-uid": newUid, order: 1 }, block: { string: string2, uid: newUid1 } });
                let string3 = "You will require an API key, which you can obtain at [Perplexity AI](https://www.perplexity.ai/settings/api).";
                newUid1 = roamAlphaAPI.util.generateUID();
                await window.roamAlphaAPI.createBlock({ location: { "parent-uid": newUid, order: 2 }, block: { string: string3, uid: newUid1 } });
                let string3a = "Add your API key in the Roam Depot Settings for this extension. You can also change various settings pertaining to the AI models used as well as how the output is displayed.";
                newUid1 = roamAlphaAPI.util.generateUID();
                await window.roamAlphaAPI.createBlock({ location: { "parent-uid": newUid, order: 3 }, block: { string: string3a, uid: newUid1 } });
                let string4 = "If you also have the SmartBlocks extension installed, you can output the Perplexity response with a follow-up question button. You can turn this setting on in Roam Depot Settings. Clicking the button will prompt you to ask a follow-up question and will ensure Perplexity understands the context of your query.";
                newUid1 = roamAlphaAPI.util.generateUID();
                await window.roamAlphaAPI.createBlock({ location: { "parent-uid": newUid, order: 4 }, block: { string: string4, uid: newUid1 } });
                let string5 = "The fields below the horizontal line are the SmartBlock code required to make the buttons work. Please DO NOT change these SmartBlocks as you might break the buttons.";
                newUid1 = roamAlphaAPI.util.generateUID();
                await window.roamAlphaAPI.createBlock({ location: { "parent-uid": newUid, order: 5 }, block: { string: string5, uid: newUid1 } });
                let string6 = "If you have any issues, please request support in the Roam Research [Slack](https://app.slack.com/client/TNEAEL9QW) or the [GitHub](https://github.com/mlava/semantic-scholar/issues) page for this extension.";
                newUid1 = roamAlphaAPI.util.generateUID();
                await window.roamAlphaAPI.createBlock({ location: { "parent-uid": newUid, order: 6 }, block: { string: string6, uid: newUid1 } });
                newUid1 = roamAlphaAPI.util.generateUID();
                await window.roamAlphaAPI.createBlock({ location: { "parent-uid": newUid, order: 7 }, block: { string: "---", uid: newUid1 } });
                let ws_1 = "#SmartBlock PerplexityFollowUp";
                newUid1 = roamAlphaAPI.util.generateUID();
                await window.roamAlphaAPI.createBlock({ location: { "parent-uid": newUid, order: 9 }, block: { string: ws_1, uid: newUid1 } });
                let ws_2 = "<%PPLXFOLLOWUP%>";
                let newUid2 = roamAlphaAPI.util.generateUID();
                await window.roamAlphaAPI.createBlock({ location: { "parent-uid": newUid1, order: 0 }, block: { string: ws_2.toString(), uid: newUid2 } });

                await sleep(50);
                await window.roamAlphaAPI.ui.mainWindow.openPage({ page: { uid: newUid } });
            }
        };

        extensionAPI.ui.commandPalette.addCommand({
            label: "Ask Perplexity",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    prompt("Please focus a block before searching with Perplexity", 2, 3000);
                    return;
                } else {
                    fetchPplx(false, uid, null);
                }
            }
        });

        const args = {
            text: "PPLXFOLLOWUP",
            help: "Ask a Follow-Up question from Perplexity AI",
            handler: (context) => () => {
                var messageHistory = context.variables.messageHistory;
                var uid = context.triggerUid;
                fetchPplx(true, uid, messageHistory);
                return '';
            },
        };
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.registerCommand(args);
        } else {
            document.body.addEventListener(
                `roamjs:smartblocks:loaded`,
                () =>
                    window.roamjs?.extension.smartblocks &&
                    window.roamjs.extension.smartblocks.registerCommand(args)
            );
        }

        async function fetchPplx(sb, uid, messageHistory) {
            var key, key1, instructions;
            var model = "sonar";
            var showSources = false;
            var showSourcesFU = false;
            var followUpSwitch = false;
            var maxTokens, temp, topP, searchFilter, recency, topK, presencePenalty, frequencyPenalty;
            var showImages = false;
            var relatedQs = false;
            var originalBlock;
            var childUid;

            breakme: {
                if (!extensionAPI.settings.get("pplx-apiKey")) {
                    key = "API";
                    sendConfigAlert(key);
                    break breakme;
                } else {
                    var apiKey = extensionAPI.settings.get("pplx-apiKey");
                    if (extensionAPI.settings.get("pplx-model") != "Preferred Model") {
                        model = extensionAPI.settings.get("pplx-model");
                    } else {
                        model = "sonar";
                    }
                    if (extensionAPI.settings.get("pplx-sources") == true) {
                        showSources = true;
                    }
                    if (extensionAPI.settings.get("pplx-followUp") == true) {
                        followUpSwitch = true;
                    }
                    if (extensionAPI.settings.get("pplx-sourcesFU") == true) {
                        showSourcesFU = true;
                    }
                    if (extensionAPI.settings.get("pplx-instructions") != null && extensionAPI.settings.get("pplx-instructions") != "") {
                        instructions = extensionAPI.settings.get("pplx-instructions");
                    }
                    if (extensionAPI.settings.get("pplx-maxTokens") != null && extensionAPI.settings.get("pplx-maxTokens") != "") {
                        if (isStringInteger(extensionAPI.settings.get("pplx-maxTokens"))) {
                            maxTokens = extensionAPI.settings.get("pplx-maxTokens");
                        } else {
                            key = "int";
                            key1 = "maxTokens";
                            sendConfigAlert(key, key1);
                            break breakme;
                        }
                    }
                    if (extensionAPI.settings.get("pplx-temp") != null && extensionAPI.settings.get("pplx-temp") != "") {
                        const tempSetting = extensionAPI.settings.get("pplx-temp");
                        if (isValidNumber(tempSetting, 0, 2)) {
                            temp = tempSetting;
                        } else {
                            key = "number";
                            key1 = "temp";
                            sendConfigAlert(key, key1);
                            break breakme;
                        }
                    }
                    if (extensionAPI.settings.get("pplx-topP") != null && extensionAPI.settings.get("pplx-topP") != "") {
                        if (extensionAPI.settings.get("pplx-topK") != null && extensionAPI.settings.get("pplx-topK") != "") {
                            key = "incompatibleSettings";
                            key1 = "topPK";
                            sendConfigAlert(key, key1);
                            break breakme;
                        } else if (isValidNumber(extensionAPI.settings.get("pplx-topP"), 0, 1)) {
                            topP = extensionAPI.settings.get("pplx-topP");
                        } else {
                            key = "number";
                            key1 = "topP";
                            sendConfigAlert(key, key1);
                            break breakme;
                        }
                    }
                    if (extensionAPI.settings.get("pplx-searchFilter") != null && extensionAPI.settings.get("pplx-searchFilter") != "") {
                        if (extensionAPI.settings.get("pplx-searchFilter") != null && extensionAPI.settings.get("pplx-searchFilter") != "") {
                            if (validateSearchDomainFilter(extensionAPI.settings.get("pplx-searchFilter"))) {
                                searchFilter = JSON.parse(extensionAPI.settings.get("pplx-searchFilter"));
                            } else {
                                key = "searchFilter";
                                sendConfigAlert(key, key1);
                                break breakme;
                            }
                        }
                    }
                    if (extensionAPI.settings.get("pplx-images") == true) {
                        showImages = true;
                    }
                    if (extensionAPI.settings.get("pplx-relatedQuestions") == true) {
                        relatedQs = true;
                    }
                    if (extensionAPI.settings.get("pplx-recency") != "Timeframe") {
                        if (extensionAPI.settings.get("pplx-recency") == "Last Month") {
                            recency = "month";
                        } else if (extensionAPI.settings.get("pplx-recency") == "Last Week") {
                            recency = "week";
                        } if (extensionAPI.settings.get("pplx-recency") == "This Day") {
                            recency = "day";
                        } if (extensionAPI.settings.get("pplx-recency") == "This Hour") {
                            recency = "hour";
                        }
                    } else {
                        recency = null;
                    }
                    if (extensionAPI.settings.get("pplx-topK") != null && extensionAPI.settings.get("pplx-topK") != "") {
                        if (extensionAPI.settings.get("pplx-topP") != null && extensionAPI.settings.get("pplx-topP") != "") {
                            key = "incompatibleSettings";
                            key1 = "topPK";
                            sendConfigAlert(key, key1);
                            break breakme;
                        } else if (isValidTopK(extensionAPI.settings.get("pplx-topK"))) {
                            topK = extensionAPI.settings.get("pplx-topK");
                        } else {
                            key = "int";
                            key1 = "topK";
                            sendConfigAlert(key, key1);
                            break breakme;
                        }
                    }
                    if (extensionAPI.settings.get("pplx-presencePenalty") != null && extensionAPI.settings.get("pplx-presencePenalty") != "") {
                        if (extensionAPI.settings.get("pplx-frequencyPenalty") != null && extensionAPI.settings.get("pplx-frequencyPenalty") != "") {
                            key = "incompatibleSettings";
                            key1 = "penalty";
                            sendConfigAlert(key, key1);
                            break breakme;
                        } else if (isValidNumber(extensionAPI.settings.get("pplx-presencePenalty"), -2, 2)) {
                            presencePenalty = extensionAPI.settings.get("pplx-presencePenalty");
                        } else {
                            key = "number";
                            key1 = "presencePenalty";
                            sendConfigAlert(key, key1);
                            break breakme;
                        }
                    }
                    if (extensionAPI.settings.get("pplx-frequencyPenalty") != null && extensionAPI.settings.get("pplx-frequencyPenalty") != "") {
                        if (extensionAPI.settings.get("pplx-presencePenalty") != null && extensionAPI.settings.get("pplx-presencePenalty") != "") {
                            key = "incompatibleSettings";
                            key1 = "penalty";
                            sendConfigAlert(key, key1);
                            break breakme;
                        } else {
                            const trimmedValue = String(extensionAPI.settings.get("pplx-frequencyPenalty")).trim();
                            const number = Number(trimmedValue);
                            if (isNaN(number) || !isFinite(number) || number < 0) {
                                key = "number";
                                key1 = "frequencyPenalty";
                                sendConfigAlert(key, key1);
                                break breakme;
                            } else {
                                frequencyPenalty = extensionAPI.settings.get("pplx-frequencyPenalty");
                            }
                        }
                    }

                    // create the query body
                    var messages = [];
                    var message;
                    if (sb == true) {
                        // first, save the current block text just in case user cancels search so we can restore the original text
                        originalBlock = "{{Ask Follow-Up Question:SmartBlock:PerplexityFollowUp:messageHistory=" + messageHistory + "}}";

                        // then, make it ready to use
                        const regex = /___/gm;
                        const subst = `:`;
                        const regex1 = /______/gm;
                        const subst1 = `,`;
                        messageHistory = messageHistory.replace(regex1, subst1);
                        messageHistory = messageHistory.replace(regex, subst);

                        messageHistory = JSON.parse(messageHistory);
                        for (const message of messageHistory) {
                            if (message) {
                                messages.push(message);
                            }
                        }
                    } else {
                        if (instructions != undefined && instructions != null) {
                            message = `{"role":"system", "content":"${instructions}"}`;
                            messages.push(JSON.parse(message));
                        }
                    }
                    let string = "What do you want to ask?";

                    if (!sb) { 
                        // get the current block text just in case user cancels search so we can restore the original text
                        originalBlock = await window.roamAlphaAPI.pull("[:block/string]", [":block/uid", uid])?.[":block/string"];
                    }

                    var searchQuery = await prompt(string, 1);

                    if (searchQuery != "cancelled") {
                        await sleep(50);
                        await window.roamAlphaAPI.updateBlock({
                            block: { "uid": uid, "string": searchQuery, }
                        });
                        childUid = window.roamAlphaAPI.util.generateUID();
                        window.roamAlphaAPI.createBlock({ "location": { "parent-uid": uid, "order": 0 }, "block": { "string": "Loading...", "uid": childUid } });
                        message = `{"role":"user", "content":"${searchQuery}"}`;
                        messages.push(JSON.parse(message));
                    } else {
                        prompt("You cancelled the search", 2, 3000);
                        await window.roamAlphaAPI.updateBlock({
                            block: { "uid": uid, "string": originalBlock, }
                        });
                        return '';
                    }

                    // send to pplx
                    var pplx_url = "https://api.perplexity.ai/chat/completions";
                    var data = {
                        model: model,
                        messages: messages
                    };
                    if (maxTokens != null && maxTokens != undefined) {
                        data.max_tokens = maxTokens;
                    }
                    if (temp != null && temp != undefined) {
                        data.temperature = temp;
                    }
                    if (topP != null && topP != undefined) {
                        data.top_p = topP;
                    }
                    if (searchFilter != null && searchFilter != undefined) {
                        data.search_domain_filter = searchFilter;
                    }
                    if (showImages) {
                        data.return_images = true;
                    }
                    if (relatedQs) {
                        data.return_related_questions = true;
                    }
                    if (recency != null && recency != undefined) {
                        data.search_recency_filter = recency;
                    }
                    if (topK != null && topK != undefined) {
                        data.top_k = topK;
                    }
                    if (presencePenalty != null && presencePenalty != undefined) {
                        data.presence_penalty = presencePenalty;
                    }
                    if (frequencyPenalty != null && frequencyPenalty != undefined) {
                        data.frequency_penalty = frequencyPenalty;
                    }
                    
                    var options = {
                        method: 'POST',
                        headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    };

                    return await fetch(pplx_url, options)
                        .then(response => response.json())
                        .then(response => {
                            var string = response.choices[0].message.content;
                            const messageObject = {
                                role: "assistant",
                                content: escapeJsonString(string)
                            };
                            messages.push(messageObject);

                            const regex = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/gm;
                            const subst = `__$1__`;
                            string = string.replace(regex, subst);
                            if (!showSources) {
                                const regexSources = /(\[[\d]?\])/gm;
                                const substSources = ``;
                                string = string.replace(regexSources, substSources);
                            }

                            var extras = [];
                            var sources = [];
                            if (sb && showSourcesFU) {
                                for (var i = 0; i < response.citations.length; i++) {
                                    sources.push({ "text": response.citations[i] });
                                }
                                extras.push({ sources });
                            } else if (showSources && !sb) {
                                for (var i = 0; i < response.citations.length; i++) {
                                    sources.push({ "text": response.citations[i] });
                                }
                                extras.push({ sources });
                            }

                            if (window.roamjs?.extension?.smartblocks && followUpSwitch) {
                                var followUp = [];
                                var askAnother = "";
                                const regex = /:/gm;
                                const subst = `___`;
                                const regex1 = /,/gm;
                                const subst1 = `______`;
                                var messageString = JSON.stringify(messages);
                                messageString = messageString.replace(regex, subst);
                                messageString = messageString.replace(regex1, subst1);
                                askAnother = "{{Ask Follow-Up Question:SmartBlock:PerplexityFollowUp:messageHistory=" + messageString + "}}";
                                followUp.push({ "text": askAnother });
                                extras.push({ followUp });
                            }
                            window.roamAlphaAPI.updateBlock({
                                block: { "uid": childUid, "string": string, }
                            });

                            if (!isArrayEmpty(extras) && extras[0].hasOwnProperty("sources")) {
                                const sourceUid = window.roamAlphaAPI.util.generateUID();
                                window.roamAlphaAPI.createBlock({ "location": { "parent-uid": uid, "order": 1 }, "block": { "string": "Sources:", "uid": sourceUid, "children-view-type": "numbered" } });

                                extras[0].sources.forEach((node, order) => createBlock({
                                    sourceUid,
                                    order,
                                    node
                                }));
                            } else if (!isArrayEmpty(extras) && extras[0].hasOwnProperty("followUp")) {
                                const sourceUid = window.roamAlphaAPI.util.generateUID();
                                window.roamAlphaAPI.createBlock({ "location": { "parent-uid": uid, "order": 1 }, "block": { "string": "Follow Up:", "uid": sourceUid } });

                                extras[0].followUp.forEach((node, order) => createBlock({
                                    sourceUid,
                                    order,
                                    node
                                }));
                            }
                            if (!isArrayEmpty(extras) && extras.length > 1) {
                                const sourceUid = window.roamAlphaAPI.util.generateUID();
                                window.roamAlphaAPI.createBlock({ "location": { "parent-uid": uid, "order": 2 }, "block": { "string": "Follow Up:", "uid": sourceUid } });

                                extras[1].followUp.forEach((node, order) => createBlock({
                                    sourceUid,
                                    order,
                                    node
                                }));
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            prompt("Your Perplexity search failed. Check your browser's console logs for more details.", 2, 3000);
                            window.roamAlphaAPI.updateBlock({
                                block: { "uid": uid, "string": originalBlock, }
                            });
                            let children = window.roamAlphaAPI.pull("[{:block/children ...} :block/uid :block/string]", [":block/uid", uid])?.[
                                ":block/children"
                            ];
                            if (children != null && children != undefined && children.length > 0) {
                                for (var q = 0; q < children.length; q++) {
                                    if (children[q][":block/string"] == "Loading...") {
                                        window.roamAlphaAPI.deleteBlock({ block: { uid: children[q][":block/uid"] } });
                                    }
                                }
                            }
                            return '';
                        });
                }
            }
        }
    },
    onunload: () => {
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.unregisterCommand("PPLXFOLLOWUP");
        };
    }
}


// helper functions
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeJsonString(str) { // thanks to Perplexity chat for providing this code :-)
    return JSON.stringify(str).slice(1, -1)
        .replace(/\\/g, '\\\\')
        .replace(/\u0008/g, '\\b')
        .replace(/\u000c/g, '\\f')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

const isArrayEmpty = (arr) => Array.isArray(arr) && arr.length === 0;

function isStringInteger(value) {
    const number = Number(value);
    return !isNaN(number) && Number.isInteger(number);
}

function isValidNumber(value, lowerLimit, upperLimit) {
    try {
        const trimmedValue = String(value).trim();
        if (trimmedValue === '') {
            return false;
        }
        const number = Number(trimmedValue);
        if (isNaN(number) || !isFinite(number)) {
            return false;
        }
        return number >= lowerLimit && number <= upperLimit;
    } catch (error) {
        console.error("Error in isValidNumber:", error);
        return false;
    }
}

function validateSearchDomainFilter(input) {
    try {
        const filter = JSON.parse(input);
        if (!Array.isArray(filter)) {
            return false;
        }
        if (filter.length === 0 || filter.length > 3) {
            return false;
        }
        for (const domain of filter) {
            if (typeof domain !== 'string') {
                return false;
            }
            if (domain.trim() === '') {
                return false;
            }
            const domainRegex = /^(-)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/;
            if (!domainRegex.test(domain)) {
                return false;
            }
        }
        return true;
    } catch (error) {
        return false;
    }
}

function isValidTopK(value) {
    const number = Number(value);
    return Number.isInteger(number) && !isNaN(number) && number >= 0 && number <= 2048;
}

function sendConfigAlert(key, key1) {
    if (key == "API") {
        prompt("Please set the API key from https://www.perplexity.ai/settings/api in the configuration settings via the Roam Depot tab.", 2, 3000);
    } else if (key == "int") {
        if (key1 == "maxTokens") {
            prompt("Please make sure you are entering an integer if you want to set 'Max tokens' in Roam Depot Settings.", 2, 3000);
        } else if (key1 == "topK") {
            prompt("Please make sure you are entering an integer between 0 and 2048 if you want to set 'top-k filtering' in Roam Depot Settings.", 2, 3000);
        }
    } else if (key == "number") {
        if (key1 == "temp") {
            prompt("Please make sure you are entering a number between 0 and 2 if you want to set 'Temperature' in Roam Depot Settings.", 2, 3000);
        } else if (key1 == "topP") {
            prompt("Please make sure you are entering a number between 0 and 1 if you want to set 'top_p filtering' in Roam Depot Settings.", 2, 3000);
        } else if (key1 == "presencePenalty") {
            prompt("Please make sure you are entering a number between -2 and 2 if you want to set 'Presence Penalty' in Roam Depot Settings.", 2, 3000);
        } else if (key1 == "frequencyPenalty") {
            prompt("Please make sure you are entering a number greater than 0 if you want to set 'Frequency Penalty' in Roam Depot Settings.", 2, 3000);
        }
    } else if (key == "searchFilter") {
        prompt("Please make sure you are entering a valid 'Search domain filter' in Roam Depot Settings. An example filter can be found in the ReadMe for this extension.", 2, 3000);
    } else if (key == "incompatibleSettings") {
        if (key1 == "topPK") {
            prompt("The Perplexity API documentation suggests setting only one of top_p filtering or top_k filtering but not both. Please review your tuning in the Roam Depot Settings.", 2, 3000);
        } else if (key1 == "penalty") {
            prompt("The Perplexity API documentation suggests setting only one of Presence Penalty or Frequency Penalty but not both. Please review your tuning in the Roam Depot Settings.", 2, 3000);
        }
    }
}

async function prompt(string, type, duration) {
    if (type == 1) {
        return new Promise((resolve) => {
            iziToast.question({
                theme: 'light',
                color: 'black',
                layout: 2,
                class: 'perplexity',
                drag: false,
                timeout: false,
                close: false,
                overlay: true,
                displayMode: 2,
                id: "question",
                title: "Perplexity AI",
                message: string,
                position: "center",
                onClosed: function () { resolve("cancelled") },
                inputs: [
                    [
                        '<input type="text" placeholder="">',
                        "keyup",
                        function (instance, toast, input, e) {
                            if (e.code === "Enter") {
                                instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                                resolve(e.srcElement.value);
                            }
                        },
                        true,
                    ],
                ],
                buttons: [
                    [
                        "<button><b>Confirm</b></button>",
                        async function (instance, toast, button, e, inputs) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            resolve(inputs[0].value);
                        },
                        false,
                    ],
                    [
                        "<button>Cancel</button>",
                        async function (instance, toast, button, e) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            resolve("cancelled");
                        },
                    ],
                ],
            });
        })
    } else if (type == 2) {
        iziToast.show({
            theme: 'dark',
            message: string,
            class: 'perplexity-info',
            position: 'center',
            close: false,
            timeout: duration,
            closeOnClick: true,
            closeOnEscape: true,
            displayMode: 2
        });
    }
}

// copied and adapted from https://github.com/dvargas92495/roamjs-components/blob/main/src/writes/createBlock.ts
const createBlock = (params) => {
    const uid = window.roamAlphaAPI.util.generateUID();
    return Promise.all([
        window.roamAlphaAPI.createBlock({
            location: {
                "parent-uid": params.sourceUid,
                order: params.order,
            },
            block: {
                uid,
                string: params.node.text
            }
        })
    ].concat((params.node.children || []).map((node, order) =>
        createBlock({ parentUid: uid, order, node })
    )))
};