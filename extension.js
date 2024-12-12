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
            action: { type: "select", items: ["Preferred Model", "llama-3.1-sonar-small-128k-online", "llama-3.1-sonar-large-128k-online", "llama-3.1-sonar-huge-128k-online"] },
        },
        {
            id: "pplx-sources",
            name: "Include Sources",
            description: "Import sources for each answer",
            action: { type: "switch" },
        },
        {
            id: "pplx-instructions",
            name: "Default instructions",
            description: "Default system prompt / instructions",
            action: { type: "input", placeholder: "" },
        },
    ]
};

export default {
    onload: ({ extensionAPI }) => {
        extensionAPI.settings.panel.create(config);

        extensionAPI.ui.commandPalette.addCommand({
            label: "Ask Perplexity",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please focus a block before asking Perplexity");
                    return;
                } else {
                    const childUid = window.roamAlphaAPI.util.generateUID();
                    fetchPplx(uid, childUid).then(async (blocks) => {
                        await window.roamAlphaAPI.updateBlock({
                            block: { uid: childUid, string: blocks[0].text.toString(), }
                        });
                        if (blocks[0].hasOwnProperty("children")) {
                            const sourceUid = window.roamAlphaAPI.util.generateUID();
                            window.roamAlphaAPI.createBlock({ "location": { "parent-uid": uid, "order": 1 }, "block": { "string": "Sources:", "uid": sourceUid, "children-view-type": "numbered" } });
    
                            blocks = blocks[0].children;
                            blocks.forEach((node, order) => createBlock({
                                sourceUid,
                                order,
                                node
                            }));
                            const followUpUid = window.roamAlphaAPI.util.generateUID();
                            window.roamAlphaAPI.createBlock({ "location": { "parent-uid": uid, "order": 2 }, "block": { "string": "Follow-Up:", "uid": followUpUid, } });
                            const followUpUid1 = window.roamAlphaAPI.util.generateUID();
                            window.roamAlphaAPI.createBlock({ "location": { "parent-uid": followUpUid, "order": 0 }, "block": { "string": "", "uid": followUpUid1, } });
                         }
                    })
                }
            }
        });

        async function fetchPplx(uid, childUid) {
            var key, model, instructions;
            var showSources = true;
            breakme: {
                if (!extensionAPI.settings.get("pplx-apiKey")) {
                    key = "API";
                    sendConfigAlert(key);
                    break breakme;
                } else {
                    window.roamAlphaAPI.createBlock({ "location": { "parent-uid": uid, "order": 0 }, "block": { "string": "Loading...", "uid": childUid } });
                    var apiKey = extensionAPI.settings.get("pplx-apiKey");
                    if (extensionAPI.settings.get("pplx-model") != "Preferred Model") {
                        model = extensionAPI.settings.get("pplx-model");
                    } else {
                        model = "llama-3.1-sonar-small-128k-online";
                    }
                    if (extensionAPI.settings.get("pplx-sources") == false) {
                        showSources = false;
                    }
                    if (extensionAPI.settings.get("pplx-instructions") != null) {
                        instructions = extensionAPI.settings.get("pplx-instructions");
                    }

                    var messages = [];
                    var message;
                    if (instructions != undefined && instructions != null) {
                        message = `{"role":"system", "content":"${instructions}"}`;
                        messages.push(message);
                    }

                    var block = await window.roamAlphaAPI.q(`[:find (pull ?page [:block/string :block/uid]) :where [?page :block/uid "${uid}"] ]`);
                    var query = block[0][0].string.toString();

                    message = `{"role":"user", "content":"${query}"}`;
                    messages.push(message);

                    var pplx_url = "https://api.perplexity.ai/chat/completions";
                    var body = `{"model":"${model}","messages":[${messages}]}`;
                    console.info(body);
                    const options = {
                        method: 'POST',
                        headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
                        body: body
                    };

                    return await fetch(pplx_url, options)
                        .then(response => response.json())
                        .then(response => {
                            console.info(response);
                            var string = response.choices[0].message.content.toString();
                            const regex = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/gm;
                            const subst = `__$1__`;
                            const regex1 = /### (.+)/gm;
                            const subst1 = `**$1**`;
                            string = string.replace(regex, subst);
                            //string = string.replace(regex1, subst1);

                            if (showSources) {
                                var sources = [];
                                for (var i = 0; i < response.citations.length; i++) {
                                    sources.push({ "text": response.citations[i] });
                                }
                                return [
                                    {
                                        text: string,
                                        children: sources
                                    },
                                ];
                            } else {
                                return [
                                    {
                                        text: string
                                    },
                                ];
                            }
                        })
                        .catch(err => console.error(err));
                }
            }
        }
    },
    onunload: () => {
    }
}

function sendConfigAlert(key) {
    if (key == "API") {
        alert("Please set the API key from https://www.perplexity.ai/settings/api in the configuration settings via the Roam Depot tab.");
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