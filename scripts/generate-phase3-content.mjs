import { mkdir, writeFile } from "node:fs/promises";

// The compact source rows below are original project material. Examples are composed here from
// simple beginner-friendly sentence frames and translated locally; they do not use Tatoeba data.
const rows = (source) =>
  source
    .trim()
    .split("\n")
    .map((line) => line.split("|"));
const nouns = rows(`
人|ひと|person
男|おとこ|man
女|おんな|woman
子ども|こども|child
友だち|ともだち|friend
家族|かぞく|family
父|ちち|my father
母|はは|my mother
兄|あに|my older brother
姉|あね|my older sister
弟|おとうと|my younger brother
妹|いもうと|my younger sister
先生|せんせい|teacher
学生|がくせい|student
会社員|かいしゃいん|office worker
医者|いしゃ|doctor
名前|なまえ|name
国|くに|country
日本|にほん|Japan
日本語|にほんご|Japanese language
英語|えいご|English language
学校|がっこう|school
大学|だいがく|university
会社|かいしゃ|company
店|みせ|shop
駅|えき|station
家|いえ|house
部屋|へや|room
町|まち|town
道|みち|road
車|くるま|car
電車|でんしゃ|train
自転車|じてんしゃ|bicycle
バス|ばす|bus
飛行機|ひこうき|airplane
船|ふね|ship
本|ほん|book
新聞|しんぶん|newspaper
手紙|てがみ|letter
電話|でんわ|telephone
時計|とけい|clock
写真|しゃしん|photograph
映画|えいが|movie
音楽|おんがく|music
テレビ|てれび|television
ラジオ|らじお|radio
机|つくえ|desk
椅子|いす|chair
かばん|かばん|bag
傘|かさ|umbrella
靴|くつ|shoes
服|ふく|clothes
帽子|ぼうし|hat
眼鏡|めがね|glasses
鍵|かぎ|key
水|みず|water
お茶|おちゃ|tea
コーヒー|こーひー|coffee
牛乳|ぎゅうにゅう|milk
ご飯|ごはん|rice
パン|ぱん|bread
卵|たまご|egg
肉|にく|meat
魚|さかな|fish
野菜|やさい|vegetable
果物|くだもの|fruit
りんご|りんご|apple
みかん|みかん|mandarin orange
朝ご飯|あさごはん|breakfast
昼ご飯|ひるごはん|lunch
晩ご飯|ばんごはん|dinner
食べ物|たべもの|food
お金|おかね|money
財布|さいふ|wallet
店員|てんいん|shop clerk
部屋|へや|room
入口|いりぐち|entrance
出口|でぐち|exit
病院|びょういん|hospital
図書館|としょかん|library
公園|こうえん|park
銀行|ぎんこう|bank
郵便局|ゆうびんきょく|post office
食堂|しょくどう|cafeteria
喫茶店|きっさてん|cafe
ホテル|ほてる|hotel
空港|くうこう|airport
天気|てんき|weather
雨|あめ|rain
雪|ゆき|snow
風|かぜ|wind
山|やま|mountain
川|かわ|river
海|うみ|sea
花|はな|flower
犬|いぬ|dog
猫|ねこ|cat
鳥|とり|bird
今日|きょう|today
明日|あした|tomorrow
昨日|きのう|yesterday
朝|あさ|morning
昼|ひる|noon
夜|よる|night
今|いま|now
時間|じかん|time
週|しゅう|week
月|つき|moon
年|とし|year
誕生日|たんじょうび|birthday
曜日|ようび|day of the week
月曜日|げつようび|Monday
火曜日|かようび|Tuesday
水曜日|すいようび|Wednesday
木曜日|もくようび|Thursday
金曜日|きんようび|Friday
土曜日|どようび|Saturday
日曜日|にちようび|Sunday
春|はる|spring
夏|なつ|summer
秋|あき|autumn
冬|ふゆ|winter
`)
  .filter((item, i, all) => all.findIndex((other) => other[0] === item[0]) === i)
  .slice(0, 101);

const verbs = rows(`
行く|いく|to go|行きます
来る|くる|to come|来ます
帰る|かえる|to return|帰ります
食べる|たべる|to eat|食べます
飲む|のむ|to drink|飲みます
見る|みる|to see|見ます
聞く|きく|to listen|聞きます
読む|よむ|to read|読みます
書く|かく|to write|書きます
話す|はなす|to speak|話します
買う|かう|to buy|買います
売る|うる|to sell|売ります
会う|あう|to meet|会います
待つ|まつ|to wait|待ちます
立つ|たつ|to stand|立ちます
座る|すわる|to sit|座ります
寝る|ねる|to sleep|寝ます
起きる|おきる|to wake up|起きます
働く|はたらく|to work|働きます
休む|やすむ|to rest|休みます
勉強する|べんきょうする|to study|勉強します
する|する|to do|します
遊ぶ|あそぶ|to play|遊びます
泳ぐ|およぐ|to swim|泳ぎます
走る|はしる|to run|走ります
歩く|あるく|to walk|歩きます
乗る|のる|to ride|乗ります
降りる|おりる|to get off|降ります
作る|つくる|to make|作ります
使う|つかう|to use|使います
開ける|あける|to open|開けます
閉める|しめる|to close|閉めます
入る|はいる|to enter|入ります
出る|でる|to leave|出ます
教える|おしえる|to teach|教えます
習う|ならう|to learn|習います
分かる|わかる|to understand|分かります
ある|ある|to exist (things)|あります
いる|いる|to exist (living)|います
`).map(([word, reading, meaning, polite]) => ({
  word,
  reading,
  meaning,
  partOfSpeech: "verb",
  example: `わたしは毎日${polite}。`,
  exampleMeaning: `I ${meaning.replace("to ", "")} every day.`,
}));

const adjectives = rows(`
大きい|おおきい|big|大きいです
小さい|ちいさい|small|小さいです
新しい|あたらしい|new|新しいです
古い|ふるい|old|古いです
高い|たかい|tall; expensive|高いです
安い|やすい|inexpensive|安いです
いい|いい|good|いいです
悪い|わるい|bad|悪いです
暑い|あつい|hot (weather)|暑いです
寒い|さむい|cold (weather)|寒いです
熱い|あつい|hot (to touch)|熱いです
冷たい|つめたい|cold (to touch)|冷たいです
おいしい|おいしい|delicious|おいしいです
忙しい|いそがしい|busy|忙しいです
楽しい|たのしい|fun|楽しいです
面白い|おもしろい|interesting|面白いです
難しい|むずかしい|difficult|難しいです
易しい|やさしい|easy|易しいです
早い|はやい|early; fast|早いです
遅い|おそい|late; slow|遅いです
近い|ちかい|near|近いです
遠い|とおい|far|遠いです
多い|おおい|many|多いです
少ない|すくない|few|少ないです
きれい|きれい|beautiful; clean|きれいです
静か|しずか|quiet|静かです
元気|げんき|well; energetic|元気です
好き|すき|liked; favorite|好きです
嫌い|きらい|disliked|嫌いです
有名|ゆうめい|famous|有名です
`).map(([word, reading, meaning, predicate]) => ({
  word,
  reading,
  meaning,
  partOfSpeech: "adjective",
  example: `この本は${predicate}。`,
  exampleMeaning: `This book is ${meaning}.`,
}));

const phrases = rows(`
これ|これ|this thing|これはわたしの本です。|This is my book.
それ|それ|that thing|それは何ですか。|What is that?
あれ|あれ|that thing over there|あれは学校です。|That over there is a school.
ここ|ここ|here|ここは駅です。|This is the station.
そこ|そこ|there|そこに店があります。|There is a shop there.
あそこ|あそこ|over there|あそこに山があります。|There is a mountain over there.
どこ|どこ|where|駅はどこですか。|Where is the station?
だれ|だれ|who|あの人はだれですか。|Who is that person?
何|なに|what|これは何ですか。|What is this?
いつ|いつ|when|誕生日はいつですか。|When is your birthday?
いくら|いくら|how much|この本はいくらですか。|How much is this book?
いくつ|いくつ|how many; how old|りんごはいくつですか。|How many apples are there?
とても|とても|very|この花はとてもきれいです。|This flower is very beautiful.
少し|すこし|a little|水を少し飲みます。|I drink a little water.
たくさん|たくさん|many; a lot|本をたくさん読みます。|I read many books.
いつも|いつも|always|いつも七時に起きます。|I always get up at seven.
よく|よく|often; well|よく日本語を勉強します。|I often study Japanese.
時々|ときどき|sometimes|時々映画を見ます。|I sometimes watch movies.
一緒に|いっしょに|together|友だちと一緒に行きます。|I go together with a friend.
ゆっくり|ゆっくり|slowly|ゆっくり話してください。|Please speak slowly.
もう|もう|already; more|もう一度お願いします。|One more time, please.
まだ|まだ|not yet; still|まだ食べていません。|I have not eaten yet.
そして|そして|and then|朝ご飯を食べます。そして学校へ行きます。|I eat breakfast, and then go to school.
でも|でも|but|小さいです。でも、とても便利です。|It is small, but very useful.
はい|はい|yes|はい、分かりました。|Yes, I understand.
いいえ|いいえ|no|いいえ、学生ではありません。|No, I am not a student.
ありがとう|ありがとう|thank you|ありがとう、と言いました。|I said, “Thank you.”
すみません|すみません|excuse me; sorry|すみません、駅はどこですか。|Excuse me, where is the station?
お願いします|おねがいします|please|水をお願いします。|Water, please.
大丈夫|だいじょうぶ|okay; all right|わたしは大丈夫です。|I am okay.
`).map(([word, reading, meaning, example, exampleMeaning]) => ({
  word,
  reading,
  meaning,
  partOfSpeech: "expression",
  example,
  exampleMeaning,
}));

const vocab = [
  ...nouns.map(([word, reading, meaning]) => ({
    word,
    reading,
    meaning,
    partOfSpeech: "noun",
    example: `これは${word}です。`,
    exampleMeaning: `This is ${meaning}.`,
  })),
  ...verbs,
  ...adjectives,
  ...phrases,
].map((item, index) => ({
  id: `n5-vocab-${String(index + 1).padStart(3, "0")}`,
  level: "N5",
  ...item,
}));
if (vocab.length !== 200)
  throw new Error(`Expected 200 distinct vocabulary items, got ${vocab.length}`);

const kanjiRows = rows(`
一|いち|ひと(つ)|one|一|one; single|A single line is the first step.|1
二|に|ふた(つ)|two|二|two|Two lines stand side by side.|2
三|さん|みっ(つ)|three|一|one|Three strokes make three clear lines.|3
四|し|よっ(つ); よん|four|囗|enclosure|Four sides make a little square room.|5
五|ご|いつ(つ)|five|二|two|A crossing pair of strokes grows into five.|4
六|ろく|むっ(つ)|six|八|eight|Two strokes open outward like a roof.|4
七|しち|なな(つ)|seven|一|one|One strong turn marks the number seven.|2
八|はち|やっ(つ)|eight|八|eight|Two strokes split apart like an eight.|2
九|きゅう|ここの(つ)|nine|乙|second|A bent hook makes the shape of nine.|2
十|じゅう|とお|ten|十|ten|A cross joins the two parts of ten.|2
百|ひゃく|もも|hundred|白|white|A small mark tops a hundred bright days.|6
千|せん|ち|thousand|十|ten|A little mark lifts ten to a thousand.|3
万|まん|よろず|ten thousand|一|one|A sweeping mark opens into many thousands.|3
円|えん|まる(い)|yen; circle|冂|open box|A round coin is a yen.|4
日|にち; じつ|ひ; か|day; sun|日|sun|The sun shines inside its daily frame.|4
月|げつ; がつ|つき|month; moon|月|moon|The moon is framed in a crescent-shaped window.|4
火|か|ひ|fire|火|fire|Flames leap up from two sparks.|4
水|すい|みず|water|水|water|Streams flow away from the center.|4
木|もく; ぼく|き|tree; wood|木|tree|Branches stretch from a strong tree trunk.|4
金|きん; こん|かね|gold; money|金|metal|A roof shelters bright metal treasure.|8
土|ど; と|つち|earth; soil|土|earth|A sprout stands in the soil.|3
山|さん|やま|mountain|山|mountain|Three peaks rise above the valley.|3
川|せん|かわ|river|川|river|Three flowing lines make a river.|3
田|でん|た|rice field|田|field|A field is divided into four paddies.|5
人|じん; にん|ひと|person|人|person|Two legs walk together as one person.|2
子|し; す|こ|child|子|child|A child reaches out with both arms.|3
女|じょ; にょ|おんな|woman|女|woman|A gentle crossing form represents a woman.|3
男|だん; なん|おとこ|man|田|field|A person works with strength in a field.|7
父|ふ|ちち|father|父|father|A father holds two tools in his hands.|4
母|ぼ|はは|mother|毋|mother|A mother’s caring form holds two marks.|5
友|ゆう|とも|friend|又|again|Two hands reach out to a friend.|4
先|せん|さき|ahead; previous|儿|legs|A leading person walks a step ahead.|6
生|せい; しょう|い(きる); う(まれる)|life; birth|生|life|A new shoot pushes up into life.|5
学|がく|まな(ぶ)|study; learning|子|child|A child learns beneath a sheltering roof.|8
校|こう|—|school|木|tree|A tree stands beside a school building.|10
本|ほん|もと|book; origin|木|tree|A mark shows the root of a tree, the origin.|5
大|だい; たい|おお(きい)|big|大|big|A person spreads their arms wide.|3
小|しょう|ちい(さい); こ|small|小|small|Three tiny marks show something small.|3
中|ちゅう|なか|middle; inside|丨|line|A line passes right through the center.|4
上|じょう|うえ; あ(がる)|above; up|一|one|A mark sits above the ground line.|3
下|か; げ|した; さ(がる)|below; down|一|one|A mark rests below the ground line.|3
左|さ|ひだり|left|工|work|A hand guides the work on the left.|5
右|う; ゆう|みぎ|right|口|mouth|A hand rests above a small speaking mouth.|5
東|とう|ひがし|east|木|tree|The sun rises through a tree in the east.|8
西|せい; さい|にし|west|西|west|The sun settles into its western basket.|6
南|なん|みなみ|south|十|ten|Warm rays shine toward the south.|9
北|ほく|きた|north|匕|spoon|Two figures turn away toward the north.|5
口|こう; く|くち|mouth|口|mouth|A simple open shape is a mouth.|3
目|もく|め|eye|目|eye|An eye looks out through its frame.|5
耳|じ|みみ|ear|耳|ear|Small lines trace the shape of an ear.|6
手|しゅ|て|hand|手|hand|Fingers reach out from a palm.|4
足|そく|あし|foot; leg|足|foot|A foot moves forward from its base.|7
力|りょく; りき|ちから|power|力|power|A bent arm shows strength.|2
気|き; け|—|spirit; energy|气|steam|Vapor rises like energy in the air.|6
天|てん|あま|heaven; sky|大|big|A great person reaches up to the sky.|4
雨|う|あめ|rain|雨|rain|Raindrops fall from the cloud above.|8
花|か|はな|flower|艹|grass|A flower blooms above its leafy stem.|7
魚|ぎょ|さかな; うお|fish|魚|fish|A fish swims beneath little waves.|11
犬|けん|いぬ|dog|犬|dog|A little mark gives the big shape a wagging dog.|4
名|めい; みょう|な|name|口|mouth|A name is spoken aloud at night.|6
年|ねん|とし|year|干|dry|A year marks the growing harvest.|6
時|じ|とき|time; hour|日|sun|The sun marks the time on a temple bell.|10
分|ぶん; ふん|わ(ける)|minute; part|刀|sword|A blade divides one part into two.|4
半|はん|なか(ば)|half|十|ten|A line divides a whole into two halves.|5
今|こん; きん|いま|now|人|person|A person pauses in this very moment.|4
毎|まい|ごと|every|毋|mother|A familiar mark returns every day.|6
何|か|なに; なん|what|人|person|A person asks what the sign means.|7
行|こう; ぎょう|い(く); おこな(う)|go; conduct|行|step|A traveler takes steps along the road.|6
来|らい|く(る)|come|木|tree|A traveler comes toward the welcoming tree.|7
入|にゅう|はい(る); い(れる)|enter|入|enter|Two lines pass into an opening.|2
出|しゅつ|で(る); だ(す)|exit; go out|凵|open box|Something rises up and out of a container.|5
休|きゅう|やす(む)|rest|人|person|A person rests beside a tree.|6
見|けん|み(る)|see; look|見|see|An eye looks out while legs move below.|7
言|げん; ごん|い(う); こと|say; word|言|speech|Words rise from a speaking mouth.|7
話|わ|はな(す)|speak; story|言|speech|Words and a tongue come together in a story.|13
食|しょく; じき|た(べる)|eat; food|食|eat|Food is placed beneath a small cover.|9
飲|いん|の(む)|drink|食|eat|A person opens their mouth to drink.|12
買|ばい|か(う)|buy|貝|shell|Shell money is exchanged to buy a gift.|12
高|こう|たか(い)|high; tall|高|high|A tall tower rises over a wide base.|10
安|あん|やす(い)|cheap; safe|宀|roof|A peaceful roof makes a safe home.|6
新|しん|あたら(しい)|new|斤|axe|An axe shapes fresh wood into something new.|13
古|こ|ふる(い)|old|口|mouth|Old stories are told aloud again.|5
白|はく; びゃく|しろ; しろ(い)|white|白|white|A bright sun shines white.|5
黒|こく|くろ; くろ(い)|black|黒|black|Dark marks gather beneath a roof.|11
赤|せき; しゃく|あか; あか(い)|red|赤|red|A bright flame glows red.|7
青|せい; しょう|あお; あお(い)|blue|青|blue|A clear sky turns blue above new growth.|8
`)
  .slice(0, 80)
  .map(([character, on, kun, meaning, radical, radicalMeaning, mnemonic, count]) => ({
    character,
    meaning,
    onReadings: on.split("; "),
    kunReadings: kun.split("; ").filter((value) => value !== "—"),
    radical,
    radicalMeaning,
    mnemonic,
    strokeCount: Number(count),
    jlpt: "N5",
    strokes: makeStrokes(Number(count), character),
  }));

function makeStrokes(count, character) {
  // Original, deliberately simple practice strokes with the glyph silhouette as a clear reference.
  // Real stroke counts come from the hand-curated N5 entry above.
  const patterns = [
    "M20 25 L78 25",
    "M48 16 L48 82",
    "M24 48 Q48 39 76 50",
    "M25 28 Q50 20 72 30 L70 73 Q48 81 27 70 Z",
  ];
  return Array.from(
    { length: count },
    (_, index) => patterns[(index + character.codePointAt(0)) % patterns.length],
  );
}

const grammar = [
  {
    id: "g01-desu",
    title: "A friendly introduction with です",
    summary: "Use です (desu) to say what something is, politely.",
    concept: "[Topic] は [description] です。 です makes a sentence polite.",
    steps: [
      {
        type: "intro",
        title: "Meet です",
        body: "です (desu) turns a simple description into a polite sentence. わたしは学生です means ‘I am a student.’",
        japanese: "わたしは学生です。",
        reading: "Watashi wa gakusei desu.",
        meaning: "I am a student.",
      },
      {
        type: "multiple-choice",
        prompt: "Which sentence means ‘I am a teacher’?",
        options: ["わたしは先生です。", "わたしを先生です。", "先生はわたしを。"],
        answer: "わたしは先生です。",
        feedback: "Put the person first, then their description, and finish with です.",
      },
      {
        type: "sentence-builder",
        prompt: "Build: ‘I am a student.’",
        tokens: ["です。", "学生", "わたしは"],
        answer: "わたしは学生です。",
        translation: "I am a student.",
      },
    ],
  },
  {
    id: "g02-wa",
    title: "Set the topic with は",
    summary: "は (wa) marks what your sentence is about.",
    concept: "[Topic] は [information] です。 The particle は is written ha, pronounced wa.",
    steps: [
      {
        type: "intro",
        title: "The topic marker は",
        body: "は marks the topic: the thing you’re talking about. In this job, は is pronounced wa.",
        japanese: "ねこはかわいいです。",
        reading: "Neko wa kawaii desu.",
        meaning: "Cats are cute.",
      },
      {
        type: "multiple-choice",
        prompt: "Choose the topic marker for ‘As for me, I’m a student.’",
        options: ["は (wa)", "を (o)", "で (de)"],
        answer: "は (wa)",
        feedback: "You found the topic! は tells us who or what the sentence is about.",
      },
      {
        type: "type-answer",
        prompt: "Complete: わたし ___ 学生です。 (I am a student.)",
        answers: ["は"],
        hint: "It is written ha, but said wa.",
      },
    ],
  },
  {
    id: "g03-ga",
    title: "Spotlight with が",
    summary: "が (ga) marks a subject, often with likes and abilities.",
    concept: "[Thing/person] が [liking or existence]. が can spotlight new information.",
    steps: [
      {
        type: "intro",
        title: "A little spotlight: が",
        body: "が marks the subject that does, exists, or is liked. It often answers ‘what?’ or ‘who?’",
        japanese: "ねこがいます。",
        reading: "Neko ga imasu.",
        meaning: "There is a cat.",
      },
      {
        type: "multiple-choice",
        prompt: "Which particle belongs in ‘I like music’? わたしは音楽 ___ 好きです。",
        options: ["が", "を", "で"],
        answer: "が",
        feedback: "好きです commonly pairs with が for the thing someone likes.",
      },
      {
        type: "sentence-builder",
        prompt: "Build: ‘There is a dog.’",
        tokens: ["います。", "犬が"],
        answer: "犬がいます。",
        translation: "There is a dog.",
      },
    ],
  },
  {
    id: "g04-o",
    title: "Give actions an object with を",
    summary: "を (o) marks what an action is done to.",
    concept: "[Person] は [thing] を [verb]. を is pronounced o.",
    steps: [
      {
        type: "intro",
        title: "The action’s target を",
        body: "を marks the direct object: the thing you read, eat, see, or buy. It is written wo and pronounced o.",
        japanese: "本を読みます。",
        reading: "Hon o yomimasu.",
        meaning: "I read a book.",
      },
      {
        type: "listen-pick",
        prompt: "Listen and pick the particle you hear.",
        audio: "水を飲みます。",
        options: ["を", "に", "が"],
        answer: "を",
        feedback: "飲みます (drink) acts on water, so を marks it.",
      },
      {
        type: "type-answer",
        prompt: "Complete: パン ___ 食べます。 (I eat bread.)",
        answers: ["を"],
        hint: "Mark the thing being eaten.",
      },
    ],
  },
  {
    id: "g05-ni",
    title: "Find a time or destination with に",
    summary: "に (ni) can mark when something happens or where you’re going.",
    concept: "[Time/place] に [action]. に points to a time or destination.",
    steps: [
      {
        type: "intro",
        title: "A point in time or place",
        body: "に points to a destination or a specific time. Think of it as a little pin on the map or clock.",
        japanese: "七時に起きます。",
        reading: "Shichi-ji ni okimasu.",
        meaning: "I get up at seven.",
      },
      {
        type: "multiple-choice",
        prompt: "Choose the particle for ‘I go to school.’ 学校 ___ 行きます。",
        options: ["に", "を", "で"],
        answer: "に",
        feedback: "に marks the destination of 行きます (go). へ can also mark direction.",
      },
      {
        type: "sentence-builder",
        prompt: "Build: ‘I meet a friend at three.’",
        tokens: ["会います。", "友だちに", "三時に"],
        answer: "三時に友だちに会います。",
        translation: "I meet a friend at three.",
      },
    ],
  },
  {
    id: "g06-de",
    title: "Show where it happens with で",
    summary: "で (de) marks where an action takes place or what tool you use.",
    concept:
      "[Place/tool] で [action]. に often marks a destination; で marks the action’s setting.",
    steps: [
      {
        type: "intro",
        title: "The action setting で",
        body: "Use で for the place where an action happens. Use に for a destination or for where something exists.",
        japanese: "図書館で本を読みます。",
        reading: "Toshokan de hon o yomimasu.",
        meaning: "I read a book at the library.",
      },
      {
        type: "multiple-choice",
        prompt: "I eat at home: うち ___ 食べます。",
        options: ["で", "に", "を"],
        answer: "で",
        feedback: "Eating is an action happening at home, so で fits.",
      },
      {
        type: "sentence-builder",
        prompt: "Build: ‘I study Japanese at school.’",
        tokens: ["勉強します。", "学校で", "日本語を"],
        answer: "学校で日本語を勉強します。",
        translation: "I study Japanese at school.",
      },
    ],
  },
  {
    id: "g07-masu",
    title: "Polite everyday verbs: ます",
    summary: "The ます form makes everyday actions polite.",
    concept: "Verb stem + ます: 食べます (eat), 見ます (see), 行きます (go).",
    steps: [
      {
        type: "intro",
        title: "A polite action ending",
        body: "ます is a friendly, polite ending for verbs. Japanese sentence endings carry the politeness, so the verb often comes last.",
        japanese: "毎日日本語を勉強します。",
        reading: "Mainichi nihongo o benkyou shimasu.",
        meaning: "I study Japanese every day.",
      },
      {
        type: "multiple-choice",
        prompt: "Which is the polite form of 読む (to read)?",
        options: ["読みます", "読むです", "読むます"],
        answer: "読みます",
        feedback: "読む changes to 読み, then add ます.",
      },
      {
        type: "sentence-builder",
        prompt: "Build: ‘I drink water.’",
        tokens: ["飲みます。", "水を", "わたしは"],
        answer: "わたしは水を飲みます。",
        translation: "I drink water.",
      },
    ],
  },
  {
    id: "g08-adjectives",
    title: "Describe things with adjectives",
    summary: "い-adjectives and な-adjectives have different sentence patterns.",
    concept: "い-adjective + です. な-adjective + です (or な before a noun).",
    steps: [
      {
        type: "intro",
        title: "Two adjective families",
        body: "い-adjectives like おいしい can go straight before です. な-adjectives like しずか use な before a noun: しずかな町.",
        japanese: "この町は静かです。",
        reading: "Kono machi wa shizuka desu.",
        meaning: "This town is quiet.",
      },
      {
        type: "multiple-choice",
        prompt: "Complete: この本は ___ です。 (This book is interesting.)",
        options: ["おもしろい", "おもしろくな", "おもしろな"],
        answer: "おもしろい",
        feedback: "い-adjectives keep their い before です.",
      },
      {
        type: "sentence-builder",
        prompt: "Build: ‘It is a quiet town.’",
        tokens: ["町です。", "静かな"],
        answer: "静かな町です。",
        translation: "It is a quiet town.",
      },
    ],
  },
  {
    id: "g09-questions",
    title: "Ask a gentle question with か",
    summary: "Add か to the end of a polite sentence to make a question.",
    concept: "Polite statement + か。 A question word stays where its answer belongs.",
    steps: [
      {
        type: "intro",
        title: "A question with か",
        body: "Put か at the end of a polite sentence to turn it into a question. In writing, finish with 。 or ?.",
        japanese: "学生ですか。",
        reading: "Gakusei desu ka?",
        meaning: "Are you a student?",
      },
      {
        type: "multiple-choice",
        prompt: "Where does か go in a polite question?",
        options: ["At the end", "At the start", "Before the noun"],
        answer: "At the end",
        feedback: "Yes! か gives the whole sentence a question shape.",
      },
      {
        type: "type-answer",
        prompt: "Add the question particle: これは本です ___",
        answers: ["か", "か。", "か?", "か？"],
        hint: "Place it at the end.",
      },
    ],
  },
  {
    id: "g10-negative",
    title: "Say ‘not’ politely",
    summary: "Use じゃありません to politely say what something is not.",
    concept: "Noun/adjective + じゃありません。 For verbs, ません replaces ます.",
    steps: [
      {
        type: "intro",
        title: "A soft, polite ‘not’",
        body: "じゃありません makes a noun or な-adjective negative. Polite verbs use ません: 食べません (do not eat).",
        japanese: "学生じゃありません。",
        reading: "Gakusei ja arimasen.",
        meaning: "I am not a student.",
      },
      {
        type: "multiple-choice",
        prompt: "How do you politely say ‘I do not drink’?",
        options: ["飲みません", "飲みじゃありません", "飲むない"],
        answer: "飲みません",
        feedback: "For a polite verb negative, replace ます with ません.",
      },
      {
        type: "sentence-builder",
        prompt: "Build: ‘I am not a teacher.’",
        tokens: ["じゃありません。", "先生", "わたしは"],
        answer: "わたしは先生じゃありません。",
        translation: "I am not a teacher.",
      },
    ],
  },
];

grammar[0].steps.push({
  type: "tracing",
  prompt: "Trace the kana あ before you go.",
  character: "あ",
  strokes: ["M30 35 Q50 20 70 35", "M50 30 L50 76", "M30 74 Q50 66 70 74"],
});
for (const lesson of grammar)
  lesson.steps.push({
    type: "match-pairs",
    prompt: "Pair each Japanese particle with its job.",
    pairs: [
      { left: "は", right: "Topic" },
      { left: "を", right: "Action target" },
      { left: "で", right: "Action place" },
    ],
    feedback: "Particles are small, but they do a big job!",
  });

await mkdir("content/vocabulary", { recursive: true });
await mkdir("content/kanji", { recursive: true });
await mkdir("content/lessons", { recursive: true });
await writeFile(
  "content/vocabulary/n5.json",
  JSON.stringify(
    {
      attribution: "Original project-authored vocabulary descriptions and example sentences.",
      items: vocab,
    },
    null,
    2,
  ) + "\n",
);
await writeFile(
  "content/kanji/n5.json",
  JSON.stringify(
    {
      attribution: "Original project-authored kanji mnemonics and simplified SVG practice guides.",
      entries: kanjiRows,
    },
    null,
    2,
  ) + "\n",
);
await writeFile(
  "content/lessons/grammar-n5.json",
  JSON.stringify(
    {
      attribution: "Original project-authored beginner grammar lessons and exercises.",
      lessons: grammar,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Wrote ${vocab.length} vocabulary items, ${kanjiRows.length} kanji, and ${grammar.length} grammar lessons.`,
);
