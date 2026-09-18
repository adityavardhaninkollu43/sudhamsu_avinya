/* ==========================================================================
   Readout — Health Conditions & Personalized Dietary Guidance Engine
   --------------------------------------------------------------------------
   Cross-references laboratory biomarkers with patient-reported health
   conditions (BP, Diabetes/Sugar, Cholesterol, Fatty Liver, Uric Acid, etc.)
   to generate tailored, evidence-based recommendations on:
     - 🔴 Food items to strictly avoid / moderate (with biological mechanisms)
     - 🟢 Food items that heal and support recovery (with clinical rationales)
     - ⚠️ Critical drug-food and biomarker-diet contraindications
     - 🔍 Live interactive food query checker
   ========================================================================== */

(function () {
  const esc = (s) => (typeof window !== "undefined" && typeof window.esc === "function" ? window.esc(s) : String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"));

const NUTRITION_CONDITIONS = {
  hypertension: {
    id: "hypertension",
    name: "High Blood Pressure (BP)",
    shortName: "BP / Hypertension",
    icon: "🫀",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
    description: "Elevated systemic arterial pressure. Management centers on the DASH (Dietary Approaches to Stop Hypertension) sodium-to-potassium ratio and vascular endothelial support.",
    guideline: "ACC/AHA Hypertension Guidelines & DASH Clinical Trials",
    triggers: ["bp", "systolic", "diastolic", "sodium", "na", "potassium", "k"],
    detect(p) {
      const id = (p.canonicalId || p.id || "").toLowerCase();
      const val = Number(p.value);
      if (id.includes("sodium") || id === "na") return val > 145;
      if (id.includes("potassium") || id === "k") return val < 3.5;
      return false;
    },
    avoidFoods: [
      {
        name: "High-Sodium Processed Meats & Cold Cuts",
        category: "Processed Meats",
        examples: "Sausages, hot dogs, bacon, salami, corned beef, cured ham",
        reason: "Excess dietary sodium expands extracellular fluid volume, stressing vascular smooth muscle and elevating arterial pressure.",
        swap: "Skinless poultry, baked fish, or home-cooked lentils seasoned with lemon and herbs."
      },
      {
        name: "Commercial Canned Soups & Instant Bouillon",
        category: "Packaged Foods",
        examples: "Instant noodle packets, bouillon cubes, canned commercial broths, salted stock bases",
        reason: "A single serving often exceeds 800–1,100 mg of sodium (over 50% of the daily DASH limit).",
        swap: "Home-made unsalted vegetable or bone broths simmered with fresh herbs, garlic, and ginger."
      },
      {
        name: "Pickled Foods & Concentrated Brines",
        category: "Condiments",
        examples: "Commercial pickles, olives in heavy brine, capers, pickled vegetables, soy sauce, fish sauce",
        reason: "Brines represent hyper-concentrated sodium solutions that immediately raise plasma osmolarity.",
        swap: "Fresh cucumber slices soaked in apple cider vinegar, lime juice, and chopped dill."
      },
      {
        name: "Natural Licorice (Glycyrrhizin)",
        category: "Sweets & Herbal Extracts",
        examples: "Real black licorice candy, licorice root tea, glycyrrhizic acid supplements",
        reason: "Inhibits the 11-beta-HSD2 enzyme, allowing cortisol to stimulate mineralocorticoid receptors in the kidney, inducing sodium retention and rapid BP spikes.",
        swap: "Peppermint tea, ginger tea, or fennel seed infusions."
      },
      {
        name: "Energy Drinks & High-Dose Caffeine",
        category: "Beverages",
        examples: "High-octane energy drinks, pre-workout stimulants, excessive concentrated espresso shots",
        reason: "Blocks adenosine receptors and stimulates adrenal epinephrine release, causing acute systemic vasoconstriction.",
        swap: "Hibiscus herbal tea or naturally decaffeinated green tea."
      }
    ],
    healFoods: [
      {
        name: "Potassium-Rich Leafy Greens & Vegetables",
        category: "Potassium & Mineral Donors",
        examples: "Spinach, Swiss chard, baked sweet potato, beet greens, broccoli",
        benefit: "Promotes renal sodium excretion (natriuresis) and relaxes vascular smooth muscle tone.",
        howToUse: "Aim for 2 cups of steamed greens or 1 baked sweet potato daily (if renal function is normal)."
      },
      {
        name: "Beetroot & Dietary Nitrate Sources",
        category: "Endothelial Nitric Oxide Donors",
        examples: "Fresh beetroot, fresh beet juice, arugula, celery",
        benefit: "Inorganic nitrates convert to nitric oxide (NO) via oral microbiome, causing potent arterial vasodilation and documented 4–8 mmHg systolic drops.",
        howToUse: "Drink 150–200 mL of fresh unsweetened beet juice or add roasted beets to daily salads."
      },
      {
        name: "Hibiscus Flower Tea (Hibiscus sabdariffa)",
        category: "Cardiovascular Botanicals",
        examples: "Dried hibiscus calyces (sour tea / Karkadeh)",
        benefit: "Acts as a mild natural ACE-inhibitor and diuretic through anthocyanin-mediated pathways without depleting potassium.",
        howToUse: "Steep 1–2 teaspoons of dried hibiscus in hot water twice daily after meals."
      },
      {
        name: "Crushed Raw Garlic (Allicin)",
        category: "Vasodilatory Alliums",
        examples: "Fresh crushed raw garlic cloves, aged black garlic",
        benefit: "Allicin stimulates endothelial nitric oxide synthase and hydrogen sulfide (H2S) signaling, relaxing vascular stiffness.",
        howToUse: "Crush 1 raw garlic clove and let it sit for 5 minutes before mixing into yogurt or warm food."
      },
      {
        name: "Unsalted Pumpkin Seeds & Magnesium Sources",
        category: "Magnesium Regulators",
        examples: "Raw pumpkin seeds, almonds, chia seeds, dark chocolate (85%+)",
        benefit: "Magnesium acts as a natural intracellular calcium antagonist, preventing arterial spasm and supporting nocturnal BP dipping.",
        howToUse: "A small handful (30g) of raw unsalted pumpkin seeds as an afternoon snack."
      }
    ],
    contraindications: [
      "⚠️ Kidney / Potassium Warning: If your eGFR is below 45 mL/min or you take potassium-sparing medications (Spironolactone, Triamterene) or ACE-inhibitors (Lisinopril, Ramipril, Losartan), consult your physician before aggressively increasing high-potassium foods.",
      "⚠️ NSAID Warning: Frequent use of ibuprofen or naproxen blunts the efficacy of BP medications and promotes fluid retention."
    ]
  },

  diabetes: {
    id: "diabetes",
    name: "High Blood Sugar / Diabetes / Prediabetes",
    shortName: "Sugar / Diabetes",
    icon: "🩸",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    description: "Impaired carbohydrate metabolism and insulin resistance. Focuses on low-glycemic load, viscous soluble fiber, and preserving pancreatic beta-cell sensitivity.",
    guideline: "American Diabetes Association (ADA) Standards of Care",
    triggers: ["glucose", "fbs", "fpg", "hba1c", "glycated", "sugar", "insulin"],
    detect(p) {
      const id = (p.canonicalId || p.id || "").toLowerCase();
      const val = Number(p.value);
      if (id.includes("glucose") || id === "fbs" || id === "fpg") return val > 100;
      if (id.includes("hba1c") || id.includes("glycated")) return val >= 5.7;
      return false;
    },
    avoidFoods: [
      {
        name: "Liquid Sugars & Sweetened Beverages",
        category: "Beverages",
        examples: "Sodas, sweetened iced teas, fruit juices, bubble tea, sweetened coffee beverages",
        reason: "Liquid carbohydrates require zero digestive breakdown, surging rapidly into the portal vein and triggering extreme glucose and insulin spikes.",
        swap: "Water infused with lemon and mint, sparkling water with lime, or cold cinnamon-infused green tea."
      },
      {
        name: "Refined White Grains & Commercial Bakery Goods",
        category: "Refined Carbohydrates",
        examples: "White bread, naan, croissants, commercial muffins, white flour crackers, instant white rice",
        reason: "Stripped of germ and fiber, these starches hydrolyze into pure glucose as fast as table sugar (Glycemic Index 75–85).",
        swap: "Steel-cut oats, quinoa, black rice, barley, or 100% sprouted whole grain roti/bread."
      },
      {
        name: "Deep-Fried Battered Foods",
        category: "Trans & Oxidized Fats",
        examples: "French fries, samosas, donuts, battered fried chicken, commercial pakoras",
        reason: "Combination of oxidized fats and simple starches triggers prolonged postprandial insulin resistance lasting up to 10 hours.",
        swap: "Air-fried spiced chickpeas or roasted cauliflower florets with turmeric."
      },
      {
        name: "Dried Fruits with Added Glazes & Jams",
        category: "Concentrated Sugars",
        examples: "Candied cranberries, glazed dates, fruit roll-ups, fruit preserves with pectin and sugar",
        reason: "Ultra-concentrated fructose delivers a heavy hepatic carbohydrate load without water volume to slow ingestion.",
        swap: "Fresh whole berries (blackberries, raspberries, blueberries) with skin and intact fiber."
      },
      {
        name: "High-Fructose Condiments",
        category: "Sauces",
        examples: "Commercial tomato ketchup, barbecue sauce, sweet chili glaze, honey-mustard dressings",
        reason: "Contains hidden high-fructose corn syrup (often 4–6 grams of sugar per single tablespoon).",
        swap: "Fresh tomato salsa, unsweetened mustard, guacamole, or olive oil vinaigrette."
      }
    ],
    healFoods: [
      {
        name: "Viscous Soluble Fiber (Fenugreek, Chia, Oats)",
        category: "Glucose Absorption Blockers",
        examples: "Fenugreek seeds (soaked), chia seeds, psyllium husk, steel-cut oats",
        benefit: "Forms a viscous gelatinous matrix in the upper GI tract, slowing carbohydrate enzyme access and blunting postprandial spikes by 20–35%.",
        howToUse: "Soak 1 teaspoon of fenugreek seeds overnight in water and drink the water with seeds in the morning, or stir 1 tbsp chia into yogurt."
      },
      {
        name: "Legumes & Resistant Starch Sources",
        category: "Second-Meal Effect Superfoods",
        examples: "Lentils (dal), black beans, chickpeas, kidney beans, edamame",
        benefit: "Rich in fermentable resistant starches that nourish gut microbiota to produce short-chain fatty acids (SCFAs), enhancing insulin sensitivity on subsequent meals.",
        howToUse: "Include 1/2 to 1 cup of home-cooked lentils or beans with lunch or dinner in place of white rice."
      },
      {
        name: "Cruciferous Vegetables (Broccoli, Cauliflower)",
        category: "Sulforaphane Activators",
        examples: "Broccoli, broccoli sprouts, cauliflower, Brussels sprouts, cabbage",
        benefit: "Contains sulforaphane, shown in clinical trials to downregulate hepatic gluconeogenesis genes and combat insulin resistance.",
        howToUse: "Lightly steam broccoli florets and toss with extra virgin olive oil and lemon."
      },
      {
        name: "Bitter Gourd / Karela & Bitter Melon",
        category: "AMPK Activators",
        examples: "Fresh bitter gourd juice, sautéed karela with onions and cumin",
        benefit: "Contains charantin, vicine, and polypeptide-p (plant insulin mimic) that activate peripheral AMPK and glucose uptake.",
        howToUse: "Consume sautéed bitter gourd twice weekly, or 30 mL freshly extracted diluted juice under guidance."
      },
      {
        name: "Ceylon Cinnamon & Raw Apple Cider Vinegar",
        category: "Gastric Emptying Regulators",
        examples: "True Ceylon cinnamon powder, unfiltered organic apple cider vinegar (with 'the mother')",
        benefit: "Acetic acid delays gastric emptying and enhances skeletal muscle glycogen synthesis, reducing post-meal glucose spikes by 15–20%.",
        howToUse: "Dilute 1 tablespoon of apple cider vinegar in 200 mL of water and drink 10 minutes before a carbohydrate-containing meal."
      }
    ],
    contraindications: [
      "⚠️ Hypoglycemia Awareness: If taking insulin or sulfonylureas (Glimepiride, Gliclazide, Glyburide), adding aggressive glucose-lowering foods (like bitter gourd or concentrated vinegar) can accelerate hypoglycemia. Monitor your glucometer regularly.",
      "⚠️ Metformin & B12: Metformin reduces intestinal absorption of Vitamin B12. Ensure adequate dietary B12 (eggs, fish) or regular testing."
    ]
  },

  cholesterol: {
    id: "cholesterol",
    name: "High Cholesterol / Dyslipidemia / Heart Health",
    shortName: "Cholesterol / Lipids",
    icon: "🫀",
    color: "#c2410c",
    bg: "#fff7ed",
    border: "#ffedd5",
    description: "Elevated atherogenic lipoproteins (LDL-C, non-HDL-C, Triglycerides). Focuses on viscous bile acid binding, plant sterols, and clearing circulating ApoB particles.",
    guideline: "AHA / ACC Multisociety Cholesterol Guidelines & NLA Recommendations",
    triggers: ["cholesterol", "ldl", "tg", "triglyceride", "vldl", "apob", "lipid"],
    detect(p) {
      const id = (p.canonicalId || p.id || "").toLowerCase();
      const val = Number(p.value);
      if (id.includes("ldl")) return val > 100;
      if (id.includes("cholesterol") && !id.includes("hdl")) return val > 200;
      if (id.includes("triglyceride") || id === "tg") return val > 150;
      return false;
    },
    avoidFoods: [
      {
        name: "Industrial Trans Fats & Vanaspati / Shortening",
        category: "Trans Fats",
        examples: "Commercial bakery pastries, shortening, vanaspati ghee, partially hydrogenated vegetable oils",
        reason: "Simultaneously increases atherogenic small dense LDL-C and suppresses protective HDL-C while promoting arterial inflammation.",
        swap: "Extra virgin olive oil, cold-pressed mustard oil, or avocado oil."
      },
      {
        name: "Processed Fatty Meats & High Saturated Fat Cuts",
        category: "Saturated Fats",
        examples: "Pork sausages, marbled beef ribs, bacon, hot dogs, chicken skin",
        reason: "Saturated fatty acids downregulate hepatic LDL receptor expression, reducing clearance of circulating LDL particles from plasma.",
        swap: "Skinless chicken breast, wild salmon, sardines, or plant-based bean burgers."
      },
      {
        name: "Tropical Oils in Ultra-Processed Snacks",
        category: "Saturated Fats",
        examples: "Palm oil in packaged chips, packaged noodles, hydrogenated coconut fats in commercial confectionery",
        reason: "Palmitic acid drives hepatic cholesterol esterification and increases apoB secretion.",
        swap: "Handful of raw unsalted walnuts or almonds."
      },
      {
        name: "Excessive Refined Fructose (for Triglycerides)",
        category: "Lipogenic Sugars",
        examples: "Sodas, sweet fruit juices, high-fructose syrups in condiments",
        reason: "Fructose bypasses phosphofructokinase regulation in the liver, converting directly into glycerol-3-phosphate and driving triglyceride synthesis.",
        swap: "Plain water infused with fresh citrus or berries."
      },
      {
        name: "Full-Fat Processed Cheeses & Cream Sauces",
        category: "Dairy Fats",
        examples: "Heavy cream pasta sauces, processed cheese slices, cheddar in large portions",
        reason: "Contains high concentrations of myristic and palmitic saturated fats that elevate circulating total cholesterol.",
        swap: "Low-fat Greek yogurt, cottage cheese, or hummus."
      }
    ],
    healFoods: [
      {
        name: "Viscous Beta-Glucan (Oats & Barley)",
        category: "Bile Acid Trappers",
        examples: "Coarse steel-cut oats, oat bran, pearl barley",
        benefit: "Beta-glucan fibers bind bile acids in the small intestine, forcing the liver to pull circulating LDL from blood to synthesize replacement bile salts (proven 5–10% LDL drop).",
        howToUse: "Have a warm bowl of steel-cut oatmeal topped with flaxseeds and walnuts for breakfast."
      },
      {
        name: "Fatty Cold-Water Fish (EPA & DHA Omega-3s)",
        category: "Triglyceride Lowering",
        examples: "Wild salmon, sardines, mackerel, anchovies, trout",
        benefit: "Marine omega-3 fatty acids reduce hepatic VLDL synthesis and accelerate chylomicron clearance, dropping triglycerides by 20–30%.",
        howToUse: "Consume grilled or baked fatty fish 2–3 times per week."
      },
      {
        name: "Extra Virgin Olive Oil (Polyphenol-Rich MUFA)",
        category: "Anti-Atherogenic Lipids",
        examples: "High-phenolic extra virgin olive oil (cold-pressed)",
        benefit: "Oleic acid and oleocanthal protect circulating LDL particles from atherogenic oxidation and enhance reverse cholesterol transport.",
        howToUse: "Drizzle 1–2 tablespoons raw over salads, soups, or cooked vegetables daily."
      },
      {
        name: "Raw Walnuts & Flaxseeds (Alpha-Linolenic Acid)",
        category: "Plant Sterols & ALA",
        examples: "Raw English walnuts, freshly ground flaxseeds, chia seeds",
        benefit: "Contains plant sterols that compete with dietary cholesterol absorption in the gut brush border.",
        howToUse: "Add 1 tablespoon of freshly ground flaxseeds to oatmeal, soup, or yogurt daily."
      },
      {
        name: "Legumes, Beans & Psyllium Husk",
        category: "Intestinal Sorbents",
        examples: "Black beans, pinto beans, chickpeas, lentils, unflavored psyllium husk",
        benefit: "Provides 8–10 grams of fermentable soluble fiber per cup, directly lowering circulating ApoB particle numbers.",
        howToUse: "Stir 1 teaspoon of psyllium husk into a tall glass of water before dinner, drinking immediately."
      }
    ],
    contraindications: [
      "⚠️ Statin & Grapefruit Interaction: If taking statin medications (Atorvastatin, Simvastatin, Lovastatin), completely avoid grapefruit and grapefruit juice. Compounds called furanocoumarins inhibit the intestinal CYP3A4 enzyme, causing dangerous drug buildup and rhabdomyolysis risk.",
      "⚠️ Triglyceride Spike from Alcohol: Even 1–2 alcoholic drinks can transiently double serum triglyceride levels in individuals prone to hypertriglyceridemia."
    ]
  },

  fatty_liver: {
    id: "fatty_liver",
    name: "Fatty Liver / Elevated Liver Enzymes (NAFLD)",
    shortName: "Liver / NAFLD",
    icon: "🫁",
    color: "#0f766e",
    bg: "#f0fdfa",
    border: "#ccfbf1",
    description: "Hepatic steatosis and hepatocyte stress (elevated ALT/SGPT, AST/SGOT, GGT). Focuses on halting hepatic de novo lipogenesis, antioxidant defense, and resolving hepatocyte inflammation.",
    guideline: "AASLD (American Association for the Study of Liver Diseases) Practice Guidance",
    triggers: ["alt", "sgpt", "ast", "sgot", "ggt", "bilirubin", "liver"],
    detect(p) {
      const id = (p.canonicalId || p.id || "").toLowerCase();
      const val = Number(p.value);
      if (id.includes("sgpt") || id.includes("alt")) return val > 40;
      if (id.includes("sgot") || id.includes("ast")) return val > 40;
      if (id.includes("ggt")) return val > 50;
      return false;
    },
    avoidFoods: [
      {
        name: "Alcohol in All Forms (Complete Cessation)",
        category: "Hepatotoxins",
        examples: "Beer, wine, spirits, cocktails, fortified liqueurs",
        reason: "Alcohol metabolism produces acetaldehyde, driving oxidative stress, lipid peroxidation, and synergistic injury with metabolic steatosis.",
        swap: "Sparkling water with a dash of aromatic bitters or fresh cucumber and mint."
      },
      {
        name: "High-Fructose Corn Syrup & Concentrated Fructose",
        category: "Lipogenic Sugars",
        examples: "Sweetened sodas, packaged fruit juices, sweet baked treats, dessert glazes",
        reason: "The liver is the sole organ capable of metabolizing high fructose loads; it converts fructose directly into intrahepatic fat droplets via lipogenesis.",
        swap: "Whole fresh seasonal fruit in moderate portions (1–2 pieces daily)."
      },
      {
        name: "Ultra-Processed Fast Foods & Fried Items",
        category: "Industrial Fats",
        examples: "Deep-fried snacks, potato chips, pre-packaged shelf-stable pastries",
        reason: "High levels of oxidized polyunsaturated fats and industrial additives accelerate liver inflammation and ballooning degeneration.",
        swap: "Home-cooked meals with simple roasted vegetables, brown rice, and lean protein."
      },
      {
        name: "Excessive Red & Charred Meats",
        category: "Pro-inflammatory Proteins",
        examples: "Charred grilled beef, processed pork, heavy red meat stews",
        reason: "High heme iron combined with advanced glycation end-products (AGEs) triggers hepatic macrophage (Kupffer cell) activation.",
        swap: "Wild salmon, skinless poultry, organic eggs, or plant-based tofu."
      }
    ],
    healFoods: [
      {
        name: "Black Coffee (Filter or Espresso)",
        category: "Hepatoprotective Botanicals",
        examples: "Fresh brewed black coffee, Americano, drip coffee (unsweetened)",
        benefit: "Caffeine, cafestol, and chlorogenic acids stimulate autophagy in liver cells, suppress hepatic stellate cells, and clinically reduce fibrosis risk by up to 40%.",
        howToUse: "Drink 2–3 cups of unsweetened black coffee daily (unless contraindicated by GERD or insomnia)."
      },
      {
        name: "Cruciferous Vegetables (Broccoli, Brussels Sprouts)",
        category: "Sulforaphane & Indole Donors",
        examples: "Broccoli, cabbage, kale, cauliflower, radishes",
        benefit: "Contains indole and glucoraphanin, which support hepatic phase II detoxification pathways and combat intrahepatic fat accumulation.",
        howToUse: "Eat at least 1–2 cups of lightly cooked cruciferous vegetables daily."
      },
      {
        name: "Artichoke & Dandelion Root",
        category: "Choleretics",
        examples: "Cooked globe artichoke, roasted dandelion root tea",
        benefit: "Contains cynarin and luteolin, boosting bile production and facilitating excretion of hepatic lipid breakdown products.",
        howToUse: "Enjoy steamed artichoke with olive oil or sip 1 cup of dandelion root tea after meals."
      },
      {
        name: "Green Tea (EGCG Antioxidants)",
        category: "Catechin Antioxidants",
        examples: "Fresh brewed loose-leaf green tea, matcha",
        benefit: "Epigallocatechin gallate (EGCG) downregulates lipogenic enzymes (FAS, SREBP-1c) in hepatocytes and dampens oxidative stress.",
        howToUse: "Brew 2 cups of fresh green tea daily (avoid concentrated synthetic extract pills which can strain the liver)."
      },
      {
        name: "Raw Walnuts & Vitamin E Sources",
        category: "Antioxidants",
        examples: "Raw walnuts, sunflower seeds, extra virgin olive oil, spinach",
        benefit: "Natural d-alpha-tocopherol (Vitamin E) protects liver cell membranes from lipid peroxidation, endorsed in non-diabetic NASH guidelines.",
        howToUse: "A small palmful of raw unsalted walnuts daily."
      }
    ],
    contraindications: [
      "⚠️ Paracetamol / Acetaminophen Notice: High doses (>2,000 mg/day) or pairing acetaminophen with alcohol creates toxic NAPQI accumulation in strained liver tissue.",
      "⚠️ Supplement Warning: Beware of aggressive 'liver detox' mega-supplements; high-dose herbal concentrates are a leading cause of drug-induced liver injury (DILI)."
    ]
  },

  uric_acid: {
    id: "uric_acid",
    name: "High Uric Acid / Gout / Joint Stiffness",
    shortName: "Uric Acid / Gout",
    icon: "🦶",
    color: "#7c2d12",
    bg: "#fdf4ff",
    border: "#f0abfc",
    description: "Hyperuricemia and risk of monosodium urate crystal deposition in joints and kidneys. Focuses on reducing purine precursors, urinary alkalinization, and accelerating renal clearance.",
    guideline: "ACR (American College of Rheumatology) Gout Guidelines",
    triggers: ["uric", "urate", "gout", "joint"],
    detect(p) {
      const id = (p.canonicalId || p.id || "").toLowerCase();
      const val = Number(p.value);
      if (id.includes("uric") || id.includes("urate")) return val > 7.0;
      return false;
    },
    avoidFoods: [
      {
        name: "Organ Meats (Offal)",
        category: "High-Purine Animal Foods",
        examples: "Liver, kidneys, sweetbreads, brain, tongue",
        reason: "Contains astronomical concentrations of cellular nuclei and adenine/guanine purines that directly oxidize into uric acid within hours.",
        swap: "Low-fat dairy proteins, eggs, tofu, or moderate chicken breast."
      },
      {
        name: "Purine-Dense Shellfish & Small Oily Fish",
        category: "Seafood Purines",
        examples: "Sardines, anchovies, mackerel, mussels, scallops, shrimp",
        reason: "These marine species contain over 200–300 mg of purines per 100g, precipitating acute gouty attacks.",
        swap: "White fish fillets (cod, tilapia) in modest portions, or plant protein."
      },
      {
        name: "Beer & Distilled Spirits",
        category: "Alcoholic Purine Boosters",
        examples: "Craft beers, lagers, ale, whiskey, vodka, rum",
        reason: "Brewer's yeast provides purines, and alcohol metabolism generates lactic acid which competes with uric acid for excretion in renal tubules.",
        swap: "Fresh sparkling water with lime juice, cucumber water, or tart cherry mocktail."
      },
      {
        name: "High-Fructose Corn Syrup (HFCS) Sodas",
        category: "Nucleotide Depletors",
        examples: "Cola sodas, sweetened fruit punch, sweetened energy drinks",
        reason: "Hepatic fructose phosphorylation rapidly depletes ATP into AMP, which feeds directly into the purine degradation pathway, surging uric acid.",
        swap: "Unsweetened iced hibiscus or mint tea."
      }
    ],
    healFoods: [
      {
        name: "Tart Montmorency Cherries",
        category: "Anthocyanin Urate Lowerers",
        examples: "Fresh tart cherries, 100% pure unsweetened tart cherry juice",
        benefit: "Anthocyanins inhibit xanthine oxidase (similar to low-dose allopurinol) and clinically lower recurrence of gout attacks by 35–50%.",
        howToUse: "Drink 150 mL of unsweetened tart cherry juice or eat 1 cup of fresh tart cherries daily."
      },
      {
        name: "Fresh Lemon Juice in Water (Urinary Alkalinizer)",
        category: "Citrate Donors",
        examples: "Freshly squeezed lemon or lime juice in warm water",
        benefit: "Citrate metabolizes into bicarbonate in vivo, alkalinizing urine pH and shifting insoluble uric acid into soluble urate ions for easy renal excretion.",
        howToUse: "Squeeze the juice of half a fresh lemon into a tall glass of warm water first thing in the morning."
      },
      {
        name: "Low-Fat Milk, Curd & Yogurt",
        category: "Uricosuric Proteins",
        examples: "Skim milk, low-fat Greek yogurt, fresh buttermilk / chaas",
        benefit: "Casein and lactalbumin proteins promote renal excretion of uric acid, showing strong inverse relationships with gout in prospective studies.",
        howToUse: "Enjoy 1 glass of unsweetened low-fat buttermilk or yogurt with lunch."
      },
      {
        name: "Abundant Mineral Water & Hydration",
        category: "Renal Clearance",
        examples: "Filtered water, alkaline mineral water (rich in bicarbonate)",
        benefit: "Maintains high urinary flow rate, preventing crystalloid saturation and precipitation in renal calyces and joint synovium.",
        howToUse: "Target 2.5 to 3 liters of fluid daily unless restricted by cardiology or nephrology."
      },
      {
        name: "Celery Seed & Fresh Celery",
        category: "Luteolin Botanicals",
        examples: "Celery stalks, whole celery seed tea",
        benefit: "Contains 3-n-butylphthalide and luteolin, which exhibit mild natural diuretic and xanthine-oxidase suppressing activities.",
        howToUse: "Snack on fresh crunchy celery stalks with hummus or steep 1/2 tsp crushed celery seeds in hot water."
      }
    ],
    contraindications: [
      "⚠️ Dehydration Triggers: Intense sauna sessions or rapid fasting without hydration can precipitate a gout flare due to temporary hemoconcentration.",
      "⚠️ Low-Dose Aspirin: Aspirin in low cardioprotective doses (75–100 mg) can slightly decrease renal uric acid excretion; do not discontinue aspirin without your doctor's explicit direction."
    ]
  },

  kidney: {
    id: "kidney",
    name: "Kidney Health / Elevated Creatinine / Reduced eGFR",
    shortName: "Kidney / Renal",
    icon: "🫘",
    color: "#0369a1",
    bg: "#f0f9ff",
    border: "#bae6fd",
    description: "Compromised glomerular filtration or elevated nitrogenous waste. Focuses on reducing renal acid load, limiting inorganic phosphorus additives, and managing protein workload.",
    guideline: "KDIGO Clinical Practice Guideline for the Evaluation and Management of CKD",
    triggers: ["creatinine", "egfr", "bun", "urea", "microalbumin", "proteinuria", "kidney"],
    detect(p) {
      const id = (p.canonicalId || p.id || "").toLowerCase();
      const val = Number(p.value);
      if (id.includes("creatinine")) return val > 1.2;
      if (id.includes("egfr")) return val < 60;
      if (id.includes("bun") || id.includes("urea")) return val > 22;
      return false;
    },
    avoidFoods: [
      {
        name: "Ultra-Processed Foods with Inorganic Phosphate Additives",
        category: "Inorganic Phosphorus",
        examples: "Dark colas, processed cheese slices, frozen chicken tenders with sodium tripolyphosphate",
        reason: "Inorganic phosphate salts are absorbed at 90–100% efficiency in the gut, driving vascular calcification and strain on remaining nephrons.",
        swap: "Fresh, un-marinated meats, homemade cheese, and sparkling water."
      },
      {
        name: "Excessive Animal Protein Loading",
        category: "Protein Overload",
        examples: "Huge steak portions, double whey protein shakes, excessive egg whites",
        reason: "High animal protein intake induces intraglomerular hypertension and hyperfiltration, accelerating nephron scarring.",
        swap: "Moderate plant-dominant proteins: lentils, tofu, edamame (0.6–0.8g protein per kg body weight)."
      },
      {
        name: "Starfruit (Carambola) — Absolute Contraindication",
        category: "Neurotoxins",
        examples: "Fresh starfruit, starfruit juice",
        reason: "Contains caramboxin and oxalates; kidneys cannot clear caramboxin, causing severe neurotoxicity, intractable hiccups, and seizures.",
        swap: "Apples, blueberries, or pears."
      },
      {
        name: "High Sodium Foods & Bouillon",
        category: "Sodium Overload",
        examples: "Instant noodle seasonings, commercial broths, salted cured snacks",
        reason: "Elevates intraglomerular pressure and causes fluid retention, reducing effectiveness of ACE/ARB kidney-protective drugs.",
        swap: "Garlic, onion powder, paprika, and fresh lemon for seasoning."
      }
    ],
    healFoods: [
      {
        name: "Red Bell Peppers & Cabbage",
        category: "Kidney-Safe Antioxidants",
        examples: "Red bell peppers, green cabbage, cauliflower",
        benefit: "Rich in vitamins A, C, and fiber while being naturally low in potassium and phosphorus, making them safe for impaired filtration.",
        howToUse: "Roast red peppers or stir-fry cabbage with olive oil and garlic."
      },
      {
        name: "Blueberries & Cranberries",
        category: "Anthocyanins & Proanthocyanidins",
        examples: "Fresh or frozen blueberries, unsweetened pure cranberry juice",
        benefit: "Anti-adhesion and anti-inflammatory properties shield the urinary tract and lower systemic microvascular inflammation.",
        howToUse: "Add 1/2 cup of fresh blueberries to morning oatmeal."
      },
      {
        name: "Garlic & Onions",
        category: "Flavonoids & Allicin",
        examples: "Fresh garlic, shallots, yellow onions",
        benefit: "Provides potent savory taste to replace salt while exerting nephroprotective antioxidant actions.",
        howToUse: "Use generously as the flavor base for all cooked dishes."
      },
      {
        name: "Plant-Based Moderate Protein (Tofu & Lentils)",
        category: "Renal Protective Proteins",
        examples: "Steamed tofu, mung dal, tempeh",
        benefit: "Generates lower dietary acid loads and lower intraglomerular pressures than red meat.",
        howToUse: "Substitute animal protein with tofu or mung lentils for at least 4 dinners per week."
      }
    ],
    contraindications: [
      "⚠️ Potassium & Phosphorus Guidance: As CKD advances (Stage 4–5), potassium and phosphorus restrictions become vital. Always obtain customized lab-based targets from a renal dietitian.",
      "⚠️ Avoid NSAIDs: Common painkillers like ibuprofen and naproxen constrict the afferent arteriole, causing acute renal drops."
    ]
  },

  thyroid: {
    id: "thyroid",
    name: "Thyroid Health / Hypothyroidism / TSH Fluctuation",
    shortName: "Thyroid / TSH",
    icon: "🦋",
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    description: "Hypo- or hyper-thyroid regulation. Focuses on cofactors for peripheral deiodinase conversion (T4 to active T3) and avoiding interference with thyroid hormone replacement.",
    guideline: "American Thyroid Association (ATA) Clinical Guidelines",
    triggers: ["tsh", "ft3", "ft4", "thyroid", "t3", "t4", "tpo"],
    detect(p) {
      const id = (p.canonicalId || p.id || "").toLowerCase();
      const val = Number(p.value);
      if (id.includes("tsh")) return val > 4.5 || val < 0.4;
      return false;
    },
    avoidFoods: [
      {
        name: "Raw Cruciferous Brassicas in Extreme Quantities",
        category: "Goitrogens",
        examples: "Raw kale smoothies, raw cabbage juicing, large raw broccoli salads",
        reason: "Raw brassicas contain glucosinolates that release goitrin, competing with iodine uptake in the thyroid follicular cells. (Cooking thoroughly deactivates them).",
        swap: "Lightly steamed, roasted, or sautéed crucifers are completely safe and beneficial."
      },
      {
        name: "Soy Concentrates Near Medication Window",
        category: "Absorption Blockers",
        examples: "Soy protein powders, concentrated soy bars, soy milk within 4 hours of Levothyroxine",
        reason: "Soy isoflavones can bind oral levothyroxine in the gut, impairing therapeutic absorption.",
        swap: "Consume soy products at least 4 hours away from your morning thyroid medication."
      },
      {
        name: "Unsupervised High-Dose Kelp / Iodine Drops",
        category: "Excess Iodine",
        examples: "Sea kelp tablets, concentrated iodine drops, bladderwrack supplements",
        reason: "Excessive iodine can paradoxically shut down thyroid hormone synthesis (the Wolff-Chaikoff effect) in autoimmune Hashimoto's.",
        swap: "Use standard iodized table salt in normal moderation."
      }
    ],
    healFoods: [
      {
        name: "Brazil Nuts (Natural Selenium)",
        category: "Deiodinase Enzyme Cofactors",
        examples: "Raw whole Brazil nuts",
        benefit: "Just 1–2 Brazil nuts provide ~100–150 mcg of bioavailable selenium, the essential catalytic cofactor for iodothyronine deiodinases converting T4 to active T3.",
        howToUse: "Eat exactly 1 or 2 Brazil nuts per day (never more, to avoid selenosis)."
      },
      {
        name: "Pumpkin Seeds & Oysters (Zinc Co-Factors)",
        category: "Zinc Modulators",
        examples: "Raw pumpkin seeds, oysters, lean lamb, lentils",
        benefit: "Zinc is necessary for TSH synthesis and cellular T3 receptor binding.",
        howToUse: "Sprinkle 2 tablespoons of raw pumpkin seeds onto morning oats or yogurt."
      },
      {
        name: "Eggs (Choline, Iodine, Tyrosine)",
        category: "Thyroid Building Blocks",
        examples: "Whole pasture-raised eggs (including yolks)",
        benefit: "Egg yolks supply tyrosine (the amino acid backbone of thyroid hormone) along with balanced iodine and selenium.",
        howToUse: "Have 1–2 boiled or poached eggs for breakfast."
      },
      {
        name: "Cooked Seaweed / Nori in Modest Amounts",
        category: "Balanced Iodine",
        examples: "Roasted nori snack sheets, wakame in cooked soup",
        benefit: "Provides trace organic iodine required for hormone ring iodination without the dangerous megadoses of synthetic supplements.",
        howToUse: "Enjoy 1 small roasted nori sheet a couple of times a week."
      }
    ],
    contraindications: [
      "⚠️ Strict Morning Timing: Levothyroxine must be taken on an empty stomach with a full glass of water, waiting at least 30–60 minutes before breakfast, coffee, tea, or any other pills.",
      "⚠️ Calcium & Iron Separation: Calcium supplements, antacids, and iron tablets must be separated from thyroid hormone by at least 4 hours."
    ]
  },

  gerd: {
    id: "gerd",
    name: "Acid Reflux / GERD / Gastritis",
    shortName: "Reflux / GERD",
    icon: "🔥",
    color: "#b91c1c",
    bg: "#fff1f2",
    border: "#fecdd3",
    description: "Lower esophageal sphincter relaxation and gastric mucosal irritation. Focuses on mucosal protection, non-acidic nutrient density, and preventing nocturnal reflux.",
    guideline: "ACG (American College of Gastroenterology) Clinical Guideline for GERD",
    triggers: ["gerd", "reflux", "gastritis", "acidity"],
    detect(p) {
      return false; // Typically patient-reported
    },
    avoidFoods: [
      {
        name: "Deep-Fried Fatty Foods & Melted Cheeses",
        category: "High-Fat Gastric Delayers",
        examples: "Fried chicken, french fries, heavy cheese pizzas, cream sauces",
        reason: "Triggers cholecystokinin (CCK) release, which relaxes the lower esophageal sphincter (LES) and prolongs gastric emptying.",
        swap: "Baked chicken, grilled white fish, or steamed vegetables."
      },
      {
        name: "Citrus Juices & Tomato Sauces on an Empty Stomach",
        category: "Acidic Triggers",
        examples: "Orange juice, grapefruit, marinara sauce, tomato soup",
        reason: "Directly irritates the sensitized squamous epithelium of the esophagus due to low intrinsic pH.",
        swap: "Carrot juice, watermelon, bananas, or mild squash soups."
      },
      {
        name: "Peppermint & Spearmint",
        category: "Sphincter Relaxers",
        examples: "Peppermint tea, mint candies, menthol-heavy gums",
        reason: "Menthol relaxes esophageal smooth muscle tone, directly opening the barrier between stomach and esophagus.",
        swap: "Chamomile tea or ginger tea."
      },
      {
        name: "Carbonated Drinks & High Caffeine",
        category: "Gastric Distenders",
        examples: "Sodas, seltzers, energy drinks, double espresso shots",
        reason: "Carbonation expands the stomach volume and forces transient LES relaxations with acidic belching.",
        swap: "Warm still water or fennel seed infusion."
      }
    ],
    healFoods: [
      {
        name: "Oatmeal & Oat Bran",
        category: "Acid Absorbents",
        examples: "Rolled oats, steel-cut oats, oat porridge",
        benefit: "Gentle viscous fiber coats and soothes mucosal surfaces while absorbing excess gastric acid.",
        howToUse: "A warm bowl of oatmeal cooked in water or plant milk for breakfast."
      },
      {
        name: "Fresh Ginger & Ginger Infusions",
        category: "Anti-Inflammatory Prokinetics",
        examples: "Fresh sliced ginger root, ginger tea",
        benefit: "Gingerols accelerate gastric emptying and dampen inflammation along the esophageal lining.",
        howToUse: "Steep 3–4 thin slices of fresh peeled ginger in hot water for 10 minutes."
      },
      {
        name: "Bananas & Melons",
        category: "Low-Acid Alkaline Produce",
        examples: "Ripe bananas, cantaloupe, honeydew melon, watermelon",
        benefit: "High pH foods that coat the lining and rarely trigger esophageal acid receptors.",
        howToUse: "Enjoy as a gentle mid-morning or mid-afternoon snack."
      },
      {
        name: "Chamomile & Fennel Teas",
        category: "Soothing Carminatives",
        examples: "Organic dried chamomile flowers, steeped fennel seeds",
        benefit: "Calms gastric spasms and coats inflamed mucosal linings without relaxing the LES.",
        howToUse: "Sip 1 cup of warm chamomile tea 30 minutes before bedtime."
      }
    ],
    contraindications: [
      "⚠️ 3-Hour Dinner Rule: Never lie down or sleep within 3 hours of eating dinner to prevent gravity-driven nocturnal reflux.",
      "⚠️ Elevate Bed Head: Raising the head of your bed by 6 inches mechanically prevents gastric backflow during sleep."
    ]
  }
};

// Global Nutrition Engine
const NutritionEngine = {
  // Stored state
  getUserConditions() {
    return Store.get("user_health_conditions", []);
  },

  setUserConditions(conditions = []) {
    Store.set("user_health_conditions", conditions);
    return conditions;
  },

  toggleCondition(conditionId) {
    const current = NutritionEngine.getUserConditions();
    const idx = current.indexOf(conditionId);
    let updated;
    if (idx >= 0) {
      updated = current.filter(id => id !== conditionId);
    } else {
      updated = [...current, conditionId];
    }
    NutritionEngine.setUserConditions(updated);
    return updated;
  },

  /**
   * Identifies which conditions are detected automatically from laboratory parameters.
   */
  detectConditionsFromReport(parameters = []) {
    const detected = [];
    Object.keys(NUTRITION_CONDITIONS).forEach((condId) => {
      const cond = NUTRITION_CONDITIONS[condId];
      // Check custom detect function
      const matchesParam = parameters.some((p) => {
        try {
          return cond.detect(p);
        } catch (e) {
          return false;
        }
      });
      if (matchesParam) {
        detected.push(condId);
      }
    });
    return detected;
  },

  /**
   * Evaluates active conditions (user chosen + report detected)
   */
  evaluate(parameters = []) {
    const userSelected = NutritionEngine.getUserConditions();
    const reportDetected = NutritionEngine.detectConditionsFromReport(parameters);
    
    // Combine unique
    const activeConditionIds = Array.from(new Set([...userSelected, ...reportDetected]));
    const activeConditions = activeConditionIds
      .map(id => NUTRITION_CONDITIONS[id])
      .filter(Boolean);

    // Aggregate avoid & heal foods
    const allAvoid = [];
    const allHeal = [];
    const allContraindications = [];

    activeConditions.forEach(cond => {
      cond.avoidFoods.forEach(food => {
        allAvoid.push({ ...food, condition: cond.name, conditionId: cond.id, icon: cond.icon });
      });
      cond.healFoods.forEach(food => {
        allHeal.push({ ...food, condition: cond.name, conditionId: cond.id, icon: cond.icon });
      });
      if (cond.contraindications) {
        cond.contraindications.forEach(c => {
          allContraindications.push({ note: c, condition: cond.name, icon: cond.icon });
        });
      }
    });

    return {
      userSelected,
      reportDetected,
      activeConditionIds,
      activeConditions,
      allAvoid,
      allHeal,
      allContraindications
    };
  },

  /**
   * Search query against foods in active conditions
   */
  searchFood(query, evaluation) {
    if (!query || !query.trim()) return null;
    const q = query.toLowerCase().trim();

    const avoidMatches = evaluation.allAvoid.filter(f => 
      f.name.toLowerCase().includes(q) || 
      f.examples.toLowerCase().includes(q) || 
      f.category.toLowerCase().includes(q)
    );

    const healMatches = evaluation.allHeal.filter(f => 
      f.name.toLowerCase().includes(q) || 
      f.examples.toLowerCase().includes(q) || 
      f.category.toLowerCase().includes(q)
    );

    return {
      query,
      avoidMatches,
      healMatches
    };
  },

  /**
   * Render the interactive section
   */
  renderSection(targetElement, parameters = [], onUpdate = null) {
    if (!targetElement) return;

    const evalData = NutritionEngine.evaluate(parameters);
    const userSelected = evalData.userSelected;
    const reportDetected = evalData.reportDetected;
    const activeIds = evalData.activeConditionIds;
    const currentTab = Store.get("nutrition_active_tab", "combined");
    const searchQuery = Store.get("nutrition_food_search", "");

    // Build condition toggle buttons
    const conditionButtonsHtml = Object.keys(NUTRITION_CONDITIONS).map((condId) => {
      const cond = NUTRITION_CONDITIONS[condId];
      const isSelected = userSelected.includes(condId);
      const isDetected = reportDetected.includes(condId);
      const isActive = isSelected || isDetected;

      let badgeHtml = "";
      if (isDetected && isSelected) {
        badgeHtml = `<span style="background:#dbeafe;color:#1e40af;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;margin-left:4px">Report & Chosen</span>`;
      } else if (isDetected) {
        badgeHtml = `<span style="background:#fee2e2;color:#991b1b;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;margin-left:4px">Flagged on Lab</span>`;
      } else if (isSelected) {
        badgeHtml = `<span style="background:#e0e7ff;color:#3730a3;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;margin-left:4px">Active</span>`;
      }

      const activeStyle = isActive
        ? `background:var(--surface);border:2px solid var(--pine);box-shadow:var(--shadow-1);color:var(--ink)`
        : `background:var(--surface-sunk);border:1px solid var(--line);color:var(--ink-2);opacity:0.85`;

      return `
        <button type="button" class="cond-toggle-btn" data-cond-id="${condId}"
          style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:var(--r-md);cursor:pointer;transition:all 0.15s ease;font-size:12.5px;font-family:var(--sans);font-weight:600;text-align:left;${activeStyle}">
          <span style="font-size:15px">${cond.icon}</span>
          <span>${cond.shortName}</span>
          ${badgeHtml}
        </button>
      `;
    }).join("");

    // Detect alert banner
    let detectedBannerHtml = "";
    if (reportDetected.length > 0) {
      const detectedNames = reportDetected.map(id => NUTRITION_CONDITIONS[id]?.shortName).join(", ");
      detectedBannerHtml = `
        <div style="background:var(--ochre-wash);border:1px solid var(--ochre-mid);border-radius:var(--r-md);padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">🔍</span>
            <div style="font-size:12.5px;color:var(--ink);line-height:1.4">
              <strong>Report Finding:</strong> Lab test biomarkers flagged potential nutritional relevance for: <strong>${esc(detectedNames)}</strong>.
              Recommendations have been automatically highlighted below.
            </div>
          </div>
          <button type="button" id="btn-select-all-detected" class="btn btn-secondary btn-sm" style="font-size:11.5px;padding:4px 10px;white-space:nowrap">
            Confirm All Flagged
          </button>
        </div>
      `;
    }

    // Determine what to display based on active tab
    let displayConditions = evalData.activeConditions;
    if (currentTab !== "combined" && NUTRITION_CONDITIONS[currentTab]) {
      displayConditions = [NUTRITION_CONDITIONS[currentTab]];
    }

    // Build tab buttons
    const tabButtonsHtml = `
      <button type="button" class="diet-tab-btn ${currentTab === 'combined' ? 'active' : ''}" data-tab="combined"
        style="padding:6px 14px;border-radius:var(--r-pill);font-size:12px;font-weight:600;cursor:pointer;border:1px solid ${currentTab === 'combined' ? 'var(--pine)' : 'var(--line)'};background:${currentTab === 'combined' ? 'var(--pine)' : 'var(--surface)'};color:${currentTab === 'combined' ? '#fff' : 'var(--ink)'}">
        🌟 Combined Overview (${evalData.activeConditions.length} Conditions)
      </button>
      ${evalData.activeConditions.map(c => `
        <button type="button" class="diet-tab-btn ${currentTab === c.id ? 'active' : ''}" data-tab="${c.id}"
          style="padding:6px 14px;border-radius:var(--r-pill);font-size:12px;font-weight:600;cursor:pointer;border:1px solid ${currentTab === c.id ? 'var(--pine)' : 'var(--line)'};background:${currentTab === c.id ? 'var(--pine)' : 'var(--surface)'};color:${currentTab === c.id ? '#fff' : 'var(--ink)'}">
          ${c.icon} ${c.shortName}
        </button>
      `).join("")}
    `;

    // Food Search Result
    let searchResultHtml = "";
    if (searchQuery.trim()) {
      const searchRes = NutritionEngine.searchFood(searchQuery, evalData);
      if (searchRes) {
        const hasAvoid = searchRes.avoidMatches.length > 0;
        const hasHeal = searchRes.healMatches.length > 0;

        searchResultHtml = `
          <div style="background:var(--surface);border:1px solid var(--line);border-radius:var(--r-md);padding:14px;margin-bottom:20px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <h4 style="margin:0;font-size:13px;color:var(--ink)">
                Search Verdict for: "<strong>${esc(searchQuery)}</strong>"
              </h4>
              <button type="button" id="btn-clear-food-search" style="background:none;border:none;color:var(--ink-2);font-size:12px;cursor:pointer;text-decoration:underline">Clear Search</button>
            </div>
            ${(!hasAvoid && !hasHeal) ? `
              <p style="font-size:12px;color:var(--ink-2);margin:0">
                No direct restriction or specific superfood mandate found for "${esc(searchQuery)}" under your currently selected conditions. Practice general moderation with balanced portion sizes.
              </p>
            ` : ''}
            ${hasAvoid ? `
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:var(--r-sm);padding:10px 12px;margin-bottom:8px">
                <div style="color:#991b1b;font-weight:700;font-size:12px;margin-bottom:4px">🔴 Avoid / Caution Matches:</div>
                ${searchRes.avoidMatches.map(m => `
                  <div style="font-size:12px;color:#7f1d1d;margin-bottom:4px">
                    <strong>${esc(m.name)}</strong> (${esc(m.condition)}): ${esc(m.reason)}
                    <div style="font-size:11px;color:#991b1b;margin-top:2px">💡 <em>Healthier Alternative:</em> ${esc(m.swap)}</div>
                  </div>
                `).join("")}
              </div>
            ` : ''}
            ${hasHeal ? `
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:var(--r-sm);padding:10px 12px">
                <div style="color:#166534;font-weight:700;font-size:12px;margin-bottom:4px">🟢 Recommended / Healing Matches:</div>
                ${searchRes.healMatches.map(m => `
                  <div style="font-size:12px;color:#14532d;margin-bottom:4px">
                    <strong>${esc(m.name)}</strong> (${esc(m.condition)}): ${esc(m.benefit)}
                    <div style="font-size:11px;color:#166534;margin-top:2px">🥣 <em>How to consume:</em> ${esc(m.howToUse)}</div>
                  </div>
                `).join("")}
              </div>
            ` : ''}
          </div>
        `;
      }
    }

    // Build Avoid vs. Heal cards
    let contentHtml = "";

    if (displayConditions.length === 0) {
      contentHtml = `
        <div style="background:var(--surface-sunk);border:1px dashed var(--line);border-radius:var(--r-md);padding:28px 20px;text-align:center">
          <div style="font-size:32px;margin-bottom:8px">🥗</div>
          <h4 style="margin:0 0 6px;color:var(--ink);font-size:14px">Select Any Health Issues Above</h4>
          <p style="margin:0;font-size:12.5px;color:var(--ink-2);max-width:520px;margin:0 auto">
            Tap one or more conditions (such as <strong>High Blood Pressure</strong>, <strong>Diabetes/Sugar</strong>, or <strong>Cholesterol</strong>) to view targeted foods to avoid and evidence-based foods that heal.
          </p>
        </div>
      `;
    } else {
      contentHtml = displayConditions.map((cond) => {
        const avoidCards = cond.avoidFoods.map(f => `
          <div style="background:var(--surface);border:1px solid #fecaca;border-left:4px solid #ef4444;border-radius:var(--r-sm);padding:12px 14px;margin-bottom:10px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
              <h5 style="margin:0;font-size:13px;color:#991b1b;font-weight:700">🚫 ${esc(f.name)}</h5>
              <span style="background:#fee2e2;color:#991b1b;font-size:10.5px;font-weight:600;padding:2px 6px;border-radius:6px;white-space:nowrap">${esc(f.category)}</span>
            </div>
            <div style="font-size:11.5px;color:var(--ink-2);margin:4px 0 6px">
              <strong>Examples:</strong> ${esc(f.examples)}
            </div>
            <div style="font-size:11.5px;color:var(--ink);line-height:1.45;background:#fef2f2;padding:6px 10px;border-radius:var(--r-sm);margin-bottom:6px">
              <strong>Biological Mechanism:</strong> ${esc(f.reason)}
            </div>
            <div style="font-size:11.5px;color:#047857;background:#ecfdf5;padding:6px 10px;border-radius:var(--r-sm);border:1px solid #a7f3d0">
              💡 <strong>Smart Alternative / Swap:</strong> ${esc(f.swap)}
            </div>
          </div>
        `).join("");

        const healCards = cond.healFoods.map(f => `
          <div style="background:var(--surface);border:1px solid #bbf7d0;border-left:4px solid #10b981;border-radius:var(--r-sm);padding:12px 14px;margin-bottom:10px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
              <h5 style="margin:0;font-size:13px;color:#065f46;font-weight:700">🌿 ${esc(f.name)}</h5>
              <span style="background:#d1fae5;color:#065f46;font-size:10.5px;font-weight:600;padding:2px 6px;border-radius:6px;white-space:nowrap">${esc(f.category)}</span>
            </div>
            <div style="font-size:11.5px;color:var(--ink-2);margin:4px 0 6px">
              <strong>Sources & Forms:</strong> ${esc(f.examples)}
            </div>
            <div style="font-size:11.5px;color:var(--ink);line-height:1.45;background:#f0fdf4;padding:6px 10px;border-radius:var(--r-sm);margin-bottom:6px">
              <strong>Healing Action & Physiology:</strong> ${esc(f.benefit)}
            </div>
            <div style="font-size:11.5px;color:#0369a1;background:#f0f9ff;padding:6px 10px;border-radius:var(--r-sm);border:1px solid #bae6fd">
              🥣 <strong>Practical Daily Intake:</strong> ${esc(f.howToUse)}
            </div>
          </div>
        `).join("");

        const warningsHtml = (cond.contraindications && cond.contraindications.length) ? `
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:var(--r-sm);padding:10px 14px;margin-top:14px">
            <div style="font-weight:700;font-size:12px;color:#92400e;margin-bottom:4px">⚠️ Important Clinical Considerations & Drug-Food Interactions</div>
            ${cond.contraindications.map(w => `<div style="font-size:11.5px;color:#78350f;margin-bottom:3px;line-height:1.4">${esc(w)}</div>`).join("")}
          </div>
        ` : "";

        return `
          <div style="background:var(--surface-alt);border:1px solid var(--line);border-radius:var(--r-md);padding:18px;margin-bottom:20px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap">
              <div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:20px">${cond.icon}</span>
                  <h4 style="margin:0;font-size:15px;color:var(--ink)">${esc(cond.name)}</h4>
                  <span style="font-size:11px;color:var(--ink-3);border:1px solid var(--line);padding:2px 8px;border-radius:10px">Guideline: ${esc(cond.guideline)}</span>
                </div>
                <p style="margin:4px 0 0;font-size:12px;color:var(--ink-2)">${esc(cond.description)}</p>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(310px, 1fr));gap:16px">
              <!-- Avoid Column -->
              <div>
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
                  <span style="background:#fee2e2;color:#b91c1c;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:800;letter-spacing:0.5px">FOODS TO AVOID / LIMIT</span>
                  <span style="font-size:11px;color:var(--ink-3)">Trigger inflammation or worsen numbers</span>
                </div>
                ${avoidCards}
              </div>

              <!-- Heal Column -->
              <div>
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
                  <span style="background:#d1fae5;color:#065f46;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:800;letter-spacing:0.5px">FOODS THAT HEAL & SUPPORT</span>
                  <span style="font-size:11px;color:var(--ink-3)">Clinical trials demonstrate therapeutic shift</span>
                </div>
                ${healCards}
              </div>
            </div>

            ${warningsHtml}
          </div>
        `;
      }).join("");
    }

    // Main Card HTML
    targetElement.innerHTML = `
      <div class="card" style="margin-top:24px">
        <div class="card-head" style="margin-bottom:14px">
          <div>
            <div style="display:flex;align-items:center;gap:8px">
              <h3 style="margin:0;font-size:16px;color:var(--ink)">Health Issues & Targeted Dietary Guidance</h3>
              <span class="chip chip--in" style="font-size:10.5px">Clinical Nutrition Engine</span>
            </div>
            <p class="card-sub" style="margin-top:4px;font-size:12.5px;color:var(--ink-2)">
              Cross-references your blood test biomarkers with personal health conditions (BP, Blood Sugar, Lipids, Fatty Liver, Uric Acid) to deliver actionable nutrition advice.
            </p>
          </div>
          <button type="button" id="btn-copy-diet-plan" class="btn btn-secondary btn-sm" style="font-size:12px">
            📋 Copy for Doctor Visit
          </button>
        </div>

        ${detectedBannerHtml}

        <!-- Interactive Condition Question & Selector -->
        <div style="background:var(--surface-sunk);border:1px solid var(--line);border-radius:var(--r-md);padding:14px 16px;margin-bottom:18px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;flex-wrap:wrap">
            <span style="font-size:12.5px;font-weight:700;color:var(--ink)">
              👇 Which health conditions apply to you or your family history?
            </span>
            <div style="display:flex;gap:8px">
              <button type="button" id="btn-clear-conditions" style="background:none;border:none;color:var(--ink-3);font-size:11px;cursor:pointer;text-decoration:underline">Reset All</button>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${conditionButtonsHtml}
          </div>
        </div>

        <!-- Interactive Food Query Bar -->
        <div style="display:flex;gap:10px;margin-bottom:16px;align-items:center">
          <div style="position:relative;flex:1">
            <input type="text" id="input-food-search" placeholder="Quick check any food (e.g., egg, coffee, spinach, red meat, milk, banana, oats, beer)..."
              value="${esc(searchQuery)}"
              style="width:100%;padding:8px 12px 8px 32px;border:1px solid var(--line);border-radius:var(--r-md);font-size:12.5px;background:var(--surface);color:var(--ink);box-sizing:border-box">
            <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--ink-3)">🔍</span>
          </div>
          ${searchQuery ? `<button type="button" id="btn-search-clear" class="btn btn-secondary btn-sm" style="font-size:11.5px">Clear</button>` : ''}
        </div>

        ${searchResultHtml}

        <!-- Condition Navigation Tabs if multiple active -->
        ${evalData.activeConditions.length > 1 ? `
          <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:14px;scrollbar-width:thin">
            ${tabButtonsHtml}
          </div>
        ` : ''}

        <!-- Dynamic Avoid & Heal Cards -->
        ${contentHtml}

        <!-- Medical Disclaimer Footnote -->
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line);font-size:11px;color:var(--ink-3);line-height:1.45">
          ℹ️ <strong>Clinical Nutrition Advisory:</strong> These dietary recommendations are synthesized from peer-reviewed cardiology, endocrinology, and hepatology society guidelines (AHA, ADA, KDIGO, AASLD). Dietary modifications support physiological balance, but are not a substitute for prescribed pharmacotherapy. Never alter prescribed medications without consulting your supervising physician.
        </div>
      </div>
    `;

    // Event Listeners: Condition Toggles
    targetElement.querySelectorAll(".cond-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const condId = btn.getAttribute("data-cond-id");
        NutritionEngine.toggleCondition(condId);
        NutritionEngine.renderSection(targetElement, parameters, onUpdate);
        if (typeof onUpdate === "function") onUpdate();
      });
    });

    // Event Listener: Confirm All Flagged
    const btnConfirmDetected = targetElement.querySelector("#btn-select-all-detected");
    if (btnConfirmDetected) {
      btnConfirmDetected.addEventListener("click", () => {
        const current = NutritionEngine.getUserConditions();
        const merged = Array.from(new Set([...current, ...reportDetected]));
        NutritionEngine.setUserConditions(merged);
        NutritionEngine.renderSection(targetElement, parameters, onUpdate);
        if (typeof onUpdate === "function") onUpdate();
      });
    }

    // Event Listener: Reset conditions
    const btnReset = targetElement.querySelector("#btn-clear-conditions");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        NutritionEngine.setUserConditions([]);
        NutritionEngine.renderSection(targetElement, parameters, onUpdate);
        if (typeof onUpdate === "function") onUpdate();
      });
    }

    // Event Listener: Tab Navigation
    targetElement.querySelectorAll(".diet-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        Store.set("nutrition_active_tab", tab);
        NutritionEngine.renderSection(targetElement, parameters, onUpdate);
      });
    });

    // Event Listener: Live Food Search
    const searchInput = targetElement.querySelector("#input-food-search");
    if (searchInput) {
      let timeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          Store.set("nutrition_food_search", e.target.value);
          NutritionEngine.renderSection(targetElement, parameters, onUpdate);
        }, 250);
      });
    }

    const btnClearSearch = targetElement.querySelector("#btn-search-clear");
    if (btnClearSearch) {
      btnClearSearch.addEventListener("click", () => {
        Store.set("nutrition_food_search", "");
        NutritionEngine.renderSection(targetElement, parameters, onUpdate);
      });
    }

    const btnClearSearch2 = targetElement.querySelector("#btn-clear-food-search");
    if (btnClearSearch2) {
      btnClearSearch2.addEventListener("click", () => {
        Store.set("nutrition_food_search", "");
        NutritionEngine.renderSection(targetElement, parameters, onUpdate);
      });
    }

    // Event Listener: Copy for Doctor Visit
    const btnCopy = targetElement.querySelector("#btn-copy-diet-plan");
    if (btnCopy) {
      btnCopy.addEventListener("click", () => {
        const lines = ["=== PERSONALIZED DIETARY GUIDANCE (READOUT) ==="];
        lines.push(`Active Conditions: ${evalData.activeConditions.map(c => c.name).join(", ") || "General Wellness"}`);
        lines.push("\n--- FOODS TO AVOID / LIMIT ---");
        evalData.allAvoid.forEach(a => {
          lines.push(`• [${a.condition}] ${a.name} (${a.category}): ${a.reason} -> Swap with: ${a.swap}`);
        });
        lines.push("\n--- FOODS THAT HEAL & SUPPORT RECOVERY ---");
        evalData.allHeal.forEach(h => {
          lines.push(`• [${h.condition}] ${h.name} (${h.category}): ${h.benefit} -> Intake: ${h.howToUse}`);
        });
        if (evalData.allContraindications.length) {
          lines.push("\n--- CONTRAINDICATIONS & MEDICATION ALERTS ---");
          evalData.allContraindications.forEach(c => lines.push(`• ${c.note}`));
        }
        lines.push("\nNote: Discuss these dietary adjustments with your primary care provider before making rapid changes.");

        navigator.clipboard.writeText(lines.join("\n")).then(() => {
          btnCopy.innerText = "✓ Copied to Clipboard!";
          setTimeout(() => { btnCopy.innerText = "📋 Copy for Doctor Visit"; }, 2500);
        }).catch(() => {
          alert("Dietary summary prepared. You can print or save this dashboard.");
        });
      });
    }
  }
};

window.NUTRITION_CONDITIONS = NUTRITION_CONDITIONS;
window.NutritionEngine = NutritionEngine;
})();

