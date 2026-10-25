import type { MarkerExplanation } from "./types";

const differential = { title: "MedlinePlus · Blood differential", url: "https://medlineplus.gov/lab-tests/blood-differential/" };
const differentialResults = { title: "MedlinePlus · Differential results", url: "https://medlineplus.gov/ency/article/003657.htm" };
const source = (slug: string, title: string) => ({ title: `MedlinePlus · ${title}`, url: `https://medlineplus.gov/lab-tests/${slug}/` });

/** Plain-language summaries and translations, checked against these sources on 2026-10-25. */
export const MARKER_EDUCATION: Record<string, { explanation: MarkerExplanation; sources: { title: string; url: string }[] }> = {
  wbc: {
    explanation: {
      definition: "白血球總數，反映參與抵抗感染的免疫細胞數量。\nThe total count of white blood cells, which help defend against infection.",
      low: "可能與化療、其他藥物或骨髓問題有關。\nMay occur with chemotherapy, other medicines, or bone marrow conditions.",
      high: "可能與感染、發炎、壓力或藥物反應有關。\nMay rise with infection, inflammation, stress, or a medicine response.",
    },
    sources: [source("white-blood-count-wbc", "White blood count")],
  },
  anc: {
    explanation: {
      definition: "嗜中性白血球的實際數量，是評估抵抗感染能力的重要指標。\nCounts neutrophils, white blood cells that help fight infection.",
      low: "可能在化療後下降；數量越低，感染風險通常越高。\nChemotherapy may lower ANC. Lower counts generally mean greater infection risk.",
      high: "可能與感染或發炎有關，需配合其他檢查判讀。\nCan accompany infection or inflammation; interpret alongside other tests.",
    },
    sources: [{ title: "National Cancer Institute · ANC", url: "https://www.cancer.gov/publications/dictionaries/cancer-terms/def/absolute-neutrophil-count" }],
  },
  lym: {
    explanation: {
      definition: "淋巴球占白血球的百分比，參與免疫防禦。百分比不等於實際數量。\nPercentage of white cells that are lymphocytes, which support immune defenses. Percentages are not absolute counts.",
      low: "可能與類固醇、部分感染或免疫問題有關；需看實際數量。\nMay accompany steroids, some infections, or immune conditions; check the absolute count.",
      high: "可能與病毒感染有關；其他白血球減少也可能使比例上升。\nMay accompany viral infections; fewer other white cells can also raise the percentage.",
    }, sources: [differential, differentialResults],
  },
  mono: {
    explanation: {
      definition: "單核球占白血球的百分比；協助清除病原體與死亡細胞。\nPercentage of monocytes, which help remove germs and dead cells.",
      low: "比例偏低本身無法判定原因，需合併白血球總數及實際數量。\nA low percentage alone cannot identify a cause; consider total and absolute counts.",
      high: "可能與持續感染或發炎有關。\nMay accompany ongoing infections or inflammation.",
    }, sources: [differential, differentialResults],
  },
  eos: {
    explanation: {
      definition: "嗜酸性白血球占比；參與過敏反應及對抗寄生蟲。\nPercentage of eosinophils, involved in allergies and defense against parasites.",
      low: "比例偏低無法單獨判定原因，需配合其他白血球及實際數量。\nA low percentage needs interpretation with other white cells and the absolute count.",
      high: "可能與過敏或寄生蟲有關。比例應配合實際數量判讀。\nMay accompany allergies or parasites; consider the absolute count too.",
    }, sources: [differential, differentialResults],
  },
  hgb: {
    explanation: {
      definition: "血紅素是紅血球中負責運送氧氣的蛋白質。此項不是糖化血色素 HbA1c。\nHemoglobin carries oxygen in red blood cells. This is different from HbA1c.",
      low: "可能代表貧血，原因包含失血、缺鐵或其他疾病。\nMay indicate anemia related to blood loss, iron deficiency, or other conditions.",
      high: "可能與脫水、高海拔或心肺及紅血球疾病有關。\nMay occur with dehydration, high altitude, or heart, lung, or red-cell conditions.",
    }, sources: [source("hemoglobin-test", "Hemoglobin")],
  },
  plt: {
    explanation: {
      definition: "血小板協助形成血塊，讓傷口止血。此項測量數量，不直接測功能。\nPlatelets help stop bleeding. This measures their number, not how well they work.",
      low: "數量降低可能增加出血風險，原因需搭配病史與其他檢查判斷。\nLow counts may increase bleeding risk; the cause requires medical history and other tests.",
      high: "可能與感染、發炎或骨髓疾病有關；部分情況會增加血栓風險。\nMay accompany infection, inflammation, or marrow conditions; some cases increase clotting risk.",
    }, sources: [source("platelet-tests", "Platelets")],
  },
  pt: {
    explanation: {
      definition: "血液檢體形成血塊所需的秒數。PT 秒數與 INR 是不同表示方式。\nSeconds required for a blood sample to clot. PT in seconds differs from INR.",
      low: "表示檢體凝血較快；需考量藥物、維生素 K 與檢驗方法。\nA shorter clotting time; medicines, vitamin K, and test methods affect interpretation.",
      high: "表示凝血較慢，可能與抗凝血藥、維生素 K 缺乏或肝臟問題有關。\nSlower clotting may relate to anticoagulants, vitamin K deficiency, or liver problems.",
    }, sources: [source("prothrombin-time-test-and-inr-ptinr", "PT and INR")],
  },
  ggt: {
    explanation: {
      definition: "主要與肝臟相關的酵素，常與其他肝功能檢驗一起判讀。\nAn enzyme mainly associated with the liver, interpreted with other liver tests.",
      low: "低值通常不是主要警訊，應配合其他肝臟檢驗判讀。\nA low result is generally not the main concern; consider other liver tests.",
      high: "可能與肝臟或膽管問題、飲酒或藥物影響有關，無法單獨確定原因。\nMay reflect liver or bile-duct problems, alcohol, or medicines; cannot identify the cause alone.",
    }, sources: [source("gamma-glutamyl-transferase-ggt-test", "GGT")],
  },
  crea: {
    explanation: {
      definition: "肌肉活動產生的廢物，由腎臟過濾；常搭配 eGFR 評估腎功能。\nA muscle waste product filtered by kidneys; often assessed with eGFR.",
      low: "可能與肌肉量較少或營養狀況有關，不代表腎功能一定更好。\nMay reflect low muscle mass or nutritional factors, rather than better kidney function.",
      high: "可能與腎臟過濾減少有關；脫水、劇烈運動、飲食與藥物也會影響。\nMay reflect reduced kidney filtration; hydration, exercise, diet, and medicines also affect results.",
    }, sources: [source("creatinine-test", "Creatinine")],
  },
  ldh: {
    explanation: {
      definition: "存在於多種組織、協助細胞產生能量的酵素，並非特定器官的專屬指標。\nAn energy-related enzyme found in many tissues, not specific to one organ.",
      low: "低值通常不是健康問題，有時與補充品或罕見遺傳因素有關。\nLow results are usually not a health concern; supplements or rare inherited conditions can contribute.",
      high: "可能與組織損傷、感染或其他疾病有關；運動與檢體溶血也會升高，不能單憑此值判斷癌症進展。\nMay rise with tissue injury or illness, exercise, or sample damage; alone it cannot establish cancer progression.",
    }, sources: [source("lactate-dehydrogenase-ldh-test", "LDH")],
  },
};
