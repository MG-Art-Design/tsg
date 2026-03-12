import { Asset, QuarterData } from './types'

export function getCurrentQuarter(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  if (month >= 0 && month <= 2) return `Q1-${year}`
  if (month >= 3 && month <= 5) return `Q2-${year}`
  if (month >= 6 && month <= 8) return `Q3-${year}`
  return `Q4-${year}`
}

export function getQuarterData(quarter: string): QuarterData {
  const [q, year] = quarter.split('-')
  const yearNum = parseInt(year)
  
  const quarters = {
    Q1: { start: new Date(yearNum, 0, 1), end: new Date(yearNum, 2, 31) },
    Q2: { start: new Date(yearNum, 3, 1), end: new Date(yearNum, 5, 30) },
    Q3: { start: new Date(yearNum, 6, 1), end: new Date(yearNum, 8, 30) },
    Q4: { start: new Date(yearNum, 9, 1), end: new Date(yearNum, 11, 31) },
  }
  
  const { start, end } = quarters[q as keyof typeof quarters]
  const now = Date.now()
  
  return {
    quarter,
    startDate: start.getTime(),
    endDate: end.getTime(),
    isActive: now >= start.getTime() && now <= end.getTime(),
  }
}

export function generateMockMarketData(): Asset[] {
  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms' },
    { symbol: 'JPM', name: 'JPMorgan Chase' },
  ]
  
  const crypto = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' },
  ]
  
  const baseStockPrice = 150
  const baseCryptoPrice = 40000
  
  return [
    ...stocks.map(s => ({
      ...s,
      type: 'stock' as const,
      currentPrice: baseStockPrice * (0.5 + Math.random() * 3),
      priceChange24h: (Math.random() - 0.5) * 20,
      priceChangePercent24h: (Math.random() - 0.5) * 8,
    })),
    ...crypto.map(c => ({
      ...c,
      type: 'crypto' as const,
      currentPrice: baseCryptoPrice * (0.01 + Math.random() * 2),
      priceChange24h: (Math.random() - 0.5) * 2000,
      priceChangePercent24h: (Math.random() - 0.5) * 12,
    })),
  ]
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return formatCurrency(value)
}

export function getRandomAvatar(): string {
  const avatars = ['🦁', '🐯', '🐻', '🦊', '🐺', '🦅', '🦈', '🐉', '🦖', '🦏', '🐘', '🦒', '🦌', '🐎', '🦓']
  return avatars[Math.floor(Math.random() * avatars.length)]
}

export function getEmailBasedAvatar(email: string): string {
  if (!email || email.length < 2) return getRandomAvatar()

  const cleanEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (cleanEmail.length < 2) return getRandomAvatar()

  const firstChar = cleanEmail[0]
  const lastChar = cleanEmail[cleanEmail.length - 1]
  const combo = firstChar + lastChar

  const emojiMap: Record<string, { concept: string; emoji: string }> = {
    aa: { concept: 'Arctic Adventure', emoji: '🐧' },
    ab: { concept: 'Alpha Bear', emoji: '🐻' },
    ac: { concept: 'Apex Cat', emoji: '🐆' },
    ad: { concept: 'Aqua Dragon', emoji: '🐉' },
    ae: { concept: 'Arctic Eagle', emoji: '🦅' },
    af: { concept: 'Arctic Fox', emoji: '🦊' },
    ag: { concept: 'Apex Gorilla', emoji: '🦍' },
    ah: { concept: 'Alpha Horse', emoji: '🐎' },
    ai: { concept: 'Arctic Iguana', emoji: '🦎' },
    aj: { concept: 'Agile Jaguar', emoji: '🐆' },
    ak: { concept: 'Alpha Koala', emoji: '🐨' },
    al: { concept: 'Alpha Lion', emoji: '🦁' },
    am: { concept: 'Arctic Mammoth', emoji: '🦣' },
    an: { concept: 'Alpha Narwhal', emoji: '🐋' },
    ao: { concept: 'Alpine Owl', emoji: '🦉' },
    ap: { concept: 'Arctic Panda', emoji: '🐼' },
    aq: { concept: 'Aquatic Quest', emoji: '🐠' },
    ar: { concept: 'Alpha Ram', emoji: '🐏' },
    as: { concept: 'Alpha Shark', emoji: '🦈' },
    at: { concept: 'Alpha Tiger', emoji: '🐯' },
    au: { concept: 'Arctic Unicorn', emoji: '🦄' },
    av: { concept: 'Apex Viper', emoji: '🐍' },
    aw: { concept: 'Alpha Wolf', emoji: '🐺' },
    ax: { concept: 'Apex Ox', emoji: '🐂' },
    ay: { concept: 'Arctic Yak', emoji: '🦬' },
    az: { concept: 'Alpha Zebra', emoji: '🦓' },
    
    ba: { concept: 'Bold Albatross', emoji: '🦅' },
    bb: { concept: 'Brave Bear', emoji: '🧸' },
    bc: { concept: 'Blue Crab', emoji: '🦀' },
    bd: { concept: 'Bold Dragon', emoji: '🐲' },
    be: { concept: 'Bald Eagle', emoji: '🦅' },
    bf: { concept: 'Black Fox', emoji: '🦊' },
    bg: { concept: 'Big Gorilla', emoji: '🦍' },
    bh: { concept: 'Bold Hawk', emoji: '🦅' },
    bi: { concept: 'Brave Iguana', emoji: '🦎' },
    bj: { concept: 'Bold Jaguar', emoji: '🐆' },
    bk: { concept: 'Brave Kangaroo', emoji: '🦘' },
    bl: { concept: 'Bold Lion', emoji: '🦁' },
    bm: { concept: 'Big Mammoth', emoji: '🦣' },
    bn: { concept: 'Blue Narwhal', emoji: '🐋' },
    bo: { concept: 'Barn Owl', emoji: '🦉' },
    bp: { concept: 'Bold Panther', emoji: '🐆' },
    bq: { concept: 'Brave Quest', emoji: '🦎' },
    br: { concept: 'Bold Rhino', emoji: '🦏' },
    bs: { concept: 'Bull Shark', emoji: '🦈' },
    bt: { concept: 'Bengal Tiger', emoji: '🐅' },
    bu: { concept: 'Bold Unicorn', emoji: '🦄' },
    bv: { concept: 'Bold Vulture', emoji: '🦅' },
    bw: { concept: 'Brave Wolf', emoji: '🐺' },
    bx: { concept: 'Bold Ox', emoji: '🐂' },
    by: { concept: 'Brave Yak', emoji: '🦬' },
    bz: { concept: 'Bold Zebra', emoji: '🦓' },

    ca: { concept: 'Cosmic Adventure', emoji: '🚀' },
    cb: { concept: 'Clever Bear', emoji: '🐻' },
    cc: { concept: 'Cool Cat', emoji: '🐱' },
    cd: { concept: 'Cosmic Dragon', emoji: '🐉' },
    ce: { concept: 'Clever Eagle', emoji: '🦅' },
    cf: { concept: 'Clever Fox', emoji: '🦊' },
    cg: { concept: 'Cosmic Gorilla', emoji: '🦍' },
    ch: { concept: 'Clever Horse', emoji: '🐴' },
    ci: { concept: 'Cyber Iguana', emoji: '🦎' },
    cj: { concept: 'Clever Jaguar', emoji: '🐆' },
    ck: { concept: 'Cool Koala', emoji: '🐨' },
    cl: { concept: 'Cosmic Lion', emoji: '🦁' },
    cm: { concept: 'Clever Monkey', emoji: '🐵' },
    cn: { concept: 'Cosmic Narwhal', emoji: '🐋' },
    co: { concept: 'Clever Owl', emoji: '🦉' },
    cp: { concept: 'Cool Panda', emoji: '🐼' },
    cq: { concept: 'Clever Quest', emoji: '🧐' },
    cr: { concept: 'Clever Raven', emoji: '🦅' },
    cs: { concept: 'Cyber Shark', emoji: '🦈' },
    ct: { concept: 'Clever Tiger', emoji: '🐯' },
    cu: { concept: 'Cosmic Unicorn', emoji: '🦄' },
    cv: { concept: 'Clever Viper', emoji: '🐍' },
    cw: { concept: 'Clever Wolf', emoji: '🐺' },
    cx: { concept: 'Cosmic Ox', emoji: '🐂' },
    cy: { concept: 'Clever Yak', emoji: '🦬' },
    cz: { concept: 'Cool Zebra', emoji: '🦓' },

    da: { concept: 'Daring Adventure', emoji: '🦸' },
    db: { concept: 'Dancing Bear', emoji: '🐻' },
    dc: { concept: 'Dark Cat', emoji: '🐈‍⬛' },
    dd: { concept: 'Daring Dragon', emoji: '🐉' },
    de: { concept: 'Desert Eagle', emoji: '🦅' },
    df: { concept: 'Daring Fox', emoji: '🦊' },
    dg: { concept: 'Daring Gorilla', emoji: '🦍' },
    dh: { concept: 'Desert Hawk', emoji: '🦅' },
    di: { concept: 'Desert Iguana', emoji: '🦎' },
    dj: { concept: 'Daring Jaguar', emoji: '🐆' },
    dk: { concept: 'Daring Koala', emoji: '🐨' },
    dl: { concept: 'Daring Lion', emoji: '🦁' },
    dm: { concept: 'Dark Mammoth', emoji: '🦣' },
    dn: { concept: 'Deep Narwhal', emoji: '🐋' },
    do: { concept: 'Dawn Owl', emoji: '🦉' },
    dp: { concept: 'Daring Panther', emoji: '🐆' },
    dq: { concept: 'Daring Quest', emoji: '🦸' },
    dr: { concept: 'Daring Rhino', emoji: '🦏' },
    ds: { concept: 'Deep Shark', emoji: '🦈' },
    dt: { concept: 'Daring Tiger', emoji: '🐯' },
    du: { concept: 'Daring Unicorn', emoji: '🦄' },
    dv: { concept: 'Diving Vulture', emoji: '🦅' },
    dw: { concept: 'Daring Wolf', emoji: '🐺' },
    dx: { concept: 'Daring Ox', emoji: '🐂' },
    dy: { concept: 'Dynamic Yak', emoji: '🦬' },
    dz: { concept: 'Daring Zebra', emoji: '🦓' },

    ea: { concept: 'Epic Adventure', emoji: '⚔️' },
    eb: { concept: 'Epic Bear', emoji: '🐻' },
    ec: { concept: 'Electric Cat', emoji: '🐈' },
    ed: { concept: 'Epic Dragon', emoji: '🐉' },
    ee: { concept: 'Epic Eagle', emoji: '🦅' },
    ef: { concept: 'Electric Fox', emoji: '🦊' },
    eg: { concept: 'Epic Gorilla', emoji: '🦍' },
    eh: { concept: 'Epic Horse', emoji: '🐎' },
    ei: { concept: 'Epic Iguana', emoji: '🦎' },
    ej: { concept: 'Epic Jaguar', emoji: '🐆' },
    ek: { concept: 'Epic Koala', emoji: '🐨' },
    el: { concept: 'Epic Lion', emoji: '🦁' },
    em: { concept: 'Epic Mammoth', emoji: '🦣' },
    en: { concept: 'Epic Narwhal', emoji: '🐋' },
    eo: { concept: 'Epic Owl', emoji: '🦉' },
    ep: { concept: 'Epic Panda', emoji: '🐼' },
    eq: { concept: 'Epic Quest', emoji: '⚔️' },
    er: { concept: 'Epic Ram', emoji: '🐏' },
    es: { concept: 'Epic Shark', emoji: '🦈' },
    et: { concept: 'Epic Tiger', emoji: '🐯' },
    eu: { concept: 'Epic Unicorn', emoji: '🦄' },
    ev: { concept: 'Epic Viper', emoji: '🐍' },
    ew: { concept: 'Epic Wolf', emoji: '🐺' },
    ex: { concept: 'Epic Ox', emoji: '🐂' },
    ey: { concept: 'Epic Yak', emoji: '🦬' },
    ez: { concept: 'Epic Zebra', emoji: '🦓' },

    fa: { concept: 'Fierce Adventure', emoji: '💥' },
    fb: { concept: 'Fierce Bear', emoji: '🐻' },
    fc: { concept: 'Fire Cat', emoji: '🐈' },
    fd: { concept: 'Fire Dragon', emoji: '🐉' },
    fe: { concept: 'Fierce Eagle', emoji: '🦅' },
    ff: { concept: 'Fire Fox', emoji: '🦊' },
    fg: { concept: 'Fierce Gorilla', emoji: '🦍' },
    fh: { concept: 'Fierce Hawk', emoji: '🦅' },
    fi: { concept: 'Fire Iguana', emoji: '🦎' },
    fj: { concept: 'Fierce Jaguar', emoji: '🐆' },
    fk: { concept: 'Fierce Koala', emoji: '🐨' },
    fl: { concept: 'Fierce Lion', emoji: '🦁' },
    fm: { concept: 'Fierce Mammoth', emoji: '🦣' },
    fn: { concept: 'Fierce Narwhal', emoji: '🐋' },
    fo: { concept: 'Forest Owl', emoji: '🦉' },
    fp: { concept: 'Fierce Panther', emoji: '🐆' },
    fq: { concept: 'Fierce Quest', emoji: '💥' },
    fr: { concept: 'Fierce Ram', emoji: '🐏' },
    fs: { concept: 'Fierce Shark', emoji: '🦈' },
    ft: { concept: 'Fierce Tiger', emoji: '🐯' },
    fu: { concept: 'Fierce Unicorn', emoji: '🦄' },
    fv: { concept: 'Flying Vulture', emoji: '🦅' },
    fw: { concept: 'Fierce Wolf', emoji: '🐺' },
    fx: { concept: 'Fierce Ox', emoji: '🐂' },
    fy: { concept: 'Fierce Yak', emoji: '🦬' },
    fz: { concept: 'Fierce Zebra', emoji: '🦓' },

    ga: { concept: 'Great Adventure', emoji: '🌟' },
    gb: { concept: 'Grizzly Bear', emoji: '🐻' },
    gc: { concept: 'Galaxy Cat', emoji: '🐈' },
    gd: { concept: 'Golden Dragon', emoji: '🐉' },
    ge: { concept: 'Golden Eagle', emoji: '🦅' },
    gf: { concept: 'Gray Fox', emoji: '🦊' },
    gg: { concept: 'Great Gorilla', emoji: '🦍' },
    gh: { concept: 'Galloping Horse', emoji: '🐎' },
    gi: { concept: 'Green Iguana', emoji: '🦎' },
    gj: { concept: 'Great Jaguar', emoji: '🐆' },
    gk: { concept: 'Gallant Koala', emoji: '🐨' },
    gl: { concept: 'Great Lion', emoji: '🦁' },
    gm: { concept: 'Giant Mammoth', emoji: '🦣' },
    gn: { concept: 'Great Narwhal', emoji: '🐋' },
    go: { concept: 'Great Owl', emoji: '🦉' },
    gp: { concept: 'Giant Panda', emoji: '🐼' },
    gq: { concept: 'Grand Quest', emoji: '🌟' },
    gr: { concept: 'Great Ram', emoji: '🐏' },
    gs: { concept: 'Grand Safari', emoji: '🦁' },
    gt: { concept: 'Great Tiger', emoji: '🐯' },
    gu: { concept: 'Golden Unicorn', emoji: '🦄' },
    gv: { concept: 'Great Vulture', emoji: '🦅' },
    gw: { concept: 'Gray Wolf', emoji: '🐺' },
    gx: { concept: 'Giant Ox', emoji: '🐂' },
    gy: { concept: 'Giant Yak', emoji: '🦬' },
    gz: { concept: 'Golden Zebra', emoji: '🦓' },

    ha: { concept: 'Hero Adventure', emoji: '🦸' },
    hb: { concept: 'Honey Bear', emoji: '🐻' },
    hc: { concept: 'House Cat', emoji: '🐈' },
    hd: { concept: 'Hidden Dragon', emoji: '🐉' },
    he: { concept: 'Hunting Eagle', emoji: '🦅' },
    hf: { concept: 'Hunting Fox', emoji: '🦊' },
    hg: { concept: 'Highland Gorilla', emoji: '🦍' },
    hh: { concept: 'Highland Horse', emoji: '🐎' },
    hi: { concept: 'Hidden Iguana', emoji: '🦎' },
    hj: { concept: 'Hunting Jaguar', emoji: '🐆' },
    hk: { concept: 'Happy Koala', emoji: '🐨' },
    hl: { concept: 'Highland Lion', emoji: '🦁' },
    hm: { concept: 'Highland Mammoth', emoji: '🦣' },
    hn: { concept: 'Hidden Narwhal', emoji: '🐋' },
    ho: { concept: 'Hoot Owl', emoji: '🦉' },
    hp: { concept: 'Highland Panda', emoji: '🐼' },
    hq: { concept: 'Hero Quest', emoji: '🦸' },
    hr: { concept: 'Highland Ram', emoji: '🐏' },
    hs: { concept: 'Hammerhead Shark', emoji: '🦈' },
    ht: { concept: 'Hunting Tiger', emoji: '🐯' },
    hu: { concept: 'Highland Unicorn', emoji: '🦄' },
    hv: { concept: 'Hovering Vulture', emoji: '🦅' },
    hw: { concept: 'Howling Wolf', emoji: '🐺' },
    hx: { concept: 'Heavy Ox', emoji: '🐂' },
    hy: { concept: 'Highland Yak', emoji: '🦬' },
    hz: { concept: 'Highland Zebra', emoji: '🦓' },

    ia: { concept: 'Ice Adventure', emoji: '❄️' },
    ib: { concept: 'Ice Bear', emoji: '🐻‍❄️' },
    ic: { concept: 'Ice Cat', emoji: '🐈' },
    id: { concept: 'Ice Dragon', emoji: '🐉' },
    ie: { concept: 'Ice Eagle', emoji: '🦅' },
    if: { concept: 'Ice Fox', emoji: '🦊' },
    ig: { concept: 'Imperial Gorilla', emoji: '🦍' },
    ih: { concept: 'Iron Horse', emoji: '🐎' },
    ii: { concept: 'Island Iguana', emoji: '🦎' },
    ij: { concept: 'Island Jaguar', emoji: '🐆' },
    ik: { concept: 'Island Koala', emoji: '🐨' },
    il: { concept: 'Imperial Lion', emoji: '🦁' },
    im: { concept: 'Ice Mammoth', emoji: '🦣' },
    in: { concept: 'Ice Narwhal', emoji: '🐋' },
    io: { concept: 'Island Owl', emoji: '🦉' },
    ip: { concept: 'Imperial Panda', emoji: '🐼' },
    iq: { concept: 'Island Quest', emoji: '❄️' },
    ir: { concept: 'Iron Ram', emoji: '🐏' },
    is: { concept: 'Ice Shark', emoji: '🦈' },
    it: { concept: 'Imperial Tiger', emoji: '🐯' },
    iu: { concept: 'Ice Unicorn', emoji: '🦄' },
    iv: { concept: 'Imperial Viper', emoji: '🐍' },
    iw: { concept: 'Ice Wolf', emoji: '🐺' },
    ix: { concept: 'Iron Ox', emoji: '🐂' },
    iy: { concept: 'Ice Yak', emoji: '🦬' },
    iz: { concept: 'Imperial Zebra', emoji: '🦓' },

    ja: { concept: 'Jungle Adventure', emoji: '🌴' },
    jb: { concept: 'Jungle Bear', emoji: '🐻' },
    jc: { concept: 'Jungle Cat', emoji: '🐈' },
    jd: { concept: 'Jade Dragon', emoji: '🐉' },
    je: { concept: 'Jungle Eagle', emoji: '🦅' },
    jf: { concept: 'Jungle Fox', emoji: '🦊' },
    jg: { concept: 'Jungle Gorilla', emoji: '🦍' },
    jh: { concept: 'Jumping Horse', emoji: '🐎' },
    ji: { concept: 'Jungle Iguana', emoji: '🦎' },
    jj: { concept: 'Jungle Jaguar', emoji: '🐆' },
    jk: { concept: 'Jumping Koala', emoji: '🐨' },
    jl: { concept: 'Jungle Lion', emoji: '🦁' },
    jm: { concept: 'Jungle Mammoth', emoji: '🦣' },
    jn: { concept: 'Jumping Narwhal', emoji: '🐋' },
    jo: { concept: 'Jungle Owl', emoji: '🦉' },
    jp: { concept: 'Jumping Panda', emoji: '🐼' },
    jq: { concept: 'Jungle Quest', emoji: '🌴' },
    jr: { concept: 'Jumping Ram', emoji: '🐏' },
    js: { concept: 'Java Shark', emoji: '🦈' },
    jt: { concept: 'Jungle Tiger', emoji: '🐯' },
    ju: { concept: 'Jade Unicorn', emoji: '🦄' },
    jv: { concept: 'Jungle Viper', emoji: '🐍' },
    jw: { concept: 'Jungle Wolf', emoji: '🐺' },
    jx: { concept: 'Jungle Ox', emoji: '🐂' },
    jy: { concept: 'Jungle Yak', emoji: '🦬' },
    jz: { concept: 'Jungle Zebra', emoji: '🦓' },

    ka: { concept: 'King Adventure', emoji: '👑' },
    kb: { concept: 'King Bear', emoji: '🐻' },
    kc: { concept: 'King Cat', emoji: '🐈' },
    kd: { concept: 'King Dragon', emoji: '🐉' },
    ke: { concept: 'King Eagle', emoji: '🦅' },
    kf: { concept: 'King Fox', emoji: '🦊' },
    kg: { concept: 'King Gorilla', emoji: '🦍' },
    kh: { concept: 'King Horse', emoji: '🐎' },
    ki: { concept: 'King Iguana', emoji: '🦎' },
    kj: { concept: 'King Jaguar', emoji: '🐆' },
    kk: { concept: 'King Koala', emoji: '🐨' },
    kl: { concept: 'King Lion', emoji: '🦁' },
    km: { concept: 'King Mammoth', emoji: '🦣' },
    kn: { concept: 'King Narwhal', emoji: '🐋' },
    ko: { concept: 'King Owl', emoji: '🦉' },
    kp: { concept: 'King Panda', emoji: '🐼' },
    kq: { concept: 'King Quest', emoji: '👑' },
    kr: { concept: 'King Ram', emoji: '🐏' },
    ks: { concept: 'King Shark', emoji: '🦈' },
    kt: { concept: 'King Tiger', emoji: '🐯' },
    ku: { concept: 'King Unicorn', emoji: '🦄' },
    kv: { concept: 'King Viper', emoji: '🐍' },
    kw: { concept: 'King Wolf', emoji: '🐺' },
    kx: { concept: 'King Ox', emoji: '🐂' },
    ky: { concept: 'King Yak', emoji: '🦬' },
    kz: { concept: 'King Zebra', emoji: '🦓' },

    la: { concept: 'Legendary Adventure', emoji: '🌟' },
    lb: { concept: 'Legendary Bear', emoji: '🐻' },
    lc: { concept: 'Lightning Cat', emoji: '🐈' },
    ld: { concept: 'Lightning Dragon', emoji: '🐉' },
    le: { concept: 'Lightning Eagle', emoji: '🦅' },
    lf: { concept: 'Lightning Fox', emoji: '🦊' },
    lg: { concept: 'Legendary Gorilla', emoji: '🦍' },
    lh: { concept: 'Lightning Horse', emoji: '🐎' },
    li: { concept: 'Lightning Iguana', emoji: '🦎' },
    lj: { concept: 'Lightning Jaguar', emoji: '🐆' },
    lk: { concept: 'Lucky Koala', emoji: '🐨' },
    ll: { concept: 'Legendary Lion', emoji: '🦁' },
    lm: { concept: 'Legendary Mammoth', emoji: '🦣' },
    ln: { concept: 'Legendary Narwhal', emoji: '🐋' },
    lo: { concept: 'Lunar Owl', emoji: '🦉' },
    lp: { concept: 'Legendary Panda', emoji: '🐼' },
    lq: { concept: 'Legendary Quest', emoji: '🌟' },
    lr: { concept: 'Legendary Ram', emoji: '🐏' },
    ls: { concept: 'Lightning Shark', emoji: '🦈' },
    lt: { concept: 'Lightning Tiger', emoji: '🐯' },
    lu: { concept: 'Legendary Unicorn', emoji: '🦄' },
    lv: { concept: 'Lightning Viper', emoji: '🐍' },
    lw: { concept: 'Lone Wolf', emoji: '🐺' },
    lx: { concept: 'Legendary Ox', emoji: '🐂' },
    ly: { concept: 'Legendary Yak', emoji: '🦬' },
    lz: { concept: 'Lightning Zebra', emoji: '🦓' },

    ma: { concept: 'Mystic Adventure', emoji: '🔮' },
    mb: { concept: 'Mountain Bear', emoji: '🐻' },
    mc: { concept: 'Moon Cat', emoji: '🐈' },
    md: { concept: 'Mystic Dragon', emoji: '🐉' },
    me: { concept: 'Mountain Eagle', emoji: '🦅' },
    mf: { concept: 'Moon Fox', emoji: '🦊' },
    mg: { concept: 'Mountain Gorilla', emoji: '🦍' },
    mh: { concept: 'Mystic Horse', emoji: '🐎' },
    mi: { concept: 'Moon Iguana', emoji: '🦎' },
    mj: { concept: 'Mystic Jaguar', emoji: '🐆' },
    mk: { concept: 'Moon Koala', emoji: '🐨' },
    ml: { concept: 'Mountain Lion', emoji: '🦁' },
    mm: { concept: 'Mighty Mammoth', emoji: '🦣' },
    mn: { concept: 'Mystic Narwhal', emoji: '🐋' },
    mo: { concept: 'Mystic Owl', emoji: '🦉' },
    mp: { concept: 'Mountain Panda', emoji: '🐼' },
    mq: { concept: 'Mystic Quest', emoji: '🔮' },
    mr: { concept: 'Mountain Ram', emoji: '🐏' },
    ms: { concept: 'Mystic Shark', emoji: '🦈' },
    mt: { concept: 'Mystic Tiger', emoji: '🐯' },
    mu: { concept: 'Mystic Unicorn', emoji: '🦄' },
    mv: { concept: 'Mountain Viper', emoji: '🐍' },
    mw: { concept: 'Moon Wolf', emoji: '🐺' },
    mx: { concept: 'Mighty Ox', emoji: '🐂' },
    my: { concept: 'Mighty Yak', emoji: '🦬' },
    mz: { concept: 'Mystic Zebra', emoji: '🦓' },

    na: { concept: 'Neon Adventure', emoji: '💫' },
    nb: { concept: 'Night Bear', emoji: '🐻' },
    nc: { concept: 'Neon Cat', emoji: '🐈' },
    nd: { concept: 'Night Dragon', emoji: '🐉' },
    ne: { concept: 'Night Eagle', emoji: '🦅' },
    nf: { concept: 'Night Fox', emoji: '🦊' },
    ng: { concept: 'Night Gorilla', emoji: '🦍' },
    nh: { concept: 'Night Horse', emoji: '🐎' },
    ni: { concept: 'Neon Iguana', emoji: '🦎' },
    nj: { concept: 'Night Jaguar', emoji: '🐆' },
    nk: { concept: 'Night Koala', emoji: '🐨' },
    nl: { concept: 'Night Lion', emoji: '🦁' },
    nm: { concept: 'Night Mammoth', emoji: '🦣' },
    nn: { concept: 'Night Narwhal', emoji: '🐋' },
    no: { concept: 'Night Owl', emoji: '🦉' },
    np: { concept: 'Night Panda', emoji: '🐼' },
    nq: { concept: 'Neon Quest', emoji: '💫' },
    nr: { concept: 'Night Ram', emoji: '🐏' },
    ns: { concept: 'Night Shark', emoji: '🦈' },
    nt: { concept: 'Night Tiger', emoji: '🐯' },
    nu: { concept: 'Neon Unicorn', emoji: '🦄' },
    nv: { concept: 'Night Viper', emoji: '🐍' },
    nw: { concept: 'Night Wolf', emoji: '🐺' },
    nx: { concept: 'Night Ox', emoji: '🐂' },
    ny: { concept: 'Night Yak', emoji: '🦬' },
    nz: { concept: 'Neon Zebra', emoji: '🦓' },

    oa: { concept: 'Ocean Adventure', emoji: '🌊' },
    ob: { concept: 'Ocean Bear', emoji: '🐻' },
    oc: { concept: 'Ocean Cat', emoji: '🐈' },
    od: { concept: 'Ocean Dragon', emoji: '🐉' },
    oe: { concept: 'Ocean Eagle', emoji: '🦅' },
    of: { concept: 'Ocean Fox', emoji: '🦊' },
    og: { concept: 'Ocean Gorilla', emoji: '🦍' },
    oh: { concept: 'Ocean Horse', emoji: '🐎' },
    oi: { concept: 'Ocean Iguana', emoji: '🦎' },
    oj: { concept: 'Ocean Jaguar', emoji: '🐆' },
    ok: { concept: 'Ocean Koala', emoji: '🐨' },
    ol: { concept: 'Ocean Lion', emoji: '🦁' },
    om: { concept: 'Ocean Mammoth', emoji: '🦣' },
    on: { concept: 'Ocean Narwhal', emoji: '🐋' },
    oo: { concept: 'Ocean Owl', emoji: '🦉' },
    op: { concept: 'Ocean Panda', emoji: '🐼' },
    oq: { concept: 'Ocean Quest', emoji: '🌊' },
    or: { concept: 'Ocean Ram', emoji: '🐏' },
    os: { concept: 'Ocean Shark', emoji: '🦈' },
    ot: { concept: 'Ocean Tiger', emoji: '🐯' },
    ou: { concept: 'Ocean Unicorn', emoji: '🦄' },
    ov: { concept: 'Ocean Viper', emoji: '🐍' },
    ow: { concept: 'Ocean Wolf', emoji: '🐺' },
    ox: { concept: 'Omega Ox', emoji: '🐂' },
    oy: { concept: 'Ocean Yak', emoji: '🦬' },
    oz: { concept: 'Ocean Zebra', emoji: '🦓' },

    pa: { concept: 'Power Adventure', emoji: '⚡' },
    pb: { concept: 'Polar Bear', emoji: '🐻‍❄️' },
    pc: { concept: 'Power Cat', emoji: '🐈' },
    pd: { concept: 'Power Dragon', emoji: '🐉' },
    pe: { concept: 'Power Eagle', emoji: '🦅' },
    pf: { concept: 'Polar Fox', emoji: '🦊' },
    pg: { concept: 'Power Gorilla', emoji: '🦍' },
    ph: { concept: 'Power Horse', emoji: '🐎' },
    pi: { concept: 'Power Iguana', emoji: '🦎' },
    pj: { concept: 'Power Jaguar', emoji: '🐆' },
    pk: { concept: 'Power Koala', emoji: '🐨' },
    pl: { concept: 'Power Lion', emoji: '🦁' },
    pm: { concept: 'Power Mammoth', emoji: '🦣' },
    pn: { concept: 'Power Narwhal', emoji: '🐋' },
    po: { concept: 'Power Owl', emoji: '🦉' },
    pp: { concept: 'Power Panda', emoji: '🐼' },
    pq: { concept: 'Power Quest', emoji: '⚡' },
    pr: { concept: 'Power Ram', emoji: '🐏' },
    ps: { concept: 'Power Shark', emoji: '🦈' },
    pt: { concept: 'Power Tiger', emoji: '🐯' },
    pu: { concept: 'Power Unicorn', emoji: '🦄' },
    pv: { concept: 'Power Viper', emoji: '🐍' },
    pw: { concept: 'Pack Wolf', emoji: '🐺' },
    px: { concept: 'Power Ox', emoji: '🐂' },
    py: { concept: 'Power Yak', emoji: '🦬' },
    pz: { concept: 'Power Zebra', emoji: '🦓' },

    qa: { concept: 'Quantum Adventure', emoji: '🔬' },
    qb: { concept: 'Quantum Bear', emoji: '🐻' },
    qc: { concept: 'Quantum Cat', emoji: '🐈' },
    qd: { concept: 'Quantum Dragon', emoji: '🐉' },
    qe: { concept: 'Quantum Eagle', emoji: '🦅' },
    qf: { concept: 'Quantum Fox', emoji: '🦊' },
    qg: { concept: 'Quantum Gorilla', emoji: '🦍' },
    qh: { concept: 'Quantum Horse', emoji: '🐎' },
    qi: { concept: 'Quantum Iguana', emoji: '🦎' },
    qj: { concept: 'Quantum Jaguar', emoji: '🐆' },
    qk: { concept: 'Quantum Koala', emoji: '🐨' },
    ql: { concept: 'Quantum Lion', emoji: '🦁' },
    qm: { concept: 'Quantum Mammoth', emoji: '🦣' },
    qn: { concept: 'Quantum Narwhal', emoji: '🐋' },
    qo: { concept: 'Quantum Owl', emoji: '🦉' },
    qp: { concept: 'Quantum Panda', emoji: '🐼' },
    qq: { concept: 'Quantum Quest', emoji: '🔬' },
    qr: { concept: 'Quantum Ram', emoji: '🐏' },
    qs: { concept: 'Quantum Shark', emoji: '🦈' },
    qt: { concept: 'Quantum Tiger', emoji: '🐯' },
    qu: { concept: 'Quantum Unicorn', emoji: '🦄' },
    qv: { concept: 'Quantum Viper', emoji: '🐍' },
    qw: { concept: 'Quantum Wolf', emoji: '🐺' },
    qx: { concept: 'Quantum Ox', emoji: '🐂' },
    qy: { concept: 'Quantum Yak', emoji: '🦬' },
    qz: { concept: 'Quantum Zebra', emoji: '🦓' },

    ra: { concept: 'Royal Adventure', emoji: '👑' },
    rb: { concept: 'Royal Bear', emoji: '🐻' },
    rc: { concept: 'Royal Cat', emoji: '🐈' },
    rd: { concept: 'Royal Dragon', emoji: '🐉' },
    re: { concept: 'Royal Eagle', emoji: '🦅' },
    rf: { concept: 'Red Fox', emoji: '🦊' },
    rg: { concept: 'Royal Gorilla', emoji: '🦍' },
    rh: { concept: 'Royal Horse', emoji: '🐎' },
    ri: { concept: 'Royal Iguana', emoji: '🦎' },
    rj: { concept: 'Royal Jaguar', emoji: '🐆' },
    rk: { concept: 'Royal Koala', emoji: '🐨' },
    rl: { concept: 'Royal Lion', emoji: '🦁' },
    rm: { concept: 'Royal Mammoth', emoji: '🦣' },
    rn: { concept: 'Royal Narwhal', emoji: '🐋' },
    ro: { concept: 'Royal Owl', emoji: '🦉' },
    rp: { concept: 'Royal Panda', emoji: '🐼' },
    rq: { concept: 'Royal Quest', emoji: '👑' },
    rr: { concept: 'Royal Ram', emoji: '🐏' },
    rs: { concept: 'Royal Shark', emoji: '🦈' },
    rt: { concept: 'Royal Tiger', emoji: '🐯' },
    ru: { concept: 'Royal Unicorn', emoji: '🦄' },
    rv: { concept: 'Royal Viper', emoji: '🐍' },
    rw: { concept: 'Royal Wolf', emoji: '🐺' },
    rx: { concept: 'Royal Ox', emoji: '🐂' },
    ry: { concept: 'Royal Yak', emoji: '🦬' },
    rz: { concept: 'Royal Zebra', emoji: '🦓' },

    sa: { concept: 'Storm Adventure', emoji: '⛈️' },
    sb: { concept: 'Storm Bear', emoji: '🐻' },
    sc: { concept: 'Storm Cat', emoji: '🐈' },
    sd: { concept: 'Storm Dragon', emoji: '🐉' },
    se: { concept: 'Storm Eagle', emoji: '🦅' },
    sf: { concept: 'Storm Fox', emoji: '🦊' },
    sg: { concept: 'Storm Gorilla', emoji: '🦍' },
    sh: { concept: 'Storm Horse', emoji: '🐎' },
    si: { concept: 'Storm Iguana', emoji: '🦎' },
    sj: { concept: 'Storm Jaguar', emoji: '🐆' },
    sk: { concept: 'Storm Koala', emoji: '🐨' },
    sl: { concept: 'Storm Lion', emoji: '🦁' },
    sm: { concept: 'Storm Mammoth', emoji: '🦣' },
    sn: { concept: 'Storm Narwhal', emoji: '🐋' },
    so: { concept: 'Storm Owl', emoji: '🦉' },
    sp: { concept: 'Storm Panda', emoji: '🐼' },
    sq: { concept: 'Storm Quest', emoji: '⛈️' },
    sr: { concept: 'Storm Ram', emoji: '🐏' },
    ss: { concept: 'Storm Shark', emoji: '🦈' },
    st: { concept: 'Storm Tiger', emoji: '🐯' },
    su: { concept: 'Storm Unicorn', emoji: '🦄' },
    sv: { concept: 'Storm Viper', emoji: '🐍' },
    sw: { concept: 'Storm Wolf', emoji: '🐺' },
    sx: { concept: 'Storm Ox', emoji: '🐂' },
    sy: { concept: 'Storm Yak', emoji: '🦬' },
    sz: { concept: 'Storm Zebra', emoji: '🦓' },

    ta: { concept: 'Thunder Adventure', emoji: '⚡' },
    tb: { concept: 'Thunder Bear', emoji: '🐻' },
    tc: { concept: 'Thunder Cat', emoji: '🐈' },
    td: { concept: 'Tidal Dive', emoji: '🐬' },
    te: { concept: 'Thunder Eagle', emoji: '🦅' },
    tf: { concept: 'Thunder Fox', emoji: '🦊' },
    tg: { concept: 'Thunder Gorilla', emoji: '🦍' },
    th: { concept: 'Thunder Horse', emoji: '🐎' },
    ti: { concept: 'Thunder Iguana', emoji: '🦎' },
    tj: { concept: 'Thunder Jaguar', emoji: '🐆' },
    tk: { concept: 'Thunder Koala', emoji: '🐨' },
    tl: { concept: 'Thunder Lion', emoji: '🦁' },
    tm: { concept: 'Thunder Mammoth', emoji: '🦣' },
    tn: { concept: 'Thunder Narwhal', emoji: '🐋' },
    to: { concept: 'Thunder Owl', emoji: '🦉' },
    tp: { concept: 'Thunder Panda', emoji: '🐼' },
    tq: { concept: 'Thunder Quest', emoji: '⚡' },
    tr: { concept: 'Thunder Ram', emoji: '🐏' },
    ts: { concept: 'Thunder Shark', emoji: '🦈' },
    tt: { concept: 'Thunder Tiger', emoji: '🐯' },
    tu: { concept: 'Thunder Unicorn', emoji: '🦄' },
    tv: { concept: 'Thunder Viper', emoji: '🐍' },
    tw: { concept: 'Thunder Wolf', emoji: '🐺' },
    tx: { concept: 'Thunder Ox', emoji: '🐂' },
    ty: { concept: 'Thunder Yak', emoji: '🦬' },
    tz: { concept: 'Thunder Zebra', emoji: '🦓' },

    ua: { concept: 'Ultra Adventure', emoji: '🚀' },
    ub: { concept: 'Ultra Bear', emoji: '🐻' },
    uc: { concept: 'Ultra Cat', emoji: '🐈' },
    ud: { concept: 'Ultra Dragon', emoji: '🐉' },
    ue: { concept: 'Ultra Eagle', emoji: '🦅' },
    uf: { concept: 'Ultra Fox', emoji: '🦊' },
    ug: { concept: 'Ultra Gorilla', emoji: '🦍' },
    uh: { concept: 'Ultra Horse', emoji: '🐎' },
    ui: { concept: 'Ultra Iguana', emoji: '🦎' },
    uj: { concept: 'Ultra Jaguar', emoji: '🐆' },
    uk: { concept: 'Ultra Koala', emoji: '🐨' },
    ul: { concept: 'Ultra Lion', emoji: '🦁' },
    um: { concept: 'Ultra Mammoth', emoji: '🦣' },
    un: { concept: 'Ultra Narwhal', emoji: '🐋' },
    uo: { concept: 'Ultra Owl', emoji: '🦉' },
    up: { concept: 'Ultra Panda', emoji: '🐼' },
    uq: { concept: 'Ultra Quest', emoji: '🚀' },
    ur: { concept: 'Ultra Ram', emoji: '🐏' },
    us: { concept: 'Ultra Shark', emoji: '🦈' },
    ut: { concept: 'Ultra Tiger', emoji: '🐯' },
    uu: { concept: 'Ultra Unicorn', emoji: '🦄' },
    uv: { concept: 'Ultra Viper', emoji: '🐍' },
    uw: { concept: 'Ultra Wolf', emoji: '🐺' },
    ux: { concept: 'Ultra Ox', emoji: '🐂' },
    uy: { concept: 'Ultra Yak', emoji: '🦬' },
    uz: { concept: 'Ultra Zebra', emoji: '🦓' },

    va: { concept: 'Victory Adventure', emoji: '🏆' },
    vb: { concept: 'Victory Bear', emoji: '🐻' },
    vc: { concept: 'Victory Cat', emoji: '🐈' },
    vd: { concept: 'Victory Dragon', emoji: '🐉' },
    ve: { concept: 'Victory Eagle', emoji: '🦅' },
    vf: { concept: 'Victory Fox', emoji: '🦊' },
    vg: { concept: 'Victory Gorilla', emoji: '🦍' },
    vh: { concept: 'Victory Horse', emoji: '🐎' },
    vi: { concept: 'Victory Iguana', emoji: '🦎' },
    vj: { concept: 'Victory Jaguar', emoji: '🐆' },
    vk: { concept: 'Victory Koala', emoji: '🐨' },
    vl: { concept: 'Victory Lion', emoji: '🦁' },
    vm: { concept: 'Victory Mammoth', emoji: '🦣' },
    vn: { concept: 'Victory Narwhal', emoji: '🐋' },
    vo: { concept: 'Victory Owl', emoji: '🦉' },
    vp: { concept: 'Victory Panda', emoji: '🐼' },
    vq: { concept: 'Victory Quest', emoji: '🏆' },
    vr: { concept: 'Victory Ram', emoji: '🐏' },
    vs: { concept: 'Victory Shark', emoji: '🦈' },
    vt: { concept: 'Victory Tiger', emoji: '🐯' },
    vu: { concept: 'Victory Unicorn', emoji: '🦄' },
    vv: { concept: 'Victory Viper', emoji: '🐍' },
    vw: { concept: 'Victory Wolf', emoji: '🐺' },
    vx: { concept: 'Victory Ox', emoji: '🐂' },
    vy: { concept: 'Victory Yak', emoji: '🦬' },
    vz: { concept: 'Victory Zebra', emoji: '🦓' },

    wa: { concept: 'Wild Adventure', emoji: '🌿' },
    wb: { concept: 'Wild Bear', emoji: '🐻' },
    wc: { concept: 'Wild Cat', emoji: '🐈' },
    wd: { concept: 'Wild Dragon', emoji: '🐉' },
    we: { concept: 'Wild Eagle', emoji: '🦅' },
    wf: { concept: 'Wild Fox', emoji: '🦊' },
    wg: { concept: 'Wild Gorilla', emoji: '🦍' },
    wh: { concept: 'Wild Horse', emoji: '🐎' },
    wi: { concept: 'Wild Iguana', emoji: '🦎' },
    wj: { concept: 'Wild Jaguar', emoji: '🐆' },
    wk: { concept: 'Wild Koala', emoji: '🐨' },
    wl: { concept: 'Wild Lion', emoji: '🦁' },
    wm: { concept: 'Wild Mammoth', emoji: '🦣' },
    wn: { concept: 'Wild Narwhal', emoji: '🐋' },
    wo: { concept: 'Wild Owl', emoji: '🦉' },
    wp: { concept: 'Wild Panda', emoji: '🐼' },
    wq: { concept: 'Wild Quest', emoji: '🌿' },
    wr: { concept: 'Wild Ram', emoji: '🐏' },
    ws: { concept: 'White Shark', emoji: '🦈' },
    wt: { concept: 'Wild Tiger', emoji: '🐯' },
    wu: { concept: 'Wild Unicorn', emoji: '🦄' },
    wv: { concept: 'Wild Viper', emoji: '🐍' },
    ww: { concept: 'Wild Wolf', emoji: '🐺' },
    wx: { concept: 'Wild Ox', emoji: '🐂' },
    wy: { concept: 'Wild Yak', emoji: '🦬' },
    wz: { concept: 'Wild Zebra', emoji: '🦓' },

    xa: { concept: 'Xenon Adventure', emoji: '💎' },
    xb: { concept: 'Xenon Bear', emoji: '🐻' },
    xc: { concept: 'Xenon Cat', emoji: '🐈' },
    xd: { concept: 'Xenon Dragon', emoji: '🐉' },
    xe: { concept: 'Xenon Eagle', emoji: '🦅' },
    xf: { concept: 'Xenon Fox', emoji: '🦊' },
    xg: { concept: 'Xenon Gorilla', emoji: '🦍' },
    xh: { concept: 'Xenon Horse', emoji: '🐎' },
    xi: { concept: 'Xenon Iguana', emoji: '🦎' },
    xj: { concept: 'Xenon Jaguar', emoji: '🐆' },
    xk: { concept: 'Xenon Koala', emoji: '🐨' },
    xl: { concept: 'Xenon Lion', emoji: '🦁' },
    xm: { concept: 'Xenon Mammoth', emoji: '🦣' },
    xn: { concept: 'Xenon Narwhal', emoji: '🐋' },
    xo: { concept: 'Xenon Owl', emoji: '🦉' },
    xp: { concept: 'Xenon Panda', emoji: '🐼' },
    xq: { concept: 'Xenon Quest', emoji: '💎' },
    xr: { concept: 'Xenon Ram', emoji: '🐏' },
    xs: { concept: 'Xenon Shark', emoji: '🦈' },
    xt: { concept: 'Xenon Tiger', emoji: '🐯' },
    xu: { concept: 'Xenon Unicorn', emoji: '🦄' },
    xv: { concept: 'Xenon Viper', emoji: '🐍' },
    xw: { concept: 'Xenon Wolf', emoji: '🐺' },
    xx: { concept: 'Xenon Ox', emoji: '🐂' },
    xy: { concept: 'Xenon Yak', emoji: '🦬' },
    xz: { concept: 'Xenon Zebra', emoji: '🦓' },

    ya: { concept: 'Yonder Adventure', emoji: '🌅' },
    yb: { concept: 'Yonder Bear', emoji: '🐻' },
    yc: { concept: 'Yonder Cat', emoji: '🐈' },
    yd: { concept: 'Yonder Dragon', emoji: '🐉' },
    ye: { concept: 'Yonder Eagle', emoji: '🦅' },
    yf: { concept: 'Yonder Fox', emoji: '🦊' },
    yg: { concept: 'Yonder Gorilla', emoji: '🦍' },
    yh: { concept: 'Yonder Horse', emoji: '🐎' },
    yi: { concept: 'Yonder Iguana', emoji: '🦎' },
    yj: { concept: 'Yonder Jaguar', emoji: '🐆' },
    yk: { concept: 'Yonder Koala', emoji: '🐨' },
    yl: { concept: 'Yonder Lion', emoji: '🦁' },
    ym: { concept: 'Yonder Mammoth', emoji: '🦣' },
    yn: { concept: 'Yonder Narwhal', emoji: '🐋' },
    yo: { concept: 'Yonder Owl', emoji: '🦉' },
    yp: { concept: 'Yonder Panda', emoji: '🐼' },
    yq: { concept: 'Yonder Quest', emoji: '🌅' },
    yr: { concept: 'Yonder Ram', emoji: '🐏' },
    ys: { concept: 'Yonder Shark', emoji: '🦈' },
    yt: { concept: 'Yonder Tiger', emoji: '🐯' },
    yu: { concept: 'Yonder Unicorn', emoji: '🦄' },
    yv: { concept: 'Yonder Viper', emoji: '🐍' },
    yw: { concept: 'Yonder Wolf', emoji: '🐺' },
    yx: { concept: 'Yonder Ox', emoji: '🐂' },
    yy: { concept: 'Yonder Yak', emoji: '🦬' },
    yz: { concept: 'Yonder Zebra', emoji: '🦓' },

    za: { concept: 'Zenith Adventure', emoji: '⭐' },
    zb: { concept: 'Zenith Bear', emoji: '🐻' },
    zc: { concept: 'Zenith Cat', emoji: '🐈' },
    zd: { concept: 'Zenith Dragon', emoji: '🐉' },
    ze: { concept: 'Zenith Eagle', emoji: '🦅' },
    zf: { concept: 'Zenith Fox', emoji: '🦊' },
    zg: { concept: 'Zenith Gorilla', emoji: '🦍' },
    zh: { concept: 'Zenith Horse', emoji: '🐎' },
    zi: { concept: 'Zenith Iguana', emoji: '🦎' },
    zj: { concept: 'Zenith Jaguar', emoji: '🐆' },
    zk: { concept: 'Zenith Koala', emoji: '🐨' },
    zl: { concept: 'Zenith Lion', emoji: '🦁' },
    zm: { concept: 'Zenith Mammoth', emoji: '🦣' },
    zn: { concept: 'Zenith Narwhal', emoji: '🐋' },
    zo: { concept: 'Zenith Owl', emoji: '🦉' },
    zp: { concept: 'Zenith Panda', emoji: '🐼' },
    zq: { concept: 'Zenith Quest', emoji: '⭐' },
    zr: { concept: 'Zenith Ram', emoji: '🐏' },
    zs: { concept: 'Zenith Shark', emoji: '🦈' },
    zt: { concept: 'Zenith Tiger', emoji: '🐯' },
    zu: { concept: 'Zenith Unicorn', emoji: '🦄' },
    zv: { concept: 'Zenith Viper', emoji: '🐍' },
    zw: { concept: 'Zenith Wolf', emoji: '🐺' },
    zx: { concept: 'Zenith Ox', emoji: '🐂' },
    zy: { concept: 'Zenith Yak', emoji: '🦬' },
    zz: { concept: 'Zenith Zebra', emoji: '🦓' },
  }

  const mapped = emojiMap[combo]
  if (mapped) {
    return mapped.emoji
  }

  return getRandomAvatar()
}

export const INITIAL_PORTFOLIO_VALUE = 100000

export function calculatePortfolioValue(
  positions: Array<{ allocation: number; currentPrice: number; entryPrice: number }>,
  initialValue: number = INITIAL_PORTFOLIO_VALUE
): { currentValue: number; totalReturn: number; totalReturnPercent: number } {
  const currentValue = positions.reduce((sum, pos) => {
    const shares = (pos.allocation / 100) * initialValue / pos.entryPrice
    return sum + shares * pos.currentPrice
  }, 0)
  
  const totalReturn = currentValue - initialValue
  const totalReturnPercent = (totalReturn / initialValue) * 100
  
  return { currentValue, totalReturn, totalReturnPercent }
}

export function getReversedAvatar(email: string): { emoji: string; concept: string; message: string } {
  if (!email || email.length < 2) {
    return {
      emoji: '🦄',
      concept: 'Mysterious Unicorn',
      message: "No email? Fine, you're a unicorn now. Mysterious and slightly mythical. Don't ask questions."
    }
  }

  const cleanEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (cleanEmail.length < 2) {
    return {
      emoji: '🦄',
      concept: 'Mysterious Unicorn',
      message: "Your email's too weird to decode. Unicorn it is! 🦄"
    }
  }

  const firstChar = cleanEmail[cleanEmail.length - 1]
  const lastChar = cleanEmail[0]
  const reversedCombo = firstChar + lastChar

  const emojiMap: Record<string, { concept: string; emoji: string }> = {
    sg: { concept: 'Snorkeling Gecko', emoji: '🦎' },
    dt: { concept: 'Desert Tortoise', emoji: '🐢' },
  }

  const reverseMap: Record<string, { concept: string; emoji: string }> = {}
  Object.entries(emojiMap).forEach(([key, value]) => {
    const reversed = key.split('').reverse().join('')
    reverseMap[reversed] = value
  })

  const allAnimals = ['🦎', '🐢', '🦀', '🦑', '🐙', '🦐', '🐡', '🐠', '🦞', '🐚', '🦗', '🕷️', '🦂', '🐛', '🦋', '🐌', '🐞', '🦆', '🦢', '🦩', '🦚']
  
  const charSum = reversedCombo.charCodeAt(0) + reversedCombo.charCodeAt(1)
  const selectedEmoji = allAnimals[charSum % allAnimals.length]
  
  const messages = [
    `Plot twist! Instead of ${reversedCombo.toUpperCase()}, you got the complete opposite. Bet you didn't see that coming! 😏`,
    `We flipped your email logic backwards and this is what the universe gave you. Don't blame us, blame math! 🎲`,
    `Your original avatar was too mainstream. We reversed the algorithm and now you're this. You're welcome. 😎`,
    `Surprise! We took your email, flipped it, and boom - totally different vibe. Living your best backwards life! 🔄`,
    `The cosmos decided your email backwards made more sense. Who are we to argue with the universe? ✨`
  ]
  
  const selectedMessage = messages[charSum % messages.length]

  return {
    emoji: selectedEmoji,
    concept: `Reversed ${reversedCombo.toUpperCase()}`,
    message: selectedMessage
  }
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function cleanupOldMessages<T extends { timestamp: number }>(
  messages: T[],
  maxAgeMs: number = 90 * 24 * 60 * 60 * 1000
): T[] {
  const cutoffTime = Date.now() - maxAgeMs
  return messages.filter(msg => msg.timestamp > cutoffTime)
}

export function formatMessageTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return new Date(timestamp).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

import { SubscriptionTier, SubscriptionFeatures } from './types'

export const SUBSCRIPTION_PRICING = {
  free: { monthly: 0, annual: 0 },
  premium: { monthly: 9.99, annual: 99 }
}

export function getSubscriptionFeatures(tier: SubscriptionTier): SubscriptionFeatures {
  return {
    strategicInsights: true,
    groupChat: true,
    emailNotifications: true,
    maxGroups: -1,
    maxPortfolios: -1,
    historicalData: true,
    advancedAnalytics: true,
    prioritySupport: true
  }
}

export function isSubscriptionActive(endDate?: number): boolean {
  if (!endDate) return false
  return Date.now() < endDate
}

export function getSubscriptionDaysRemaining(endDate?: number): number {
  if (!endDate) return 0
  const remaining = endDate - Date.now()
  return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)))
}

export function calculateSubscriptionEndDate(months: number = 1): number {
  const now = new Date()
  now.setMonth(now.getMonth() + months)
  return now.getTime()
}

export function normalizePortfolioTo100k(positions: Array<{
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  quantity: number
  averageCost: number
  currentPrice: number
  marketValue: number
  totalReturn: number
  totalReturnPercent: number
}>): Array<{
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  allocation: number
  entryPrice: number
  currentPrice: number
  shares: number
  value: number
  returnPercent: number
  returnValue: number
}> {
  const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0)
  
  if (totalValue === 0) {
    return []
  }

  return positions.map(pos => {
    const allocation = (pos.marketValue / totalValue) * 100
    const normalizedValue = (allocation / 100) * INITIAL_PORTFOLIO_VALUE
    const shares = normalizedValue / pos.currentPrice
    const returnPercent = pos.totalReturnPercent
    const returnValue = normalizedValue * (returnPercent / 100)

    return {
      symbol: pos.symbol,
      name: pos.name,
      type: pos.type,
      allocation: parseFloat(allocation.toFixed(2)),
      entryPrice: pos.averageCost,
      currentPrice: pos.currentPrice,
      shares,
      value: normalizedValue,
      returnPercent,
      returnValue
    }
  })
}
