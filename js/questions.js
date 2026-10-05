const q = (
  id,
  prompt,
  options,
  help = "Choose the answer that best fits. There’s no wrong answer.",
) => ({ id, prompt, options, help });
const N = "I haven’t used it recently";
const brandQuestions = {
  starbucks: [
    q(
      "channel",
      "Think about your most recent Starbucks visit. How did you order?",
      ["At the counter", "Drive-through", "Mobile order pickup", "Delivery", N],
    ),
    q("order", "What was the main part of your order?", [
      "A hot drink",
      "A cold drink",
      "Food",
      "Packaged coffee or merchandise",
    ]),
    q("reason", "What made you choose Starbucks that day?", [
      "A drink I already love",
      "A convenient location",
      "Rewards or an offer",
      "A place to spend time",
      "Something new on the menu",
    ]),
    (a) =>
      q(
        "quality",
        a[1] === "Food"
          ? "How fresh did your food feel?"
          : "How did the taste and temperature compare with what you expected?",
        [
          "Just as I hoped",
          "Good, but not consistent",
          "The temperature was off",
          "The taste or freshness was off",
          "I couldn’t tell",
        ],
      ),
    (a) =>
      q(
        "quality-detail",
        a[3] === "Just as I hoped"
          ? "What made the order feel right?"
          : "What would have made that order better?",
        a[3] === "Just as I hoped"
          ? [
              "It matched my usual order",
              "The ingredients tasted fresh",
              "My customization was right",
              "It arrived at the right temperature",
            ]
          : [
              "More consistent preparation",
              "The right serving temperature",
              "Correct milk or other customization",
              "Better freshness",
              "Clearer product descriptions",
            ],
      ),
    (a) =>
      q(
        "handoff",
        a[0] === "Delivery"
          ? "What was the delivery experience like?"
          : a[0] === "Drive-through"
            ? "How did the drive-through wait feel?"
            : a[0] === "Mobile order pickup"
              ? "How easy was it to find your mobile order?"
              : "How clear was the ordering and pickup process?",
        [
          "Easy and as expected",
          "A little confusing",
          "The wait was longer than expected",
          "I needed help to find my order",
          "Not applicable",
        ],
      ),
    q(
      "availability",
      "Could you get the items and customizations you wanted?",
      [
        "Everything was available",
        "My preferred item was unavailable",
        "A customization was unavailable",
        "I chose something else because of the price",
        "I wasn’t looking for anything specific",
      ],
    ),
    q("app", "Have you used the Starbucks app or rewards?", [
      "Yes, and it was straightforward",
      "Yes, but an offer was confusing",
      "Yes, but ordering was difficult",
      "I don’t use the app or rewards",
    ]),
    (a) =>
      q(
        "app-followup",
        a[7] === "I don’t use the app or rewards"
          ? "What would make ordering easier for you?"
          : "Which part of the app experience matters most to you?",
        a[7] === "I don’t use the app or rewards"
          ? [
              "A clearer menu",
              "Faster in-person ordering",
              "More helpful staff",
              "Easy ordering without an account",
              "The current experience works for me",
            ]
          : [
              "Clear reward eligibility",
              "Accurate pickup estimates",
              "Easy customization",
              "Reliable payment",
              "Nothing needs changing",
            ],
      ),
    q("priority", "If Starbucks changed one thing first, what should it be?", [
      "More consistent drinks",
      "Better everyday prices",
      "Faster, clearer pickup",
      "Better item availability",
      "More welcoming spaces",
    ]),
  ],
  apple: [
    q("device", "Which Apple device do you use most?", [
      "iPhone",
      "Mac",
      "iPad",
      "Apple Watch",
      "Another Apple device",
      N,
    ]),
    q("task", "What do you rely on it for most?", [
      "Work or study",
      "Keeping in touch",
      "Creative projects",
      "Entertainment",
      "Health or fitness",
    ]),
    q(
      "reliability",
      "How often does your device get in the way of that task?",
      [
        "Rarely or never",
        "Once in a while",
        "Several times a week",
        "Almost every time",
        "Not sure",
      ],
    ),
    q("friction", "Which issue affects your day the most?", [
      "Battery life",
      "Storage space",
      "Speed or reliability",
      "Connecting with other devices",
      "Accessibility or ease of use",
      "No major issue",
    ]),
    (a) =>
      q(
        "friction-detail",
        {
          "Battery life": "When is battery life most frustrating?",
          "Storage space": "What creates the most storage pressure?",
          "Speed or reliability": "When do slowdowns or failures show up?",
          "Connecting with other devices":
            "Which connection needs to work better?",
          "Accessibility or ease of use":
            "What would make the device easier to use?",
          "No major issue": "What works particularly well for you?",
        }[a[3]],
        {
          "Battery life": [
            "During active use",
            "While the device is idle",
            "After a software update",
            "When the device is older",
            "Not sure",
          ],
          "Storage space": [
            "Photos and videos",
            "Apps and downloads",
            "System storage",
            "Confusing cloud and local storage",
            "Not sure",
          ],
          "Speed or reliability": [
            "Opening apps",
            "Switching between tasks",
            "After updates",
            "During longer sessions",
            "Not sure",
          ],
          "Connecting with other devices": [
            "Sharing files",
            "Connecting accessories",
            "Using non-Apple devices",
            "Keeping settings in sync",
            "Not sure",
          ],
          "Accessibility or ease of use": [
            "Clearer settings",
            "Larger or clearer text",
            "Better voice controls",
            "More consistent gestures",
            "Not sure",
          ],
          "No major issue": [
            "Reliable everyday performance",
            "Battery life",
            "Simple controls",
            "Devices working together",
            "Support when I need it",
          ],
        }[a[3]],
      ),
    q("updates", "How have software updates affected your routine?", [
      "Mostly smooth and helpful",
      "They sometimes interrupt my workflow",
      "An app or accessory stopped working",
      "I usually delay them",
      "I’m not sure",
    ]),
    q("support", "Have you needed repair or support for this device?", [
      "Yes, and it resolved the issue",
      "Yes, but the issue remains",
      "Yes, but the cost stopped me",
      "No, I haven’t needed it",
    ]),
    (a) =>
      q(
        "support-detail",
        a[6] === "No, I haven’t needed it"
          ? "If you needed help, where would you want to start?"
          : "What would improve the support experience?",
        a[6] === "No, I haven’t needed it"
          ? [
              "Clear self-service instructions",
              "Online chat",
              "A phone call",
              "In-person help",
            ]
          : [
              "Clearer pricing up front",
              "Less repeating the problem",
              "Faster access to help",
              "A lasting fix",
              "Nothing needs changing",
            ],
      ),
    q("purchase", "What will matter most when you replace this device?", [
      "Total price",
      "Long useful life",
      "Compatibility with what I own",
      "Repairability",
      "Clear privacy controls",
    ]),
    q("priority", "What should Apple improve first for your daily use?", [
      "Battery and longevity",
      "Storage management",
      "Reliable software",
      "Working with other devices",
      "Price and repair options",
    ]),
  ],
  nike: [
    q("experience", "What’s your most recent Nike experience?", [
      "Bought a product",
      "Tried a product on",
      "Browsed without buying",
      N,
    ]),
    q("product", "Which product were you most interested in?", [
      "Running shoes",
      "Training shoes",
      "Everyday shoes",
      "Sportswear",
      "Something else",
    ]),
    q("activity", "What did you want to use it for?", [
      "Running",
      "Gym or training",
      "Walking and everyday wear",
      "A team sport",
      "Comfort or personal style",
    ]),
    (a) =>
      q(
        "fit",
        a[0] === "Browsed without buying"
          ? "What made judging the fit difficult?"
          : "How confident did you feel about the fit?",
        a[0] === "Browsed without buying"
          ? [
              "Unclear size guidance",
              "Not enough fit descriptions",
              "Sizes differ between styles",
              "I couldn’t try it on",
              "I felt confident about the fit",
            ]
          : [
              "The fit was right",
              "Too small or narrow",
              "Too large or loose",
              "Different from another Nike style",
              "I haven’t worn it enough to tell",
            ],
      ),
    (a) =>
      q(
        "activity-detail",
        a[2] === "Running"
          ? "What matters most for your running shoes?"
          : a[2] === "Gym or training"
            ? "What matters most during training?"
            : "What matters most for how you move?",
        [
          "Comfort over time",
          "Support and stability",
          "Breathability",
          "Freedom of movement",
          "Durability",
        ],
      ),
    q("durability", "What is your biggest durability concern?", [
      "Soles wearing out",
      "Material or stitching damage",
      "Shape changing over time",
      "How to clean and care for it",
      "No particular concern",
    ]),
    q("stock", "Was the size or color you wanted available?", [
      "Yes",
      "My size was missing",
      "My color was missing",
      "Both were missing",
      "I hadn’t chosen yet",
    ]),
    q("guidance", "Which information would most help you choose?", [
      "Fit notes from similar customers",
      "Detailed measurements",
      "Clear activity recommendations",
      "An in-store fitting",
      "A simple comparison between styles",
    ]),
    q("tradeoff", "Which tradeoff matters most when deciding?", [
      "Price versus durability",
      "Style versus comfort",
      "Weight versus support",
      "Choice versus easy selection",
      "I don’t have a particular tradeoff",
    ]),
    q("priority", "Where should Nike focus first?", [
      "Consistent sizing",
      "Longer-lasting products",
      "More sizes and colors in stock",
      "Better value",
      "Clearer product guidance",
    ]),
  ],
  netflix: [
    q("use", "How does Netflix fit into your life right now?", [
      "I watch regularly",
      "I watch occasionally",
      "I used to watch but stopped",
      N,
    ]),
    q("device", "Where do you usually watch?", [
      "TV",
      "Phone or tablet",
      "Laptop or desktop",
      "Several devices equally",
    ]),
    q("goal", "What are you usually looking for when you open Netflix?", [
      "A specific title",
      "Something new to discover",
      "Something everyone can watch",
      "Something familiar in the background",
    ]),
    q("discovery", "What makes choosing something difficult?", [
      "The same recommendations keep appearing",
      "Search doesn’t help me narrow it down",
      "The descriptions don’t tell me enough",
      "I can’t find the kind of content I want",
      "Choosing is usually easy",
    ]),
    (a) =>
      q(
        "discovery-detail",
        a[3] === "Choosing is usually easy"
          ? "What helps you find something worth watching?"
          : "What would make browsing more useful?",
        [
          "More specific genres and moods",
          "Better explanations of recommendations",
          "More useful title descriptions",
          "More control over recommendations",
          "A better view of what’s new",
        ],
      ),
    (a) =>
      q(
        "playback",
        `On your ${a[1] === "TV" ? "TV" : a[1] === "Phone or tablet" ? "phone or tablet" : a[1] === "Laptop or desktop" ? "computer" : "usual devices"}, what most needs attention?`,
        [
          "Buffering or loading",
          "Picture or sound quality",
          "Playback controls",
          "Subtitles or audio options",
          "Playback works well",
        ],
      ),
    q("access", "How well do subtitles and audio options work for you?", [
      "They work well",
      "The language I need is missing",
      "They can be hard to read or follow",
      "They can be out of sync",
      "I haven’t used them",
    ]),
    q("content", "What would you most like to see more of?", [
      "Films in genres I love",
      "Complete series and seasons",
      "Content in more languages",
      "Family viewing choices",
      "I’m happy with the selection",
    ]),
    q(
      "value",
      "What matters most to your decision to keep or return to Netflix?",
      [
        "Content I really want",
        "The total monthly cost",
        "Easy discovery",
        "Reliable viewing",
        "Fit for my household",
      ],
    ),
    q("priority", "What would improve your next movie night most?", [
      "Finding a good title faster",
      "Better playback",
      "More of the content I want",
      "Better accessibility options",
      "Better value",
    ]),
  ],
  target: [
    q("channel", "How did you most recently shop with Target?", [
      "In store",
      "Order pickup or Drive Up",
      "Home delivery",
      "Browsed without buying",
      N,
    ]),
    q("department", "Which department mattered most on that trip?", [
      "Groceries and essentials",
      "Clothing",
      "Home",
      "Electronics",
      "Beauty and personal care",
      "Something else",
    ]),
    q("found", "Did you find what you set out to get?", [
      "Yes, everything",
      "Only some of it",
      "No",
      "I was just browsing",
    ]),
    (a) =>
      q(
        "obstacle",
        a[2] === "Yes, everything"
          ? "What made finding your items easy?"
          : "What got in the way of finding what you wanted?",
        a[2] === "Yes, everything"
          ? [
              "Clear organization",
              "Helpful search or filters",
              "Accurate stock information",
              "Helpful staff",
              "I knew where to look",
            ]
          : [
              "The item was out of stock",
              "The size or variant was missing",
              "The price was higher than expected",
              "Stock information was inaccurate",
              "It was hard to find",
            ],
      ),
    (a) =>
      q(
        "navigation",
        a[0] === "In store"
          ? "How easy was it to find your way around the store?"
          : "How useful were the search and filters?",
        [
          "Very easy to find what I needed",
          "Mostly clear",
          "I needed extra help",
          "I couldn’t narrow things down",
          "Not applicable",
        ],
      ),
    (a) =>
      q(
        "handoff",
        a[0] === "Home delivery"
          ? "How did delivery compare with what was promised?"
          : a[0] === "Order pickup or Drive Up"
            ? "How did pickup compare with what was promised?"
            : a[0] === "In store"
              ? "How was the checkout experience?"
              : "How clear were your purchase and delivery options?",
        [
          "Clear and as expected",
          "Longer or harder than expected",
          "An item or detail was incorrect",
          "I needed help",
          "Not applicable",
        ],
      ),
    q("pricing", "How clear were prices and promotions?", [
      "Clear throughout",
      "The shelf or listing price differed at checkout",
      "Offer eligibility was confusing",
      "App-only offers were difficult to use",
      "I didn’t look at promotions",
    ]),
    q("confidence", "How much did you trust the stock information?", [
      "Completely",
      "Mostly",
      "It didn’t match what was available",
      "I didn’t see stock information",
      "Not applicable",
    ]),
    q("help", "If you needed help, what would work best?", [
      "Help from staff in the aisle",
      "Clearer app or website information",
      "Quick online chat",
      "An easier return or substitution process",
      "I didn’t need help",
    ]),
    q("priority", "What should Target improve for your next trip?", [
      "Item availability",
      "Finding products",
      "Clear prices and promotions",
      "Checkout speed",
      "Pickup or delivery communication",
    ]),
  ],
  mcdonalds: [
    q("channel", "How did you most recently order at McDonald’s?", [
      "At the counter",
      "At a kiosk",
      "Drive-through",
      "Mobile order pickup",
      "Delivery",
      N,
    ]),
    q("occasion", "What brought you in that time?", [
      "Breakfast",
      "A quick meal",
      "A family meal",
      "A snack or treat",
      "Just a drink",
    ]),
    q("reason", "What mattered most when you chose McDonald’s?", [
      "A convenient location",
      "Speed",
      "A familiar favorite",
      "Price or an offer",
      "Someone else’s preference",
    ]),
    q("accuracy", "How accurate was your order?", [
      "Everything was correct",
      "An item was missing",
      "I received the wrong item",
      "A customization was wrong",
      "I’m not sure",
    ]),
    (a) =>
      q(
        "accuracy-detail",
        a[3] === "Everything was correct"
          ? "Which part of the order was most reliable?"
          : "What happened after you noticed the issue?",
        a[3] === "Everything was correct"
          ? [
              "All items were included",
              "Customizations were right",
              "Portions matched expectations",
              "The handoff was clear",
            ]
          : [
              "It was fixed quickly",
              "It took too much effort to fix",
              "I couldn’t get it resolved",
              "I didn’t report it",
              "Not applicable",
            ],
      ),
    q("temperature", "How was the food temperature when you started eating?", [
      "Just right",
      "A little cooler than expected",
      "Too cold",
      "Too hot to enjoy",
      "I only ordered a cold item",
    ]),
    (a) =>
      q(
        "wait",
        a[0] === "Drive-through"
          ? "How did the drive-through wait affect your visit?"
          : a[0] === "Delivery"
            ? "How did the delivery wait affect your meal?"
            : "How did the wait affect your experience?",
        [
          "The timing worked well",
          "A little slower than expected",
          "It disrupted my plans",
          "I didn’t know when it would be ready",
          "Not applicable",
        ],
      ),
    (a) =>
      q(
        "ordering",
        a[0] === "At a kiosk" || a[0] === "Mobile order pickup"
          ? "What could make digital ordering easier?"
          : a[0] === "Delivery"
            ? "How could delivery packaging improve?"
            : "What could make ordering easier?",
        a[0] === "Delivery"
          ? [
              "Keeping food warm",
              "Keeping drinks secure",
              "Keeping items separate",
              "Making missing items easier to spot",
              "Nothing needs changing",
            ]
          : [
              "Clearer menu and prices",
              "Easier customization",
              "Clearer offers",
              "Better order confirmation",
              "Nothing needs changing",
            ],
      ),
    q("value", "What would most improve the value of your meal?", [
      "Lower everyday prices",
      "Better food consistency",
      "Better portions",
      "Clearer offers and bundles",
      "Fewer extra charges",
    ]),
    q("priority", "What should McDonald’s improve first?", [
      "Hot, fresh food",
      "Order accuracy",
      "Faster service",
      "Menu availability",
      "Value for money",
    ]),
  ],
  amazon: [
    q("activity", "What did you most recently do on Amazon?", [
      "Bought a physical product",
      "Bought a digital product",
      "Browsed without buying",
      N,
    ]),
    q("category", "What type of product were you looking for?", [
      "Electronics",
      "Home or household essentials",
      "Clothing",
      "Books or entertainment",
      "Something else",
    ]),
    q("comparison", "What was hardest to compare?", [
      "Product specifications",
      "Customer reviews",
      "Sellers",
      "Sizes, colors, or variants",
      "The full price",
      "Comparing was straightforward",
    ]),
    (a) =>
      q(
        "listing",
        a[0] === "Browsed without buying"
          ? "How confident were you in the product information?"
          : "How well did the listing match what you received?",
        [
          "Clear and accurate",
          "A key detail was missing",
          "Some information was misleading",
          "Images weren’t enough",
          "I can’t tell yet",
        ],
      ),
    (a) =>
      q(
        "fulfillment",
        a[0] === "Bought a physical product"
          ? "Did delivery match the promise shown when you ordered?"
          : a[0] === "Bought a digital product"
            ? "How easy was it to access your digital purchase?"
            : "How clear were the delivery options before checkout?",
        [
          "It worked as expected",
          "There was an unexpected delay",
          "The instructions or timing were unclear",
          "There was a problem I couldn’t resolve",
          "Not applicable",
        ],
      ),
    (a) =>
      q(
        "condition",
        a[0] === "Bought a physical product"
          ? "What condition was the product in when it arrived?"
          : a[0] === "Bought a digital product"
            ? "Did the purchase work on your intended device?"
            : "What information would help you decide?",
        a[0] === "Bought a physical product"
          ? [
              "Exactly as expected",
              "Packaging was damaged",
              "The item was damaged",
              "An item or part was missing",
              "I haven’t received it yet",
            ]
          : a[0] === "Bought a digital product"
            ? [
                "Yes, without difficulty",
                "Setup was confusing",
                "It wasn’t compatible",
                "I needed extra software",
                "I haven’t tried yet",
              ]
            : [
                "Clearer product details",
                "More useful reviews",
                "Clear seller information",
                "The full delivery cost",
                "A clear return policy",
              ],
      ),
    q("support", "Did you need help with a return or order issue?", [
      "No",
      "Yes, and it was resolved",
      "Yes, but it wasn’t resolved",
      "I couldn’t find the right help",
    ]),
    (a) =>
      q(
        "support-detail",
        a[6] === "No"
          ? "How clear were the return instructions before buying?"
          : "What would have improved the resolution process?",
        a[6] === "No"
          ? [
              "Easy to find and understand",
              "Easy to find but confusing",
              "Hard to find",
              "I didn’t check",
              "Not applicable",
            ]
          : [
              "A clear route to a person",
              "Less repeating the issue",
              "Clearer refund timing",
              "Better return instructions",
              "Nothing needs changing",
            ],
      ),
    q("seller", "How clearly could you tell who sold and shipped the item?", [
      "Very clearly",
      "I had to look carefully",
      "I couldn’t tell",
      "I didn’t look",
      "Not applicable",
    ]),
    q("priority", "Where should Amazon improve first?", [
      "Trustworthy product information",
      "Useful comparisons and reviews",
      "Reliable delivery",
      "Clear seller information",
      "Easier returns and support",
    ]),
  ],
};
function expectation(s, index) {
  const n = s.name;
  const topics = {
    cafe: ["Drinks", "Food", "A place to spend time"],
    tech: ["A phone or tablet", "A computer", "Wearables or accessories"],
    apparel: ["Shoes", "Sportswear", "Everyday clothing"],
    streaming: ["Films", "Series", "Family viewing"],
    retail: ["Everyday essentials", "Clothing", "Home products"],
    food: ["A quick meal", "A snack or drink", "A family meal"],
    ecommerce: ["Everyday essentials", "A specific product", "Digital content"],
  };
  return [
    null,
    q("interest", `What would most interest you about ${n}?`, [
      ...(topics[s.type] || ["Products", "Services"]),
      "Nothing in particular",
    ]),
    q("reason", `What is the main reason you haven’t used ${n} recently?`, [
      "Price",
      "I prefer another option",
      "It doesn’t fit my needs",
      "I haven’t had a reason to",
      "Something else",
    ]),
    q("criteria", "What would matter most if you considered trying it?", [
      "Clear value for money",
      "Reliable quality",
      "Convenience",
      "Helpful support",
      "Fit for my personal needs",
    ]),
    q("information", "What would you want to know before deciding?", [
      "The full cost",
      "How it compares with alternatives",
      "Whether it suits my needs",
      "What happens if there is a problem",
      "I already have enough information",
    ]),
    q("barrier", "What would most reduce your hesitation?", [
      "Transparent pricing",
      "Clearer product or service details",
      "A straightforward return or cancellation policy",
      "More useful independent feedback",
      "Nothing would change my mind right now",
    ]),
    q("help", "How would you prefer to get answers to your questions?", [
      "A clear website or FAQ",
      "Online chat",
      "A conversation in person",
      "A phone call",
      "I prefer to decide on my own",
    ]),
    q("tradeoff", "Which tradeoff would you be most willing to make?", [
      "Pay more for longer-lasting quality",
      "Wait longer for a better price",
      "Choose fewer options for a simpler experience",
      "Choose convenience over extra features",
      "None of these",
    ]),
    q(
      "voice",
      `What do you most want ${n} to understand about people like you?`,
      [
        "Our budgets",
        "Our day-to-day needs",
        "Our time is limited",
        "We need clearer information",
        "We need more accessible options",
      ],
    ),
    q(
      "priority",
      `If ${n} changed one thing to be more relevant to you, what should it be?`,
      [
        "More affordable options",
        "Products or services that fit my needs",
        "An easier experience",
        "Clearer, more honest information",
        "I’m not interested right now",
      ],
    ),
  ][index];
}
export function getQuestion(s, index, answers) {
  if (!brandQuestions[s.id] || index < 0 || index > 9)
    throw Error("Unknown survey question");
  if (index > 0 && answers[0] === N) return expectation(s, index);
  const item = brandQuestions[s.id][index];
  return typeof item === "function" ? item(answers) : item;
}
export const noRecentExperience = N;
