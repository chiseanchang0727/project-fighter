export const ENCOURAGEMENTS = [
  "今天的你，也值得被溫柔對待。",
  "慢慢來，照著自己的步調就好。",
  "每一個小小的照顧，都有意義。",
  "不必每天都堅強，休息也可以。",
  "今天先做好一件小事，就很棒了。",
  "你的努力，不需要用數字來證明。",
  "給自己一點耐心，也給自己一點空間。",
  "有些日子適合前進，有些日子適合歇一歇。",
  "你可以一邊害怕，一邊慢慢往前。",
  "今天的心情，不需要勉強變好。",
  "願你今天找到一個讓自己安心的小片刻。",
  "照顧自己，從聽見自己的需要開始。",
  "不必和別人的步調比較。",
  "一個深呼吸，也是一個新的開始。",
  "你值得被關心，也值得被陪伴。",
  "需要幫忙的時候，可以開口。",
  "小小的一步，也是屬於你的前進。",
  "今天的你，已經付出了自己的努力。",
  "把今天分成小段，一次走一小段就好。",
  "允許自己有累的時候。",
  "你不需要把所有事情都做完，才值得休息。",
  "為自己留一點喜歡的時間。",
  "今天，也可以對自己說聲辛苦了。",
  "你的感受很重要，值得被好好聆聽。",
  "不確定的時候，可以先停下來整理心情。",
  "每一次願意照顧自己，都值得肯定。",
  "生活裡的小小美好，也值得被記住。",
  "你可以選擇今天最適合自己的節奏。",
  "不必急著找到所有答案。",
  "無論今天過得如何，都請留一份溫柔給自己。",
] as const;

export interface Encouragement {
  text: string;
  from?: string;
}

const DEFAULT_ENCOURAGEMENTS: readonly Encouragement[] = ENCOURAGEMENTS.map((text) => ({ text }));

// Personal messages are selected by stable profile ID, never by display name.
const USER_ENCOURAGEMENTS: Readonly<Record<string, readonly Encouragement[]>> = {
  debbie: [{
    text: "Hi Debbie 從接收到確診到開始治療，是段很不容易的一段路，雖然無法一起分擔疼痛，但我會為你加油～\n\n當你感到疼痛沮喪時，請相信你的身體，她是強而有力的，一切會越來越好！加油！",
    from: "Annzo",
  }, {
    text: "Debbie加油！我們會一起陪妳康復",
    from: "Sam",
  }],
};

export function encouragementsFor(userId: string): readonly Encouragement[] {
  const personal = Object.hasOwn(USER_ENCOURAGEMENTS, userId) ? USER_ENCOURAGEMENTS[userId] : undefined;
  return personal?.length ? personal : DEFAULT_ENCOURAGEMENTS;
}

/** Pick another message without immediately repeating, unless there is only one. */
export function nextEncouragement(previous: number | null, count: number = ENCOURAGEMENTS.length): number {
  if (count <= 1) return 0;
  const prior = previous !== null && previous >= 0 && previous < count ? previous : null;
  const choices = count - (prior === null ? 0 : 1);
  const index = Math.floor(Math.random() * choices);
  return prior !== null && index >= prior ? index + 1 : index;
}
