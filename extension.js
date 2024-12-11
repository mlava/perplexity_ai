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
            description: "API Key from https://www.perplexity.ai/settings/api",
            action: { type: "select", items: ["Today Only", "2", "3", "4", "5", "6", "7", "8"] },
        },
        {
            id: "pplx-sources",
            name: "Include Sources",
            description: "Import sources for each answer",
            action: { type: "switch" },
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
                        const sourceUid = window.roamAlphaAPI.util.generateUID();
                        window.roamAlphaAPI.createBlock({ "location": { "parent-uid": uid, "order": 1 }, "block": { "string": "Sources:", "uid": sourceUid, "children-view-type": "numbered" } });

                        blocks = blocks[0].children;
                        blocks.forEach((node, order) => createBlock({
                            sourceUid,
                            order,
                            node
                        }));
                    })
                }
            }
        });

        async function fetchPplx(uid, childUid) {
            var key;
            breakme: {
                if (!extensionAPI.settings.get("pplx-apiKey")) {
                    key = "API";
                    sendConfigAlert(key);
                    break breakme;
                } else {
                    window.roamAlphaAPI.createBlock({ "location": { "parent-uid": uid, "order": 0 }, "block": { "string": "Loading...", "uid": childUid } });

                    var apiKey = extensionAPI.settings.get("pplx-apiKey");
                    var pplx_url = "https://api.perplexity.ai/chat/completions";
                    var block = await window.roamAlphaAPI.q(`[:find (pull ?page [:block/string :block/uid]) :where [?page :block/uid "${uid}"] ]`);
                    var query = block[0][0].string.toString();
                    var body = `{"model":"llama-3.1-sonar-small-128k-online","messages":[{"role":"system","content":"Be precise and concise."},{"role":"user","content":"${query}"}]}`;
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