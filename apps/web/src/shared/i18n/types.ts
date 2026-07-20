export type AppLocale = 'en' | 'es';

export type MessageTree = {
  shell: {
    footerBy: string;
    footerContact: string;
    github: string;
    catalogCount: string;
    catalogCountAria: string;
  };
  nav: {
    primary: string;
    mobile: string;
    explore: string;
    products: string;
    players: string;
    brands: string;
    search: string;
    compare: string;
    builder: string;
    openMenu: string;
    closeMenu: string;
    language: string;
  };
  locale: {
    en: string;
    es: string;
  };
  category: {
    blade: string;
    rubber: string;
    ball: string;
    table: string;
    other: string;
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    browseProducts: string;
    openBuilder: string;
  };
  products: {
    eyebrow: string;
    title: string;
    loading: string;
    count: string;
    ittfAlert: string;
    discontinued: string;
    errorTitle: string;
    errorDescription: string;
    emptyTitle: string;
    emptyDescription: string;
    trySearch: string;
    goSearch: string;
  };
  productDetail: {
    eyebrow: string;
    loading: string;
    errorTitle: string;
    errorDescription: string;
    missingTitle: string;
    missingDescription: string;
    back: string;
    brand: string;
    images: string;
    source: string;
    ittf: string;
    discontinued: string;
  };
  ittf: {
    ariaLabel: string;
    coveringStatus: string;
    matched: string;
    code: string;
    detail: string;
    snapshot: string;
    listingChecklist: string;
    topSheetColors: string;
    spongeColors: string;
    expiresOn: string;
    oxVersion: string;
    oxYes: string;
    oxNo: string;
    approvalStatus: string;
    isActive: string;
    pimpleType: string;
    flagTrue: string;
    flagFalse: string;
    titleNotApproved: string;
    titleNotFound: string;
    titleExpired: string;
    titleInactive: string;
    titleDefault: string;
    titleApproved: string;
    bodyNotApproved: string;
    bodyNotFound: string;
    bodyExpired: string;
    bodyInactive: string;
    bodyDefault: string;
    bodyApproved: string;
  };
  discontinued: {
    ariaLabel: string;
    eyebrow: string;
    title: string;
    body: string;
    badge: string;
  };
  search: {
    eyebrow: string;
    title: string;
    description: string;
    placeholder: string;
    fieldLabel: string;
    loading: string;
    idleHint: string;
    errorTitle: string;
    errorDescription: string;
    emptyTitle: string;
    emptyDescription: string;
    noMatchesEyebrow: string;
    noMatchesTitle: string;
    noMatchesDescription: string;
    browseProducts: string;
  };
  players: {
    title: string;
    description: string;
    detailEyebrow: string;
    detailTitle: string;
    detailDescription: string;
  };
  brands: {
    title: string;
    description: string;
  };
  compare: {
    title: string;
    description: string;
  };
  builder: {
    eyebrow: string;
    title: string;
    description: string;
    reset: string;
    loading: string;
    paletteAria: string;
    errorTitle: string;
    errorDescription: string;
    goProducts: string;
    bladeLabel: string;
    bladeHint: string;
    fhLabel: string;
    fhHint: string;
    bhLabel: string;
    bhHint: string;
    needBladeHandle: string;
    needFh: string;
    needSetupForPhoto: string;
    handleStep: string;
    handleHint: string;
    handles: {
      FL: string;
      ST: string;
      AN: string;
      CS: string;
      PH: string;
    };
    searchPlaceholder: string;
    completePrevious: string;
    clear: string;
    selected: string;
    openSearch: string;
    noMatches: string;
    emptyBlades: string;
    emptyRubbers: string;
    ittfAlertAria: string;
    ittfAlertEyebrow: string;
    ittfAlertFh: string;
    ittfAlertBh: string;
    ittfListingEyebrow: string;
    discontinuedAlertAria: string;
    discontinuedAlertEyebrow: string;
    discontinuedAlertBlade: string;
    discontinuedAlertFh: string;
    discontinuedAlertBh: string;
    discontinuedAlertTitle: string;
    discontinuedAlertBody: string;
    photo: {
      label: string;
      hint: string;
      upload: string;
      change: string;
      nameLabel: string;
      namePlaceholder: string;
      zoom: string;
      zoomOut: string;
      zoomIn: string;
      dragHint: string;
      ready: string;
      remove: string;
      locked: string;
    };
    preview: {
      eyebrow: string;
      title: string;
      description: string;
      uploadPhoto: string;
      noBlade: string;
      noRubber: string;
      defaultName: string;
      blade: string;
      forehand: string;
      backhand: string;
      shareEyebrow: string;
      share: string;
      generating: string;
      downloadPng: string;
      needGear: string;
      shared: string;
      downloadedShare: string;
      downloaded: string;
      shareFailed: string;
      generateFailed: string;
      ittfAlertAria: string;
      ittfAlertEyebrow: string;
      ittfListingEyebrow: string;
      discontinuedAlertAria: string;
      discontinuedAlertEyebrow: string;
    };
  };
};

export type TranslateFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

/** Dot-path keys into MessageTree (e.g. `nav.products`). */
export type MessageKey = FlattenKeys<MessageTree>;

type FlattenKeys<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: FlattenKeys<
        T[K],
        Prefix extends '' ? K : `${Prefix}.${K}`
      >;
    }[keyof T & string];
